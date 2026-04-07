// src/screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { colors } from '../theme/colors';

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [studentName, setStudentName] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl'>('girl'); // default girl

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={24} color={colors.textDark} />
        </TouchableOpacity>

        <View style={{flex: 1, justifyContent: 'center'}}>
          <View style={styles.header}>
            <Text style={styles.title}>아주 작은 학교에</Text>
            <Text style={styles.title}>오신 걸 환영해요!</Text>
            <Text style={styles.subtitle}>선생님의 첫 제자는 어떤 이름일까요?</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.genderToggleContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.genderBtn, gender === 'boy' && styles.genderBtnActiveBoy]}
                onPress={() => setGender('boy')}
              >
                <Text style={[styles.genderText, gender === 'boy' && styles.genderTextActive]}>👦 남학생</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.genderBtn, gender === 'girl' && styles.genderBtnActiveGirl]}
                onPress={() => setGender('girl')}
              >
                <Text style={[styles.genderText, gender === 'girl' && styles.genderTextActive]}>👧 여학생</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="제자의 이름을 지어주세요"
              value={studentName}
              onChangeText={setStudentName}
              placeholderTextColor="#ccc"
              maxLength={8}
            />
          </View>

          <View style={styles.actionContainer}>
            <CustomButton
              title="지금 만나러 가기 (배치고사 시작)"
              variant="primary"
              iconName="arrow-right"
              style={styles.button}
              onPress={() => {
                if(studentName.trim().length > 0) {
                  navigation.navigate('PlacementTest', { studentName, gender });
                }
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
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
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Jua_400Regular',
    fontSize: 32,
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#8C7A5E',
    marginTop: 16,
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
  },
  input: {
    fontFamily: 'Jua_400Regular',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#E5D6C5',
    borderRadius: 24,
    padding: 24,
    fontSize: 24,
    textAlign: 'center',
    color: colors.textDark,
    shadowColor: '#D4C5B3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  genderToggleContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 6,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#EAE1D3',
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  genderBtnActiveBoy: {
    backgroundColor: '#4DA8DA',
  },
  genderBtnActiveGirl: {
    backgroundColor: '#FF6B6B',
  },
  genderText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#A0A0A0',
  },
  genderTextActive: {
    color: '#FFF',
  },
  actionContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
    paddingVertical: 20,
  },
});
