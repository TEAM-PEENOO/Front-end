import React from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import { GamjaFlower_400Regular } from '@expo-google-fonts/gamja-flower';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';

// 웹 플랫폼에서 OAuth 리디렉션 완료 처리 (반드시 최상단에 위치)
WebBrowser.maybeCompleteAuthSession();

// COOP 헤더로 인해 window.opener가 끊기는 문제 대응:
// 팝업 창에서 콜백 URL로 돌아왔을 때 BroadcastChannel로 부모 창에 토큰 전달
if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace('#', '?').slice(1));
  const token = params.get('access_token') || hash.get('access_token');
  // window.name === 'google_oauth': window.open() 시 지정한 이름으로 팝업 여부 확인 (경로 무관하게 신뢰성 높음)
  // pathname 체크는 fallback으로 유지
  const isOAuthPopup = window.name === 'google_oauth' || window.location.pathname.includes('auth/callback');
  if (token && isOAuthPopup) {
    try {
      const bc = new BroadcastChannel('oauth_callback');
      bc.postMessage({ access_token: token });
      // 메시지 전달 후 약간의 딜레이를 두고 닫기 (브라우저별 전달 보장)
      setTimeout(() => { bc.close(); window.close(); }, 300);
    } catch (_) {
      window.close();
    }
  }
}

import { AuthProvider, useAuth } from './src/context/AuthContext';

import { LoginScreen } from './src/screens/LoginScreen';
import { SubjectListScreen } from './src/screens/SubjectListScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { CurriculumSetupScreen } from './src/screens/CurriculumSetupScreen';
import { StageSetupScreen } from './src/screens/StageSetupScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ExamScreen } from './src/screens/ExamScreen';
import { ExamResultScreen } from './src/screens/ExamResultScreen';
import { WeaknessNoteScreen } from './src/screens/WeaknessNoteScreen';
import { GrowthTimelineScreen } from './src/screens/GrowthTimelineScreen';
import { SyllabusScreen } from './src/screens/SyllabusScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';

import { colors } from './src/theme/colors';

export type RootStackParamList = {
  // ── 미인증 ──────────────────────────────────────────
  Login: undefined;

  // ── 인증 후 ─────────────────────────────────────────
  SubjectList: undefined;

  // ── 온보딩 플로우 ────────────────────────────────────
  Onboarding: { existingSubjectId?: string } | undefined;
  CurriculumSetup: {
    subjectId: string;
    subjectName: string;
    subjectDesc: string;
    studentName: string;
    gender: string;
    personality: string;
  };
  StageSetup: {
    subjectId: string;
    subjectName: string;
    subjectDesc: string;
    studentName: string;
    gender: string;
    personality: string;
    curriculumItems: any[];
  };

  // ── 메인 플로우 ──────────────────────────────────────
  Home: { subjectId: string };
  Chat: { subjectId: string; studentName: string; personality: string; subjectName: string };
  Exam: { subjectId: string; stageId: string; studentName: string; personality: string; subjectName: string };
  ExamResult: { subjectId: string; result: any; studentName: string; subjectName: string };
  Weakness: { subjectId: string; studentName: string };
  GrowthTimeline: { subjectId: string; studentName: string };
  Syllabus: { subjectId: string; studentName: string; subjectName: string };
  Practice: { subjectId: string; studentName: string; concept: string; tagId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/** 인증 상태에 따라 네비게이터를 분기 */
function AppNavigator() {
  const { user, isLoading } = useAuth();

  // 웹: localStorage에 access_token이 있으면 로딩 없이 즉시 과목선택 페이지로
  const hasStoredToken =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? !!localStorage.getItem('access_token')
      : false;

  const isAuthenticated = !!user || hasStoredToken;

  if (isLoading && !hasStoredToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF3E0' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={isAuthenticated ? 'authenticated' : 'unauthenticated'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      initialRouteName={isAuthenticated ? 'SubjectList' : 'Login'}
    >
      {isAuthenticated ? (
        // ── 인증된 사용자 ────────────────────────────────
        <>
          <Stack.Screen name="SubjectList" component={SubjectListScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="CurriculumSetup" component={CurriculumSetupScreen} />
          <Stack.Screen name="StageSetup" component={StageSetupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Exam" component={ExamScreen} />
          <Stack.Screen name="ExamResult" component={ExamResultScreen} />
          <Stack.Screen name="Weakness" component={WeaknessNoteScreen} />
          <Stack.Screen name="GrowthTimeline" component={GrowthTimelineScreen} />
          <Stack.Screen name="Syllabus" component={SyllabusScreen} />
          <Stack.Screen name="Practice" component={PracticeScreen} />
        </>
      ) : (
        // ── 미인증 ─────────────────────────────────────
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Jua_400Regular, GamjaFlower_400Regular });
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
