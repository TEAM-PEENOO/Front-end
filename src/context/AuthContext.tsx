// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth';
import { registerForceLogout } from '../api/authCallbacks';
import { User } from '../types';

/**
 * 현재 창이 OAuth 팝업인지 확인.
 * 팝업은 URL에 access_token 파라미터를 가지고 있으며,
 * 초기 auth check를 실행하면 localStorage를 공유하기 때문에
 * parent의 loginWithToken과 race condition을 일으켜 토큰을 삭제할 수 있음.
 */
function isOAuthCallbackPopup(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace('#', '?').slice(1));
  return params.has('access_token') || hash.has('access_token');
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 토큰으로 사용자 정보 복원
  useEffect(() => {
    // OAuth 팝업 창은 초기 auth check를 건너뜀
    if (isOAuthCallbackPopup()) {
      setIsLoading(false);
      return;
    }

    (async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // 토큰이 있으면 즉시 로그인 처리 → SubjectList로 이동
      setUser({ id: '', email: '', created_at: '' } as User);
      setIsLoading(false);

      // 백그라운드에서 실제 사용자 정보 로드
      authApi.me()
        .then(me => setUser(me))
        .catch(async (e) => {
          // 401 = 토큰 만료/무효 → 로그아웃 처리
          if (e?.response?.status === 401) {
            await AsyncStorage.removeItem('access_token');
            setUser(null);
          }
          // 그 외 네트워크 오류는 무시 (로그인 상태 유지)
        });
    })();
  }, []);

  /** 백엔드 OAuth redirect로부터 받은 JWT 토큰을 저장하고 사용자 정보 로드 */
  const loginWithToken = useCallback(async (token: string) => {
    await authApi.saveToken(token);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
      return;
    }
    setUser(null);
  }, []);

  // 401 발생 시 인터셉터가 호출할 수 있도록 등록
  useEffect(() => {
    registerForceLogout(() => {
      authApi.logout().catch(() => {});
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.reload();
        return;
      }
      setUser(null);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
