// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth';
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
    // OAuth 팝업 창은 초기 auth check를 건너뜀:
    // 팝업과 parent가 localStorage를 공유하기 때문에, 팝업에서 authApi.me()를
    // 호출하면 parent의 loginWithToken과 race condition이 발생해
    // 토큰을 삭제(401 interceptor)해버릴 수 있음.
    if (isOAuthCallbackPopup()) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          const me = await authApi.me();
          setUser(me);
        }
      } catch {
        await AsyncStorage.removeItem('access_token');
      } finally {
        setIsLoading(false);
      }
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
    setUser(null);
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
