// src/screens/GrowthTimelineScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const TIMELINE_DATA = [
  { id: 5, level: '초등학교 5학년', date: '오늘 학습 중', active: true, desc: '소수의 나눗셈 정복 중!' },
  { id: 4, level: '초등학교 4학년', date: '2026.04.05 졸업', active: false, desc: '각도와 삼각형 완벽 이해' },
  { id: 3, level: '초등학교 3학년', date: '2026.03.20 졸업', active: false, desc: '나눗셈 기초 마스터' },
];

export const GrowthTimelineScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 16}}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>민이 성장 앨범</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.timelineWrapper}>
          <View style={styles.treeTrunk} />

          {TIMELINE_DATA.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              
              {/* Badge/Dot aligned to trunk */}
              <View style={[styles.timelineDot, item.active && styles.timelineDotActive]}>
                <FontAwesome5 name={item.active ? "seedling" : "check"} size={16} color="#FFF" />
              </View>

              {/* Card */}
              <View style={[styles.timelineCard, item.active && styles.activeCard]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, item.active && styles.activeText]}>{item.level}</Text>
                  <Text style={styles.cardDate}>{item.date}</Text>
                </View>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>

            </View>
          ))}
        </View>

        <View style={styles.encouragement}>
          <FontAwesome5 name="heart" size={24} color={colors.error} style={{marginBottom: 8}} />
          <Text style={styles.encouragementText}>다음 진급까지 멋지게 이끌어주세요!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F6F0',
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 24,
    color: '#FFF',
  },
  container: {
    padding: 24,
    paddingTop: 40,
  },
  timelineWrapper: {
    position: 'relative',
    paddingLeft: 40, // Space for trunk
  },
  treeTrunk: {
    position: 'absolute',
    left: 20,
    top: 20,
    bottom: 20,
    width: 6,
    backgroundColor: '#D1BFAe',
    borderRadius: 3,
  },
  timelineItem: {
    marginBottom: 32,
    position: 'relative',
    justifyContent: 'center',
  },
  timelineDot: {
    position: 'absolute',
    left: -35,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1BFAe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F9F6F0',
    zIndex: 2,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
    transform: [{scale: 1.2}],
  },
  timelineCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EAE1D3',
    shadowColor: '#C4B59D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2,
  },
  activeCard: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: colors.textDark,
  },
  activeText: {
    color: colors.primary,
  },
  cardDate: {
    fontFamily: 'Jua_400Regular',
    fontSize: 14,
    color: '#A09282',
  },
  cardDesc: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#8C7A5E',
  },
  encouragement: {
    marginTop: 40,
    alignItems: 'center',
  },
  encouragementText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#A09282',
  },
});
