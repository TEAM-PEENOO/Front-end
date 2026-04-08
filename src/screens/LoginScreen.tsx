// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../constants';

// 웹 OAuth 세션 완료 처리 (웹 플랫폼에서 필수)
WebBrowser.maybeCompleteAuthSession();

export const LoginScreen: React.FC = () => {
  const { loginWithToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // 백엔드 OAuth 완료 후 앱으로 돌아올 redirect URI
      // Expo Web: https://your-app.com/auth/callback
      // Native:   exp://... 또는 커스텀 스킴
      const redirectUri = Linking.createURL('auth/callback');

      // 백엔드 Google OAuth 시작 URL (redirect_uri를 쿼리로 전달)
      const authUrl =
        `${API_BASE_URL}/auth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success') {
        // 백엔드가 redirect_uri?access_token=<jwt> 형태로 돌려줌
        const url = new URL(result.url);
        const token = url.searchParams.get('access_token');

        if (!token) {
          Alert.alert('로그인 실패', '인증 토큰을 받지 못했어요. 다시 시도해주세요.');
          return;
        }

        await loginWithToken(token);
        // AuthContext의 user가 세팅되면 App.tsx 네비게이터가 SubjectList로 이동
      } else if (result.type === 'cancel') {
        // 사용자가 취소 — 별도 처리 불필요
      } else {
        Alert.alert('로그인 실패', '인증에 실패했어요. 다시 시도해주세요.');
      }
    } catch (e: any) {
      Alert.alert('오류', '서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 로고 영역 */}
        <View style={styles.logoContainer}>
          <FontAwesome5 name="seedling" size={80} color={colors.primary} />
          <Text style={styles.title}>나의 제자</Text>
          <Text style={styles.subtitle}>My Jeja</Text>
          <Text style={styles.desc}>
            내가 선생님이 되어{'\n'}AI 제자를 직접 키우는 학습 앱
          </Text>
        </View>

        {/* 로그인 버튼 영역 */}
        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={[styles.googleBtn, loading && { opacity: 0.7 }]}
            onPress={handleGoogleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#555" />
            ) : (
              <>
                <FontAwesome5 name="google" size={20} color="#555" style={{ marginRight: 12 }} />
                <Text style={styles.googleBtnText}>Google로 시작하기</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            로그인 시 서비스 이용약관 및 개인정보 처리방침에{'\n'}동의하는 것으로 간주됩니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF3E0' },
  container: { flex: 1, paddingHorizontal: 32, justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: 'Jua_400Regular',
    fontSize: 48,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: '#8C7A5E',
  },
  desc: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: colors.textDark,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },
  bottomArea: {
    width: '100%',
    paddingBottom: 48,
    alignItems: 'center',
    gap: 16,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  googleBtnText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#444',
  },
  terms: {
    fontFamily: 'Jua_400Regular',
    fontSize: 12,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 18,
  },
});
