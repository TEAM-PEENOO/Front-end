// src/screens/ExamScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { Avatar } from '../components/Avatar';
import { colors } from '../theme/colors';

export const ExamScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { gender = 'girl' } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Split View UI: Top for Teacher (User), Bottom for Student (AI) */}

        {/* Top: User's Exam */}
        <View style={styles.topHalf}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom: 10, alignSelf:'flex-start'}}>
            <FontAwesome5 name="arrow-left" size={24} color={'#fff'} />
          </TouchableOpacity>
          <View style={styles.examPaper}>
            <View style={styles.paperContent}>
              <Text style={styles.headerText}>나의 시험지 - 3번 문제</Text>
              <Text style={styles.questionText}>
                2.5 ÷ 0.5 의 값을 구하시오.
              </Text>
            <View style={styles.optionsGrid}>
                <CustomButton title="1) 5" variant="secondary" style={styles.optionGridBtn} textStyle={styles.optionText} />
                <CustomButton title="2) 0.5" variant="secondary" style={styles.optionGridBtn} textStyle={styles.optionText} />
                <CustomButton title="3) 25" variant="secondary" style={styles.optionGridBtn} textStyle={styles.optionText} />
                <CustomButton title="4) 1.25" variant="secondary" style={styles.optionGridBtn} textStyle={styles.optionText} />
            </View>
            <CustomButton title="답안 제출하기" variant="primary" style={{marginTop: 16}} onPress={() => navigation.navigate('ExamResult')} />
            </View>
          </View>
        </View>

        <View style={styles.divider}>
          <Text style={styles.dividerText}>VS</Text>
        </View>

        {/* Bottom: AI Student's progress */}
        <View style={styles.bottomHalf}>
          <View style={styles.studentArea}>
            <Avatar gender={gender} variant="face" size={80} style={styles.studentAvatar} />
            <View style={styles.studentThoughtBubble}>
              <Text style={styles.thoughtText}>
                음... 소수점 나눗셈... 선생님이 10을 곱하라고 하셨는데... 자릿수가 하나니까 10을 곱하면 25 ÷ 5 가 되나?
              </Text>
            </View>
          </View>
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
  },
  topHalf: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  examPaper: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  paperContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 14, fontFamily: "Jua_400Regular",
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 18, fontFamily: "Jua_400Regular",
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  optionGridBtn: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: colors.textDark,
  },
  divider: {
    height: 30,
    backgroundColor: colors.secondaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
  },
  dividerText: {
    color: '#FFD166',
    fontWeight: '900',
    fontSize: 14, fontFamily: "Jua_400Regular",
  },
  bottomHalf: {
    flex: 0.8,
    backgroundColor: colors.board, // Chalkboard background for the bottom area
    padding: 20,
    justifyContent: 'center',
  },
  studentArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    marginRight: 16,
    borderColor: colors.accent,
  },
  studentThoughtBubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 16,
    borderBottomLeftRadius: 0,
  },
  thoughtText: {
    fontSize: 15, fontFamily: "Jua_400Regular",
    color: colors.textDark,
    fontWeight: '600',
    lineHeight: 22,
  },
});
