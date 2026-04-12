// src/screens/LoginScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert, Animated, Easing, Dimensions, Platform,
  ImageBackground,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants';

const { width: SW } = Dimensions.get('window');

// 티-츄! 각 글자별 색상 (동물의 숲 톤)
const TITLE_CHARS = ['티', '-', '츄', '!'];
const TITLE_COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'];

// 장식 요소
const DECORATIONS = [
  { icon: 'leaf',      color: '#6BCB77', top: 0.08, left: 0.05,  size: 22, delay: 400 },
  { icon: 'star',      color: '#FFD93D', top: 0.12, right: 0.06, size: 18, delay: 600 },
  { icon: 'music',     color: '#FF6B6B', top: 0.18, left: 0.12,  size: 16, delay: 800 },
  { icon: 'cloud',     color: '#A8D8EA', top: 0.05, right: 0.15, size: 24, delay: 200 },
  { icon: 'seedling',  color: '#6BCB77', top: 0.22, right: 0.08, size: 20, delay: 1000 },
  { icon: 'heart',     color: '#FF6B9D', top: 0.28, left: 0.07,  size: 14, delay: 700 },
  { icon: 'sun',       color: '#FFD93D', top: 0.03, left: 0.35,  size: 26, delay: 300 },
];

export const LoginScreen: React.FC = () => {
  const { loginWithToken } = useAuth();
  const [loading, setLoading] = useState(false);

  // ── 애니메이션 값 ────────────────────────────────────────────
  // 각 글자 bounce-in
  const charAnims = useRef(TITLE_CHARS.map(() => new Animated.Value(0))).current;
  // 각 글자 wave (idle)
  const waveAnims = useRef(TITLE_CHARS.map(() => new Animated.Value(0))).current;
  // 장식 아이콘 fade + float
  const decoAnims = useRef(DECORATIONS.map(() => new Animated.Value(0))).current;
  // 전체 로고 + 서브타이틀 fade
  const logoAnim  = useRef(new Animated.Value(0)).current;
  const subAnim   = useRef(new Animated.Value(0)).current;
  const descAnim  = useRef(new Animated.Value(0)).current;
  const btnAnim   = useRef(new Animated.Value(0)).current;
  // 버튼 continuous bounce
  const btnBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. 장식 아이콘 fade-in (stagger)
    DECORATIONS.forEach((d, i) => {
      Animated.sequence([
        Animated.delay(d.delay),
        Animated.timing(decoAnims[i], { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();
    });

    // 2. 로고 아이콘
    Animated.sequence([
      Animated.delay(200),
      Animated.spring(logoAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
    ]).start();

    // 3. 글자 bounce-in (stagger)
    const charEntrance = TITLE_CHARS.map((_, i) =>
      Animated.sequence([
        Animated.delay(500 + i * 120),
        Animated.spring(charAnims[i], {
          toValue: 1, friction: 3, tension: 80, useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(charEntrance).start(() => {
      // 4. 글자 등장 후 wave 루프
      TITLE_CHARS.forEach((_, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 100),
            Animated.timing(waveAnims[i], { toValue: -10, duration: 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(waveAnims[i], { toValue: 0,  duration: 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ])
        ).start();
      });
    });

    // 5. 서브타이틀, 설명, 버튼 순차 fade-in
    Animated.sequence([
      Animated.delay(900),
      Animated.timing(subAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(descAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(btnAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // 6. 버튼 continuous gentle bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(btnBounce, { toValue: -5, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(btnBounce, { toValue: 0,  duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const redirectUri = Linking.createURL('auth/callback');
      const authUrl = `${API_BASE_URL}/auth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`;

      if (Platform.OS === 'web') {
        // COOP 헤더로 인해 window.opener / window.closed 접근이 막히는 문제 우회:
        // BroadcastChannel로 팝업 → 부모 창 간 동일 origin 통신 사용
        await new Promise<void>((resolve, reject) => {
          const channel = new BroadcastChannel('oauth_callback');
          let settled = false;

          const settle = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            channel.close();
          };

          channel.onmessage = async (event: MessageEvent) => {
            settle();
            const token: string | undefined = event.data?.access_token;
            if (token) {
              try { await loginWithToken(token); resolve(); }
              catch (e) { reject(e); }
            } else {
              resolve(); // 토큰 없음 → 취소로 처리
            }
          };

          // 팝업을 직접 열어 window.closed 폴링 의존성 제거
          window.open(authUrl, 'google_oauth', 'width=500,height=650,left=300,top=100');

          // 10분 타임아웃: 사용자가 팝업을 닫거나 미완료 시 로딩 해제
          const timer = setTimeout(() => { settle(); resolve(); }, 10 * 60 * 1000);
        });
      } else {
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
        if (result.type === 'success') {
          const url = new URL(result.url);
          const token = url.searchParams.get('access_token');
          if (!token) {
            Alert.alert('로그인 실패', '인증 토큰을 받지 못했어요. 다시 시도해주세요.');
            return;
          }
          await loginWithToken(token);
        } else if (result.type !== 'cancel') {
          Alert.alert('로그인 실패', '인증에 실패했어요. 다시 시도해주세요.');
        }
      }
    } catch {
      Alert.alert('오류', '서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const logoScale = logoAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1.2, 1] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../../assets/images/login_bg.png')}
        style={styles.bgImage}
        resizeMode="cover"
      >
      <View style={styles.container}>

        {/* 배경 장식 아이콘들 */}
        {DECORATIONS.map((d, i) => (
          <Animated.View
            key={i}
            style={[
              styles.decoIcon,
              {
                top:   d.top   ? SW * d.top   : undefined,
                left:  (d as any).left  !== undefined ? SW * (d as any).left  : undefined,
                right: (d as any).right !== undefined ? SW * (d as any).right : undefined,
                opacity: decoAnims[i],
                transform: [{
                  translateY: decoAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }),
                }],
              },
            ]}
          >
            <FontAwesome5 name={d.icon} size={d.size} color={d.color} solid />
          </Animated.View>
        ))}

        {/* 메인 콘텐츠 */}
        <View style={styles.centerArea}>
          {/* 로고 아이콘 */}
          <Animated.View style={{ transform: [{ scale: logoScale }], marginBottom: 12 }}>
            <View style={styles.logoCircle}>
              <FontAwesome5 name="seedling" size={52} color="#FFF" solid />
            </View>
          </Animated.View>

          {/* 티-츄! 글자별 색상 + 애니메이션 */}
          <View style={styles.titleRow}>
            {TITLE_CHARS.map((char, i) => (
              <Animated.Text
                key={i}
                style={[
                  styles.titleChar,
                  { color: TITLE_COLORS[i] },
                  {
                    transform: [
                      {
                        translateY: charAnims[i].interpolate({
                          inputRange: [0, 1], outputRange: [-80, 0],
                        }),
                      },
                      {
                        scale: charAnims[i].interpolate({
                          inputRange: [0, 0.7, 1], outputRange: [0.3, 1.15, 1],
                        }),
                      },
                      { translateY: waveAnims[i] },
                    ],
                    opacity: charAnims[i],
                  },
                ]}
              >
                {char}
              </Animated.Text>
            ))}
          </View>

          {/* 서브타이틀 */}
          <Animated.Text style={[styles.subtitle, { opacity: subAnim, transform: [{ translateY: subAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
            ✨ Teach You! ✨
          </Animated.Text>

          {/* 설명 */}
          <Animated.Text style={[styles.desc, { opacity: descAnim }]}>
            내가 선생님이 되어{'\n'}AI 제자를 직접 키우는 학습 앱
          </Animated.Text>
        </View>

        {/* 하단 버튼 */}
        <Animated.View
          style={[
            styles.bottomArea,
            {
              opacity: btnAnim,
              transform: [
                { translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
                { translateY: btnBounce },
              ],
            },
          ]}
        >

          <View style={styles.buttonCard}>
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
              로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의합니다.
            </Text>
          </View>
        </Animated.View>

      </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDE7',
  },
  bgImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 배경 장식
  decoIcon: {
    position: 'absolute',
    zIndex: 0,
  },
  // 중앙 영역
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    paddingTop: 40,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#6BCB77',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFF',
    shadowColor: '#6BCB77',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  // 제목 글자
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  titleChar: {
    fontFamily: 'GamjaFlower_400Regular',
    fontSize: 72,
    lineHeight: 80,
    includeFontPadding: false,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: '#FF9800',
    marginBottom: 12,
    letterSpacing: 2,
  },
  desc: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#795548',
    textAlign: 'center',
    lineHeight: 26,
  },
  // 하단
  bottomArea: {
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  grassRow: {
    flexDirection: 'row',
    marginBottom: -4,
  },
  grass: {
    fontSize: 22,
  },
  buttonCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 28,
    paddingHorizontal: 32,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 14,
    borderTopWidth: 3,
    borderColor: '#E8F5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  googleBtnText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: '#444',
  },
  terms: {
    fontFamily: 'Jua_400Regular',
    fontSize: 12,
    color: '#BDBDBD',
    textAlign: 'center',
  },
});
