// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

type Mode = 'login' | 'register';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        // AuthContext에서 user 세팅 → App.tsx의 네비게이터가 SubjectList로 보내줌
      } else {
        await register(email.trim(), password);
      }
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        Alert.alert('로그인 실패', '이메일 또는 비밀번호가 틀렸어요.');
      } else if (status === 409) {
        Alert.alert('회원가입 실패', '이미 가입된 이메일이에요. 로그인해주세요.');
        setMode('login');
      } else {
        Alert.alert('오류', '서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 로고 */}
        <View style={styles.logoContainer}>
          <FontAwesome5 name="seedling" size={72} color={colors.primary} />
          <Text style={styles.title}>나의 제자</Text>
          <Text style={styles.subtitle}>My Jeja</Text>
          <Text style={styles.desc}>내가 선생님이 되어{'\n'}AI 제자를 직접 키우는 학습 앱</Text>
        </View>

        {/* 카드 */}
        <View style={styles.card}>
          {/* 탭 전환 */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>로그인</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.tabActive]}
              onPress={() => setMode('register')}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>회원가입</Text>
            </TouchableOpacity>
          </View>

          {/* 이메일 */}
          <View style={styles.inputWrapper}>
            <FontAwesome5 name="envelope" size={16} color="#AAA" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#BBB"
            />
          </View>

          {/* 비밀번호 */}
          <View style={styles.inputWrapper}>
            <FontAwesome5 name="lock" size={16} color="#AAA" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              placeholderTextColor="#BBB"
            />
            <TouchableOpacity onPress={() => setShowPw(p => !p)} style={{ padding: 4 }}>
              <FontAwesome5 name={showPw ? 'eye-slash' : 'eye'} size={16} color="#AAA" />
            </TouchableOpacity>
          </View>

          {/* 제출 버튼 */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.submitText}>{mode === 'login' ? '로그인' : '회원가입'}</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF3E0' },
  container: { flex: 1, padding: 28, justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  title: { fontFamily: 'Jua_400Regular', fontSize: 44, color: colors.primary },
  subtitle: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#8C7A5E' },
  desc: {
    fontFamily: 'Jua_400Regular', fontSize: 15, color: colors.textDark,
    textAlign: 'center', lineHeight: 22, marginTop: 4,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    gap: 14,
  },
  tabRow: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#999' },
  tabTextActive: { color: '#FFF' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  inputIcon: { marginRight: 10 },
  input: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: colors.textDark,
    paddingVertical: 12,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: colors.secondaryDark,
  },
  submitText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#FFF' },
});
