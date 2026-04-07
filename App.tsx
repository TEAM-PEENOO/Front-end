import React from 'react';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from './src/screens/LoginScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { PlacementTestScreen } from './src/screens/PlacementTestScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ExamScreen } from './src/screens/ExamScreen';
import { WeaknessNoteScreen } from './src/screens/WeaknessNoteScreen';
import { PlacementResultScreen } from './src/screens/PlacementResultScreen';
import { ExamResultScreen } from './src/screens/ExamResultScreen';
import { GrowthTimelineScreen } from './src/screens/GrowthTimelineScreen';

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  PlacementTest: undefined;
  Home: undefined;
  Chat: undefined;
  Exam: undefined;
  Weakness: undefined;
  PlacementResult: undefined;
  ExamResult: undefined;
  GrowthTimeline: undefined;
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
        <Stack.Screen name="PlacementTest" component={PlacementTestScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Exam" component={ExamScreen} />
        <Stack.Screen name="Weakness" component={WeaknessNoteScreen} />
        <Stack.Screen name="PlacementResult" component={PlacementResultScreen} />
        <Stack.Screen name="ExamResult" component={ExamResultScreen} />
        <Stack.Screen name="GrowthTimeline" component={GrowthTimelineScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
