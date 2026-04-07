// src/screens/ExamResultScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const ExamResultScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [showConfetti, setShowConfetti] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Mock simulation of results analyzing, then BOOM confetti
    setTimeout(() => {
      setShowConfetti(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1500);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {!showConfetti ? (
          <View style={styles.analyzingBox}>
            <FontAwesome5 name="spinner" size={40} color={colors.primary} style={{marginBottom: 16}} />
            <Text style={styles.analyzingText}>시험 결과를 합산하는 중...</Text>
          </View>
        ) : (
          <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
            
            <View style={styles.confettiHeader}>
              <FontAwesome5 name="star" size={24} color="#FFD166" style={{position: 'absolute', top: -30, left: 20}} />
              <FontAwesome5 name="star" size={32} color="#FFD166" style={{position: 'absolute', top: -50, right: 30}} />
              <Text style={styles.congratulationsText}>🎉 합격입니다! 🎉</Text>
            </View>

            <View style={styles.scoreBoard}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreTitle}>선생님 점수</Text>
                <Text style={styles.scoreVal}>85점</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreTitle}>민이 점수</Text>
                <Text style={styles.scoreVal}>70점</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.scoreRow}>
                <Text style={styles.finalScoreTitle}>합산 최종 점수</Text>
                <Text style={styles.finalScoreVal}>79점</Text>
              </View>
            </View>

            <View style={styles.celebrationBox}>
              <View style={styles.avatarCircle}>
                <FontAwesome5 name="user-graduate" size={50} color={colors.primary} />
              </View>
              <Text style={styles.celebrationMsg}>"선생님 덕분에 6학년으로 진급했어요!"</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.buttonText}>새로운 교실로 이동하기</Text>
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
