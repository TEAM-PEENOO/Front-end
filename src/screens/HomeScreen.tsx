// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image,
  ScrollView, ImageBackground, Modal, Animated, Easing, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusCard } from '../components/StatusCard';
import { CustomButton } from '../components/CustomButton';
import { colors } from '../theme/colors';
import { progressApi } from '../api/progress';
import { Progress } from '../types';

const RETENTION_COLOR: Record<string, string> = {
  '선명': colors.success,
  '흐릿해지는 중': colors.accent,
  '많이 흐릿함': '#FF9800',
  '거의 잊어버림': colors.error,
  '잊어버림': '#555',
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId } = route.params || {};

  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [examModalVisible, setExamModalVisible] = useState(false);

  const fetchProgress = useCallback(async () => {
    try {
      const data = await progressApi.get(subjectId);
      setProgress(data);
    } catch {
      Alert.alert('오류', '학습 현황을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useFocusEffect(useCallback(() => {
    fetchProgress();
  }, [fetchProgress]));

  // ── 파생값 ─────────────────────────────────────────────────────────
  const subjectName = progress?.subject.name ?? '';
  const studentName = progress?.persona.name ?? '';
  const personality = progress?.persona.personality ?? 'curious';
  const currentStage = progress?.current_stage ?? null;
  const memoryRetention = Math.round(progress?.overall_retention ?? 0);
  const examUnlocked = currentStage?.exam_unlocked ?? false;
  const untaughtCount = currentStage?.untaught_count ?? 0;
  const progressText = currentStage
    ? `${currentStage.items.filter(i => i.taught).length}/${currentStage.items.length} 완료`
    : '0/0 완료';

  // ── 애니메이션 ────────────────────────────────────────────────────
  const entSign = useRef(new Animated.Value(0)).current;
  const entChar = useRef(new Animated.Value(0)).current;
  const entBubble = useRef(new Animated.Value(0)).current;
  const entStatus = useRef(new Animated.Value(0)).current;
  const entBoard = useRef(new Animated.Value(0)).current;
  const idleHover = useRef(new Animated.Value(0)).current;
  const idleBreathe = useRef(new Animated.Value(1)).current;
  const swingRot = useRef(new Animated.Value(0)).current;
  const sparkY = useRef(new Animated.Value(0)).current;
  const sparkOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(entSign, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
      Animated.spring(entChar, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
      Animated.spring(entBubble, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }),
      Animated.spring(entStatus, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
      Animated.spring(entBoard, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(idleHover, { toValue: -10, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(idleHover, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(idleBreathe, { toValue: 1.03, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(idleBreathe, { toValue: 1.0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(swingRot, { toValue: 1, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(swingRot, { toValue: -1, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(sparkY, { toValue: -1, duration: 2500, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(sparkOp, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(sparkOp, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(sparkOp, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
      ]),
      Animated.timing(sparkY, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);

  const signTransform = [
    { translateY: entSign.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] }) },
    { rotate: swingRot.interpolate({ inputRange: [-1, 1], outputRange: ['-3deg', '3deg'] }) },
  ];
  const charTransform = [
    { translateY: entChar.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) },
    { scale: entChar.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
    { translateY: idleHover },
    { scale: idleBreathe },
  ];
  const statTransform = [
    { translateY: entStatus.interpolate({ inputRange: [0, 1], outputRange: [150, 0] }) },
    { scale: entStatus.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0.8, 1.05, 1] }) },
  ];
  const boardTransform = [
    { translateY: entBoard.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) },
  ];

  const startExam = () => {
    if (!examUnlocked) {
      Alert.alert(
        '시험 잠김',
        `아직 가르치지 않은 항목이 ${untaughtCount}개 남았어요.\n모든 항목을 가르친 후 시험에 도전할 수 있어요!`
      );
      return;
    }
    setExamModalVisible(false);
    navigation.navigate('Exam', {
      subjectId,
      stageId: currentStage?.id,
      studentName,
      personality,
      subjectName,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../../assets/images/classroom_bg.png')}
        style={styles.bgImage}
        imageStyle={{ opacity: 0.85 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* 헤더 */}
          <Animated.View style={[styles.headerWrapper, { transform: signTransform, opacity: entSign }]}>
            <View style={styles.ropeLeft} />
            <View style={styles.ropeRight} />
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome5 name="store-alt" size={24} color={colors.secondaryDark} style={{ marginRight: 10 }} />
                <Text style={styles.headerTitle}>{subjectName} 교실</Text>
              </View>
              <Text style={styles.headerSubtitle}>오늘도 {studentName}에게 배움을 전해볼까요?</Text>
            </View>
          </Animated.View>

          {/* 캐릭터 */}
          <View style={styles.stageContainer}>
            <Animated.View style={[styles.characterFrame, { transform: charTransform, opacity: entChar }]}>
              <Image
                source={require('../../assets/images/girl_character.png')}
                style={styles.characterImg}
                resizeMode="cover"
              />
            </Animated.View>

            <Animated.View style={[styles.sparkle1, {
              opacity: sparkOp,
              transform: [{ translateY: sparkY.interpolate({ inputRange: [-1, 0], outputRange: [-40, 20] }) }],
            }]}>
              <FontAwesome5 name="star" solid size={16} color="#FFD166" />
            </Animated.View>
            <Animated.View style={[styles.sparkle2, {
              opacity: sparkOp,
              transform: [{ translateY: sparkY.interpolate({ inputRange: [-1, 0], outputRange: [-60, 0] }) }],
            }]}>
              <FontAwesome5 name="seedling" size={20} color="#8BC34A" />
            </Animated.View>

            <Animated.View style={[styles.characterSpeechBubble, {
              transform: [
                { scale: entBubble.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 1.1, 1] }) },
                { translateY: entBubble.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              ],
              opacity: entBubble,
            }]}>
              <Text style={styles.speechText}>"선생님! 오늘은 어떤 걸 배울까요?"</Text>
            </Animated.View>
          </View>

          {/* 상태 카드 */}
          <Animated.View style={{ zIndex: 10, transform: statTransform, opacity: entStatus }}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('GrowthTimeline', { subjectId, studentName })}>
              <StatusCard
                studentName={studentName}
                subjectName={subjectName}
                stageName={currentStage?.name ?? '단계 없음'}
                progressText={progressText}
                memoryRetention={memoryRetention}
                style={styles.statusCard}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* 액션 보드 */}
          <Animated.View style={[styles.woodBoardContainer, { transform: boardTransform, opacity: entBoard }]}>
            <View style={styles.woodBoardInner}>
              <View style={styles.actionGrid}>
                <CustomButton
                  title="가르치기"
                  variant="primary"
                  iconName="chalkboard-teacher"
                  style={styles.mainActionBtn}
                  textStyle={styles.mainActionText}
                  onPress={() => navigation.navigate('Chat', { subjectId, studentName, personality, subjectName })}
                />
                <View style={styles.secondaryActionRow}>
                  <CustomButton
                    title="진도표"
                    variant="secondary"
                    iconName="map"
                    style={styles.subActionBtn}
                    onPress={() => navigation.navigate('Syllabus', { subjectId, studentName, subjectName })}
                  />
                  <CustomButton
                    title="개념 사물함"
                    variant="secondary"
                    iconName="archive"
                    style={styles.subActionBtn}
                    onPress={() => navigation.navigate('Weakness', { subjectId, studentName })}
                  />
                </View>
                {/* 시험 버튼 — 해금 여부에 따라 스타일 변경 */}
                <TouchableOpacity
                  style={[styles.examBtn, !examUnlocked && styles.examBtnLocked]}
                  activeOpacity={0.85}
                  onPress={() => examUnlocked ? setExamModalVisible(true) : Alert.alert('시험 잠김', `아직 가르치지 않은 항목이 ${untaughtCount}개 남았어요.`)}
                >
                  <FontAwesome5
                    name={examUnlocked ? 'award' : 'lock'}
                    size={22}
                    color={examUnlocked ? '#FFF' : '#AAA'}
                    style={{ marginRight: 10 }}
                  />
                  <View>
                    <Text style={[styles.examBtnText, !examUnlocked && { color: '#AAA' }]}>단계 시험 요청</Text>
                    {!examUnlocked && (
                      <Text style={styles.examBtnSub}>{untaughtCount}개 항목 미학습</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

        </ScrollView>
      </ImageBackground>

      {/* 시험 확인 모달 */}
      <Modal visible={examModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <FontAwesome5 name="medal" size={40} color="#FFD166" />
            </View>
            <Text style={styles.modalTitle}>단계 승급 시험</Text>
            <Text style={styles.modalSubtitle}>[{currentStage?.name}] 단계를 마스터했나요?</Text>
            <View style={styles.modalBody}>
              <View style={styles.modalRuleRow}>
                <FontAwesome5 name="chalkboard-teacher" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.ruleText}>선생님 점수(60%)와 {studentName}의 점수(40%)가 합산됩니다.</Text>
              </View>
              <View style={styles.modalRuleRow}>
                <FontAwesome5 name="bullseye" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.ruleText}>합산 기준 점수를 넘으면 다음 단계로 진급!</Text>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setExamModalVisible(false)}>
                <Text style={styles.cancelBtnText}>조금 더 공부할래</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.startExamBtn} onPress={startExam}>
                <Text style={styles.startExamBtnText}>당당히 도전하기!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  bgImage: { flex: 1, width: '100%', height: '100%' },
  container: { padding: 24, paddingBottom: 60 },
  headerWrapper: { alignItems: 'center', marginBottom: 24, zIndex: 20 },
  ropeLeft: { position: 'absolute', top: -24, left: '20%', width: 6, height: 40, backgroundColor: '#8C7A5E', zIndex: -1 },
  ropeRight: { position: 'absolute', top: -24, right: '20%', width: 6, height: 40, backgroundColor: '#8C7A5E', zIndex: -1 },
  header: {
    backgroundColor: '#FFF8E7', padding: 16, borderRadius: 16,
    borderWidth: 4, borderColor: '#D4B886', flexDirection: 'column',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6,
    width: '100%', alignItems: 'center',
  },
  headerTitle: { fontSize: 26, color: '#5C4033', fontFamily: 'Jua_400Regular' },
  headerSubtitle: { fontSize: 16, color: '#8C7A5E', marginTop: 8, fontFamily: 'Jua_400Regular' },
  stageContainer: { alignItems: 'center', marginBottom: 32, marginTop: 10, position: 'relative', zIndex: 2 },
  characterFrame: {
    width: 200, height: 200, borderRadius: 100, backgroundColor: '#FFF',
    borderWidth: 8, borderColor: colors.primary, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  characterImg: { width: '100%', height: '100%' },
  sparkle1: { position: 'absolute', top: 40, left: 40, zIndex: 10 },
  sparkle2: { position: 'absolute', top: 60, right: 30, zIndex: 10 },
  characterSpeechBubble: {
    position: 'absolute', top: -30, right: -10, backgroundColor: '#FFFFFF',
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, borderBottomLeftRadius: 0,
    borderWidth: 3, borderColor: '#E5D6C5', zIndex: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 8,
  },
  speechText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: colors.textDark },
  statusCard: {
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8,
  },
  woodBoardContainer: {
    backgroundColor: '#CDA883', borderRadius: 24, borderWidth: 4, borderColor: '#8A5A44',
    borderBottomWidth: 10, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 10,
  },
  woodBoardInner: {
    backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
  },
  actionGrid: { gap: 16 },
  mainActionBtn: { paddingVertical: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 3 },
  mainActionText: { fontSize: 22 },
  secondaryActionRow: { flexDirection: 'row', gap: 12 },
  subActionBtn: { flex: 1, paddingVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 3 },
  examBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4,
  },
  examBtnLocked: { backgroundColor: '#F0F0F0', borderWidth: 2, borderColor: '#DDD' },
  examBtnText: { fontFamily: 'Jua_400Regular', fontSize: 20, color: '#FFF' },
  examBtnSub: { fontFamily: 'Jua_400Regular', fontSize: 13, color: '#AAA', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: {
    backgroundColor: '#FFFDF9', borderRadius: 24, padding: 24, width: '100%',
    alignItems: 'center', borderWidth: 4, borderColor: '#EAE1D3',
  },
  modalIconContainer: {
    backgroundColor: '#FFECB3', width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 3, borderColor: '#FFD166',
  },
  modalTitle: { fontFamily: 'Jua_400Regular', fontSize: 28, color: colors.textDark, marginBottom: 8 },
  modalSubtitle: { fontFamily: 'Jua_400Regular', fontSize: 18, color: colors.primary, marginBottom: 20 },
  modalBody: {
    backgroundColor: '#F3F9F4', padding: 16, borderRadius: 16, width: '100%',
    marginBottom: 24, borderWidth: 1, borderColor: '#D1E8D9',
  },
  modalRuleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  ruleText: { fontFamily: 'Jua_400Regular', fontSize: 15, color: colors.secondaryDark, flex: 1, lineHeight: 22 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: {
    flex: 1, backgroundColor: '#F5F5F5', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', borderWidth: 2, borderColor: '#E0E0E0',
  },
  cancelBtnText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#888' },
  startExamBtn: { flex: 1.5, backgroundColor: colors.accent, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  startExamBtnText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#FFF' },
});
