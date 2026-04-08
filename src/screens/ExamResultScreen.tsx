// src/screens/ExamResultScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { GradeResult } from '../types';

export const ExamResultScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    subjectId,
    result,
    studentName = '민이',
    subjectName = '',
  }: { subjectId: string; result: GradeResult; studentName: string; subjectName: string } = route.params || {};

  const [showResult, setShowResult] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    setTimeout(() => {
      setShowResult(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, 1000);
  }, []);

  const passed = result?.passed ?? false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {!showResult ? (
          <View style={styles.analyzingBox}>
            <FontAwesome5 name="spinner" size={40} color={colors.primary} style={{ marginBottom: 16 }} />
            <Text style={styles.analyzingText}>시험 결과를 합산하는 중...</Text>
          </View>
        ) : (
          <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>

            <View style={styles.confettiHeader}>
              {passed && <>
                <FontAwesome5 name="star" size={24} color="#FFD166" style={{ position: 'absolute', top: -30, left: 20 }} />
                <FontAwesome5 name="star" size={32} color="#FFD166" style={{ position: 'absolute', top: -50, right: 30 }} />
              </>}
              <Text style={[styles.congratulationsText, !passed && { color: colors.error }]}>
                {passed ? '합격입니다!' : '아쉽지만 불합격'}
              </Text>
            </View>

            <View style={styles.scoreBoard}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreTitle}>선생님 점수</Text>
                <Text style={styles.scoreVal}>{result?.user_score ?? 0}점</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreTitle}>{studentName} 점수</Text>
                <Text style={styles.scoreVal}>{result?.persona_score ?? 0}점</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.scoreRow}>
                <Text style={styles.finalScoreTitle}>합산 최종 점수</Text>
                <Text style={[styles.finalScoreVal, !passed && { color: colors.error }]}>
                  {result?.combined_score ?? 0}점
                </Text>
              </View>
              <Text style={styles.thresholdText}>합격 기준: {result?.pass_threshold ?? 75}점</Text>
            </View>

            {result?.wrong_concepts?.length > 0 && (
              <View style={styles.wrongBox}>
                <Text style={styles.wrongTitle}>이번 시험 약점 개념</Text>
                {result.wrong_concepts.map((c, i) => (
                  <Text key={i} style={styles.wrongItem}>• {c}</Text>
                ))}
              </View>
            )}

            <View style={styles.celebrationBox}>
              <View style={[styles.avatarCircle, !passed && { borderColor: colors.error, backgroundColor: '#FFEBEE' }]}>
                <FontAwesome5 name={passed ? 'user-graduate' : 'redo-alt'} size={50} color={passed ? colors.primary : colors.error} />
              </View>
              <Text style={styles.celebrationMsg}>
                {passed
                  ? `"선생님 덕분에 다음 단계로 진급했어요!"`
                  : `"더 열심히 배워올게요. 다시 가르쳐주세요!"`
                }
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, !passed && { backgroundColor: colors.secondary }]}
              onPress={() => navigation.navigate('Home', { subjectId })}
            >
              <Text style={styles.buttonText}>
                {passed ? '다음 단계로 가기' : '다시 가르치러 가기'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
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
    justifyContent: 'center',
    padding: 24,
  },
  analyzingBox: {
    alignItems: 'center',
  },
  analyzingText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: '#8C7A5E',
  },
  resultContainer: {
    alignItems: 'center',
    width: '100%',
  },
  confettiHeader: {
    marginBottom: 32,
    position: 'relative',
    alignItems: 'center',
  },
  congratulationsText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 36,
    color: colors.error,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 2},
    textShadowRadius: 2,
  },
  scoreBoard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 3,
    borderColor: '#E5D6C5',
    marginBottom: 32,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#8C7A5E',
  },
  scoreVal: {
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: colors.textDark,
  },
  divider: {
    height: 2,
    backgroundColor: '#E5D6C5',
    marginVertical: 8,
    borderStyle: 'dashed',
  },
  finalScoreTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: colors.primary,
  },
  finalScoreVal: {
    fontFamily: 'Jua_400Regular',
    fontSize: 32,
    color: colors.primary,
  },
  thresholdText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 14,
    color: '#AAA',
    textAlign: 'right',
    marginTop: 4,
  },
  wrongBox: {
    width: '100%',
    backgroundColor: '#FFF3F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginBottom: 24,
  },
  wrongTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: colors.error,
    marginBottom: 8,
  },
  wrongItem: {
    fontFamily: 'Jua_400Regular',
    fontSize: 15,
    color: colors.textDark,
    lineHeight: 24,
  },
  celebrationBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E7F2EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#C6E0CE',
    marginBottom: 16,
  },
  celebrationMsg: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: colors.textDark,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#5A9362',
  },
  buttonText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: '#FFF',
  },
});
