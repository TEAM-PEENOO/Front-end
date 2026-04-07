// src/screens/PlacementResultScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { colors } from '../theme/colors';

const PERSONALITIES = [
  { id: 'curious', name: '호기심쟁이', desc: '질문 폭발 주의!', icon: 'lightbulb', color: '#4DA8DA' },
  { id: 'careful', name: '신중이', desc: '느리지만 오래 기억해', icon: 'search', color: '#66C2A5' },
  { id: 'clumsy', name: '덤벙이', desc: '빠르지만 자주 잊어', icon: 'running', color: '#FFD166' },
  { id: 'perfectionist', name: '완벽주의자', desc: '심화까지 완벽하게!', icon: 'award', color: '#FF6B6B' },
];

export const PlacementResultScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { studentName, gender } = route.params || { studentName: '민이', gender: 'girl' };
  const [selectedPersonality, setSelectedPersonality] = React.useState<string>('clumsy');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <FontAwesome5 name="check-circle" size={50} color={colors.primary} />
          <Text style={styles.headerTitle}>테스트 완료!</Text>
          <Text style={styles.headerSubtitle}>선생님과 제자의 궁합을 분석했어요.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>시작 분석 리포트</Text>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>추천 진도</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.resultValue}>초등학교 5학년</Text>
              <FontAwesome5 name="arrow-up" size={16} color={colors.primary} style={{marginLeft: 8}} />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>잘하는 부분</Text>
            <Text style={styles.resultValueSafe}>분수 계산, 기본 도형</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>가르쳐야 할 곳(약점)</Text>
            <Text style={styles.resultValueDanger}>소수의 나눗셈 원리</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>AI 추천 성격</Text>
            <View style={styles.personalityBadge}>
              <FontAwesome5 name="running" size={16} color="#FFD166" />
              <Text style={styles.personalityText}>덤벙이</Text>
            </View>
          </View>
        </View>

        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            "분석 결과를 보니 {studentName} 학생은 '덤벙이' 스타일 같아요! 빠르지만 항상 복습이 중요해요."
          </Text>
        </View>

        <View style={styles.personalityContainer}>
          <Text style={styles.personalityPrompt}>변경하고 싶다면 직접 골라주세요!</Text>
          <View style={styles.grid}>
            {PERSONALITIES.map((p) => {
              const isSelected = selectedPersonality === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPersonality(p.id)}
                  style={[
                    styles.personalityCard,
                    { borderColor: isSelected ? p.color : '#E5D6C5' },
                    isSelected && { backgroundColor: `${p.color}15`, borderWidth: 3 }
                  ]}
                >
                  <FontAwesome5 name={p.icon} size={24} color={isSelected ? p.color : '#A0A0A0'} />
                  <Text style={[styles.personalityName, { color: isSelected ? p.color : colors.textDark }]}>
                    {p.name}
                  </Text>
                  <Text style={styles.personalityDesc}>{p.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.actionContainer}>
          <CustomButton
            title="선택 완료 (학습 시작)"
            variant="primary"
            style={styles.button}
            onPress={() => navigation.navigate('Home', { studentName, gender, selectedPersonality })}
          />
          <CustomButton
            title="온보딩으로 돌아가기"
            variant="secondary"
            style={styles.button}
            onPress={() => navigation.navigate('Onboarding')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  headerTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 28,
    color: colors.textDark,
    marginTop: 12,
  },
  headerSubtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    backgroundColor: '#FAF3E0',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: '#EFEFEF',
  },
  cardHeaderTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: colors.secondaryDark,
  },
  resultItem: {
    padding: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  resultLabel: {
    fontFamily: 'Jua_400Regular',
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  resultValue: {
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: colors.textDark,
  },
  resultValueSafe: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: colors.primary,
  },
  resultValueDanger: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginHorizontal: 16,
  },
  personalityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBE6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  personalityText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#D4A017',
    marginLeft: 8,
  },
  speechBubble: {
    backgroundColor: '#E7F2EB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    width: '100%',
    borderWidth: 2,
    borderColor: '#C6E0CE',
  },
  speechText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 24,
    textAlign: 'center',
  },
  personalityContainer: {
    width: '100%',
    marginBottom: 24,
  },
  personalityPrompt: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  personalityCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalityName: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  personalityDesc: {
    fontFamily: 'Jua_400Regular',
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
