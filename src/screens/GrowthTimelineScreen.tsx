// src/screens/GrowthTimelineScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { stagesApi } from '../api/stages';
import { Stage } from '../types';
import { colors } from '../theme/colors';

export const GrowthTimelineScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId, studentName = '' } = route.params || {};

  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchStages = useCallback(async () => {
    try {
      const data = await stagesApi.list(subjectId);
      setStages(data);
    } catch {
      Alert.alert('오류', '성장 기록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, [subjectId]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fadeAnim.setValue(0);
    fetchStages();
  }, [fetchStages]));

  // 첫 번째 미통과 단계가 현재 단계
  const currentStageIdx = stages.findIndex(s => !s.passed);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {studentName ? `${studentName} 성장 앨범` : '성장 앨범'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <Animated.ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
        >
          {stages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="seedling" size={60} color={colors.primaryLight} />
              <Text style={styles.emptyText}>아직 학습 단계가 없어요.</Text>
            </View>
          ) : (
            <View style={styles.timelineWrapper}>
              <View style={styles.treeTrunk} />

              {stages.map((stage, index) => {
                const isCompleted = stage.passed;
                const isCurrent = index === currentStageIdx;
                const isFuture = !stage.passed && index !== currentStageIdx;
                const taughtCount = stage.curriculum_items.filter(i => i.taught).length;
                const totalCount = stage.curriculum_items.length;

                return (
                  <View key={stage.id} style={styles.timelineItem}>
                    {/* 타임라인 도트 */}
                    <View style={[
                      styles.timelineDot,
                      isCurrent && styles.timelineDotCurrent,
                      isCompleted && styles.timelineDotCompleted,
                    ]}>
                      {isCompleted && <FontAwesome5 name="check" size={14} color="#FFF" />}
                      {isCurrent && <FontAwesome5 name="seedling" size={16} color="#FFF" />}
                      {isFuture && <FontAwesome5 name="lock" size={12} color="#D1BFAe" />}
                    </View>

                    {/* 카드 */}
                    <View style={[
                      styles.timelineCard,
                      isCurrent && styles.activeCard,
                      isFuture && styles.futureCard,
                    ]}>
                      <View style={styles.cardHeader}>
                        <Text style={[
                          styles.cardTitle,
                          isCurrent && styles.activeText,
                          isFuture && styles.futureText,
                        ]}>
                          {stage.name}
                        </Text>

                        {isCompleted && (
                          <View style={styles.badgeCompleted}>
                            <FontAwesome5 name="medal" size={12} color="#FFF" style={{ marginRight: 4 }} />
                            <Text style={styles.badgeText}>달성 완료</Text>
                          </View>
                        )}
                        {isCurrent && (
                          <View style={styles.badgeCurrent}>
                            <FontAwesome5 name="fire-alt" size={12} color="#FFF" style={{ marginRight: 4 }} />
                            <Text style={styles.badgeText}>성장 중</Text>
                          </View>
                        )}
                      </View>

                      {/* 진도 텍스트 */}
                      {!isFuture && (
                        <Text style={styles.progressText}>
                          {taughtCount}/{totalCount} 학습 완료
                        </Text>
                      )}

                      {/* 커리큘럼 항목 */}
                      <View style={styles.itemList}>
                        {stage.curriculum_items.map((item) => {
                          let iconName = 'square';
                          let iconColor = colors.primary;
                          if (isCompleted || item.taught) {
                            iconName = 'check-square';
                            iconColor = '#4CAF50';
                          } else if (isFuture) {
                            iconName = 'lock';
                            iconColor = '#B0BEC5';
                          }

                          return (
                            <View key={item.id} style={styles.itemRow}>
                              <FontAwesome5
                                name={iconName}
                                solid={iconName !== 'square'}
                                size={isFuture ? 14 : 16}
                                color={iconColor}
                                style={styles.itemIcon}
                              />
                              <Text style={[
                                styles.itemText,
                                (isCompleted || item.taught) && styles.itemTextCompleted,
                                isFuture && styles.itemTextFuture,
                              ]}>
                                {item.title}
                              </Text>
                            </View>
                          );
                        })}
                      </View>

                      {/* 통과 날짜 */}
                      {isCompleted && stage.passed_at && (
                        <Text style={styles.passedDateText}>
                          {new Date(stage.passed_at).toLocaleDateString('ko-KR')} 통과
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.encouragement}>
            <FontAwesome5 name="heart" size={24} color={colors.error} style={{ marginBottom: 8 }} />
            <Text style={styles.encouragementText}>다음 진급까지 멋지게 이끌어주세요!</Text>
          </View>
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9F6F0' },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 56,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  headerTitle: { fontFamily: 'Jua_400Regular', fontSize: 24, color: '#FFF' },
  container: { padding: 24, paddingTop: 40, paddingBottom: 60 },
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#AAA' },
  timelineWrapper: { position: 'relative', paddingLeft: 44 },
  treeTrunk: {
    position: 'absolute', left: 20, top: 20, bottom: 20,
    width: 6, backgroundColor: '#D1BFAe', borderRadius: 3,
  },
  timelineItem: { marginBottom: 32, position: 'relative', justifyContent: 'center' },
  timelineDot: {
    position: 'absolute', left: -36,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#D1BFAe', zIndex: 2,
  },
  timelineDotCurrent: { backgroundColor: colors.primary, borderColor: colors.primary, transform: [{ scale: 1.2 }] },
  timelineDotCompleted: { backgroundColor: '#8BC34A', borderColor: '#8BC34A' },
  timelineCard: {
    backgroundColor: '#FFF', padding: 20, borderRadius: 16,
    borderWidth: 2, borderColor: '#EAE1D3',
    shadowColor: '#C4B59D', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8, shadowRadius: 0, elevation: 2,
    gap: 8,
  },
  activeCard: { borderColor: colors.primary, borderWidth: 3, shadowColor: colors.primary, shadowOpacity: 1 },
  futureCard: { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0', shadowOpacity: 0, elevation: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontFamily: 'Jua_400Regular', fontSize: 20, color: colors.textDark },
  activeText: { color: colors.primary, fontSize: 22 },
  futureText: { color: '#9E9E9E' },
  badgeCompleted: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#4CAF50', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  badgeCurrent: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FF7043', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  badgeText: { fontFamily: 'Jua_400Regular', fontSize: 12, color: '#FFF' },
  progressText: { fontFamily: 'Jua_400Regular', fontSize: 13, color: '#888' },
  itemList: { gap: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { width: 24, textAlign: 'center' },
  itemText: { fontFamily: 'Jua_400Regular', fontSize: 17, color: colors.secondaryDark, flex: 1, marginLeft: 4 },
  itemTextCompleted: { color: '#9E9E9E', textDecorationLine: 'line-through' },
  itemTextFuture: { color: '#BDBDBD' },
  passedDateText: { fontFamily: 'Jua_400Regular', fontSize: 12, color: colors.success, textAlign: 'right' },
  encouragement: { marginTop: 40, alignItems: 'center' },
  encouragementText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#A09282' },
});
