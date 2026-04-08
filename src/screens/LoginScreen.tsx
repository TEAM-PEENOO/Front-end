// src/screens/LoginScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.logoContainer}>
          <FontAwesome5 name="seedling" size={80} color={colors.primary} style={styles.logoIcon} />
          <Text style={styles.title}>나만의 과외</Text>
          <Text style={styles.subtitle}>My Personel Tutor</Text>
          <Text style={styles.description}>
            내가 선생님이 되어 AI 제자를 키우는 특별한 경험
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: '#FEE500', borderColor: '#E5CD00' }]}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <FontAwesome5 name="comment" size={20} color="#3C1E1E" style={styles.btnIcon} />
            <Text style={[styles.loginBtnText, { color: '#3C1E1E' }]}>카카오 계정으로 시작</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: '#FFFFFF', borderColor: '#E5D6C5' }]}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <FontAwesome5 name="google" size={20} color="#EA4335" style={styles.btnIcon} />
            <Text style={[styles.loginBtnText, { color: colors.textDark }]}>Google 계정으로 시작</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: '#000000', borderColor: '#333' }]}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <FontAwesome5 name="apple" size={24} color="#FFF" style={styles.btnIcon} />
            <Text style={[styles.loginBtnText, { color: '#FFF' }]}>Apple로 시작</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF3E0',
  },
  container: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  title: {
    fontFamily: 'Jua_400Regular',
    fontSize: 48,
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: '#8C7A5E',
    marginBottom: 24,
  },
  description: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: colors.textDark,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 40,
    gap: 16,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  btnIcon: {
    position: 'absolute',
    left: 24,
  },
  loginBtnText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
  },
});
