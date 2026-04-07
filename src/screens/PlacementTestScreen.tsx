// src/screens/PlacementTestScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { colors } from '../theme/colors';

export const PlacementTestScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { studentName, gender } = route.params || { studentName: '민이', gender: 'girl' };
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 10; // Max questions for CAT algorithm

  const handleOptionPress = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setTimeout(() => {
        navigation.navigate('PlacementResult', { studentName, gender });
      }, 500);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom: 16}}>
          <FontAwesome5 name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        {/* Progress header */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            문제 {currentQuestion} / {totalQuestions}
          </Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(currentQuestion / totalQuestions) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Chalkboard Question Area */}
        <View style={styles.boardContainer}>
          <Text style={styles.boardTitle}>선생님의 실력을 뽐내보세요!</Text>
          <Text style={styles.questionText}>
            어떤 수에 0.5를 곱하는 것과 같은 계산 결과를 내는 나눗셈 식을 고르세요.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <CustomButton
            title="1) 2로 나누기"
            variant="secondary"
            style={styles.optionButton}
            textStyle={styles.optionText}
            onPress={handleOptionPress}
          />
          <CustomButton
            title="2) 0.5로 나누기"
            variant="secondary"
            style={styles.optionButton}
            textStyle={styles.optionText}
            onPress={handleOptionPress}
          />
          <CustomButton
            title="3) 5로 나누기"
            variant="secondary"
            style={styles.optionButton}
            textStyle={styles.optionText}
            onPress={handleOptionPress}
          />
          <CustomButton
            title="4) 0.2로 나누기"
            variant="secondary"
            style={styles.optionButton}
            textStyle={styles.optionText}
            onPress={handleOptionPress}
          />
          <CustomButton
            title="5) 10으로 나누기"
            variant="secondary"
            style={styles.optionButton}
            textStyle={styles.optionText}
            onPress={handleOptionPress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  progressContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16, fontFamily: "Jua_400Regular",
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#EBEBEB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  boardContainer: {
    backgroundColor: colors.board, // Chalkboard color
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 6,
    borderColor: colors.secondaryDark, // Wood frame
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  boardTitle: {
    color: '#FFD166', // Chalk yellow
    fontSize: 14, fontFamily: "Jua_400Regular",
    fontWeight: 'bold',
    marginBottom: 16,
  },
  questionText: {
    color: '#FFFFFF', // Chalk white
    fontSize: 20, fontFamily: "Jua_400Regular",
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    justifyContent: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionText: {
    color: colors.textDark,
    fontSize: 16, fontFamily: "Jua_400Regular",
    fontWeight: '600',
  },
});
