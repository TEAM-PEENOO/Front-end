// src/screens/SyllabusScreen.tsx
import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { stagesApi } from '../api/stages';
import { Stage } from '../types';
import { colors } from '../theme/colors';

const RETENTION_COLOR: Record<string, string> = {
  '선명': colors.success,
  '흐릿해지는 중': colors.accent,
  '많이 흐릿함': '#FF9800',
  '거의 잊어버림': colors.error,
  '잊어버림': '#555',
};

export const SyllabusScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId, subjectName = '', studentName = '' } = route.params || {};

  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchStages = useCallback(async () => {
    try {
      const data = await stagesApi.list(subjectId);
      setStages(data);
    } catch {
      Alert.alert('오류', '진도표를 불러오지 못했어요.');
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

  const currentStageIdx = stages.findIndex(s => !s.passed);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
            <FontAwesome5 name="arrow-left" size={24} color="#3E2723" />
          </TouchableOpacity>
          <FontAwesome5 name="map" size={28} color="#3E2723" style={{ marginRight: 12 }} />
          <Text style={styles.headerTitle}>우리 반 진도표</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CurriculumEdit', { subjectId, subjectName })}
            style={styles.editButton}
          >
            <FontAwesome5 name="pen" size={14} color={colors.primary} />
            <Text style={styles.editButtonText}>편집</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>[{subjectName}] 커리큘럼 로드맵</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <Animated.ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
        >
          {stages.map((stage, idx) => {
            const isCurrent = idx === currentStageIdx;
            const isPassed = stage.passed;
            const taughtCount = stage.curriculum_items.filter(i => i.taught).length;
            const totalCount = stage.curriculum_items.length;

            return (
              <View
                key={stage.id}
                style={[
                  styles.stageCard,
                  isPassed && styles.stageCardPassed,
                  isCurrent && styles.stageCardCurrent,
                ]}
              >
                {/* 단계 헤더 */}
                <View style={styles.stageCardHeader}>
                  <View style={[styles.stageBadge, isPassed && styles.stageBadgePassed, isCurrent && styles.stageBadgeCurrent]}>
                    <FontAwesome5
                      name={isPassed ? 'check' : isCurrent ? 'star' : 'lock'}
                      size={14}
                      color="#FFF"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stageName}>{stage.name}</Text>
                    <Text style={styles.stageProgress}>{taughtCount}/{totalCount} 학습 완료</Text>
                  </View>
                  {isCurrent && !stage.exam_unlocked && (
                    <View style={styles.lockBadge}>
                      <FontAwesome5 name="lock" size={12} color="#888" style={{ marginRight: 4 }} />
                      <Text style={styles.lockBadgeText}>시험 잠김</Text>
                    </View>
                  )}
                  {isCurrent && stage.exam_unlocked && (
                    <View style={styles.unlockBadge}>
                      <FontAwesome5 name="award" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.unlockBadgeText}>시험 가능</Text>
                    </View>
                  )}
                  {isPassed && stage.passed_at && (
                    <Text style={styles.passedDate}>
                      {new Date(stage.passed_at).toLocaleDateString('ko-KR')} 통과
                    </Text>
                  )}
                </View>

                {/* 항목 목록 */}
                {stage.curriculum_items.map(item => (
                  <View key={item.id} style={styles.itemRow}>
                    <FontAwesome5
                      name={item.taught ? 'check-circle' : 'circle'}
                      size={16}
                      color={item.taught ? colors.success : '#CCC'}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={[styles.itemText, !item.taught && { color: '#AAA' }]}>
                      {item.title}
                    </Text>
                  </View>
                ))}

                {/* 진행 바 */}
                <View style={styles.progressBarBg}>
                  <View style={[
                    styles.progressBarFill,
                    {
                      width: `${totalCount > 0 ? (taughtCount / totalCount) * 100 : 0}%`,
                      backgroundColor: isPassed ? colors.success : isCurrent ? colors.primary : '#CCC',
                    },
                  ]} />
                </View>
              </View>
            );
          })}

          {stages.length === 0 && (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="map" size={60} color={colors.primaryLight} />
              <Text style={styles.emptyText}>아직 단계가 설정되지 않았어요.</Text>
            </View>
          )}
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FEF9EC' },
  header: {
    backgroundColor: '#FEF3C7', paddingTop: 56, paddingBottom: 18,
    paddingHorizontal: 24, borderBottomWidth: 3, borderColor: '#D4B886',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, flex: 1 },
  editButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginLeft: 'auto', backgroundColor: '#E8F5E9',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.primaryLight,
  },
  editButtonText: { fontFamily: 'Jua_400Regular', fontSize: 13, color: colors.primary },
  headerTitle: { fontFamily: 'Jua_400Regular', fontSize: 26, color: '#3E2723' },
  headerSubtitle: { fontFamily: 'Jua_400Regular', fontSize: 15, color: '#8C7A5E', marginLeft: 44 },
  container: { padding: 16, gap: 16, paddingBottom: 40 },
  stageCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 18,
    borderWidth: 2, borderColor: '#EAE1D3',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
    gap: 10,
  },
  stageCardPassed: { borderColor: colors.primaryLight, backgroundColor: '#F1F8F2' },
  stageCardCurrent: { borderColor: colors.primary, borderWidth: 3 },
  stageCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stageBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#CCC', justifyContent: 'center', alignItems: 'center',
  },
  stageBadgePassed: { backgroundColor: colors.success },
  stageBadgeCurrent: { backgroundColor: colors.primary },
  stageName: { fontFamily: 'Jua_400Regular', fontSize: 20, color: colors.textDark },
  stageProgress: { fontFamily: 'Jua_400Regular', fontSize: 13, color: '#888' },
  lockBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  lockBadgeText: { fontFamily: 'Jua_400Regular', fontSize: 12, color: '#888' },
  unlockBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  unlockBadgeText: { fontFamily: 'Jua_400Regular', fontSize: 12, color: colors.primary },
  passedDate: { fontFamily: 'Jua_400Regular', fontSize: 12, color: colors.success },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  itemText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: colors.textDark, flex: 1 },
  progressBarBg: { height: 6, backgroundColor: '#EEE', borderRadius: 4, marginTop: 4 },
  progressBarFill: { height: 6, borderRadius: 4 },
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#AAA' },
});
