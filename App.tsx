import React from 'react';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from './src/screens/LoginScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { CurriculumSetupScreen } from './src/screens/CurriculumSetupScreen';
import { StageSetupScreen } from './src/screens/StageSetupScreen';
import { PlacementTestScreen } from './src/screens/PlacementTestScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ExamScreen } from './src/screens/ExamScreen';
import { WeaknessNoteScreen } from './src/screens/WeaknessNoteScreen';
import { PlacementResultScreen } from './src/screens/PlacementResultScreen';
import { ExamResultScreen } from './src/screens/ExamResultScreen';
import { GrowthTimelineScreen } from './src/screens/GrowthTimelineScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { SyllabusScreen } from './src/screens/SyllabusScreen';

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  CurriculumSetup: { subjectName: string; subjectDesc: string; studentName: string; gender: string; personality: string };
  StageSetup: { subjectName: string; subjectDesc: string; studentName: string; gender: string; personality: string; curriculumItems: any[] };
  Home: { studentName: string; gender: string; subjectName: string; stages: any[] };
  Chat: { studentName: string; gender: string; subjectName: string; stages: any[] };
  GrowthTimeline: { studentName: string; stages: any[] };
  Weakness: { studentName: string; gender: string; subjectName?: string };
  PlacementTest: { studentName: string; gender: string };
  PlacementResult: { studentName: string; gender: string };
  Exam: { studentName: string; gender: string; subjectName: string; stages: any[] };
  ExamResult: { studentName: string; gender: string; subjectName: string; stages: any[] };
  Practice: { studentName: string; gender: string; concept: string };
  Syllabus: { studentName: string; gender: string; subjectName: string; stages: any[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Jua_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="CurriculumSetup" component={CurriculumSetupScreen} />
        <Stack.Screen name="StageSetup" component={StageSetupScreen} />
        <Stack.Screen name="PlacementTest" component={PlacementTestScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Exam" component={ExamScreen} />
        <Stack.Screen name="Weakness" component={WeaknessNoteScreen} />
        <Stack.Screen name="PlacementResult" component={PlacementResultScreen} />
        <Stack.Screen name="ExamResult" component={ExamResultScreen} />
        <Stack.Screen name="GrowthTimeline" component={GrowthTimelineScreen} />
        <Stack.Screen name="Practice" component={PracticeScreen} />
        <Stack.Screen name="Syllabus" component={SyllabusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
