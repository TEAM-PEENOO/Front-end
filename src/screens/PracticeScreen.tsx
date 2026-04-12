// src/screens/PracticeScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Animated, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { Avatar } from '../components/Avatar';
import { colors } from '../theme/colors';
import { weakPointsApi } from '../api/weakPoints';
import { PracticeData } from '../types';

type StudentState = 'confused' | 'thinking' | 'happy';
type Mode = 'idle' | 'hint' | 'concept';

export const PracticeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId, studentName = '', concept = '', tagId = '' } = route.params || {};

  const [gender, setGender] = useState<'boy' | 'girl'>('girl');
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [loading, setLoading] = useState(true);

  const [studentState, setStudentState] = useState<StudentState>('confused');
  const [mode, setMode] = useState<Mode>('idle');
  const [selectedHint, setSelectedHint] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const drawerAnim = useRef(new Animated.Value(300)).current;
  const hintFlyAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // 성별 로드
  useEffect(() => {
    if (subjectId) {
      AsyncStorage.getItem(`gender_${subjectId}`).then(g => {
        if (g === 'boy' || g === 'girl') setGender(g);
      });
    }
  }, [subjectId]);

  // 복습 데이터 로드
  useEffect(() => {
    (async () => {
      try {
        const data = await weakPointsApi.practice(subjectId, tagId);
        setPracticeData(data);
      } catch {
        Alert.alert('오류', '복습 문제를 불러오지 못했어요.', [
          { text: '돌아가기', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [subjectId, tagId]);

  const openHintDrawer = () => {
    setMode('hint');
    Animated.timing(drawerAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const closeHintDrawer = () => {
    Animated.timing(drawerAnim, { toValue: 400, duration: 200, useNativeDriver: true }).start(() => setMode('idle'));
  };

  const handleThrowHint = (hint: string) => {
    setSelectedHint(hint);
    Animated.sequence([
      Animated.timing(hintFlyAnim, { toValue: { x: 0, y: -450 }, duration: 800, useNativeDriver: true }),
    ]).start(() => {
      hintFlyAnim.setValue({ x: 0, y: 0 });
      setSelectedHint(null);
      triggerReaction('thinking');
      closeHintDrawer();
    });
  };

  const openConceptNote = () => setMode('concept');
  const closeConceptNote = () => setMode('idle');

  const handleShowConcept = () => {
    closeConceptNote();
    triggerReaction('happy');
  };

  const triggerReaction = (newState: StudentState) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStudentState(newState);
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const getStudentMsg = () => {
    if (studentState === 'confused') return `선생님... "${concept}" 부분이 너무 헷갈려요. 어디서부터 시작해야 할까요?`;
    if (studentState === 'thinking') return '아! 힌트를 주시니까 조금 알 것 같아요. 다시 한번 생각해볼게요!';
    return '이해가 쏙쏙 돼요! 이제 알 것 같아요. 감사합니다 선생님!';
  };

  const getBubbleStyle = () => {
    if (studentState === 'confused') return styles.bubbleConfused;
    if (studentState === 'thinking') return styles.bubbleThinking;
    return styles.bubbleHappy;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primaryLight} />
        <Text style={styles.loadingText}>복습 문제를 만들고 있어요...</Text>
      </SafeAreaView>
    );
  }

  const hints = practiceData?.hints ?? [];
  const problem = practiceData?.problem ?? `${concept}에 대한 문제를 선생님이 출제해주세요.`;
  const conceptTitle = practiceData?.concept_title ?? `${concept} 핵심 정리`;
  const conceptExplanation = practiceData?.concept_explanation ?? '';

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{concept} 복습하기</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Chalkboard Problem Area */}
      <View style={styles.boardContainer}>
        <View style={styles.boardInner}>
          <Text style={styles.boardLabel}>[ 비슷한 문제 ]</Text>
          <Text style={styles.boardProblem}>{problem}</Text>

          {/* Flashcard Overlay for Concept Mode */}
          {mode === 'concept' && (
            <View style={styles.conceptOverlay}>
              <View style={styles.conceptCard}>
                <FontAwesome5 name="thumbtack" size={24} color="#FF6B6B" style={styles.pinIcon} />
                <Text style={styles.conceptCardTitle}>✨ {conceptTitle}</Text>
                <Text style={styles.conceptCardText}>{conceptExplanation}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Flying hint animation layer */}
        {selectedHint && (
          <Animated.View style={[styles.flyingHint, { transform: hintFlyAnim.getTranslateTransform() }]}>
            <Text style={styles.flyingHintText}>{selectedHint}</Text>
          </Animated.View>
        )}
      </View>

      {/* Student Area */}
      <View style={styles.studentContainer}>
        <Animated.View style={[styles.bubbleContainer, { opacity: fadeAnim }]}>
          <View style={[styles.speechBubble, getBubbleStyle()]}>
            <Text style={styles.bubbleText}>{getStudentMsg()}</Text>
          </View>
          <View style={styles.bubbleTail} />
        </Animated.View>
        <Avatar gender={gender} size={140} variant="face" style={styles.avatar} />
      </View>

      {/* Action Panel */}
      <View style={styles.actionPanel}>
        {studentState === 'happy' ? (
          <CustomButton
            title="잘했어! 도장 찍어주기 💮"
            variant="primary"
            style={styles.actionBtnFull}
            onPress={() => navigation.goBack()}
          />
        ) : mode === 'idle' ? (
          <>
            <Text style={styles.actionTitle}>어떻게 도와줄까요?</Text>
            <View style={styles.actionGrid}>
              <CustomButton
                title="💡 힌트 던져주기"
                variant="colorful"
                style={styles.actionBtnFull}
                onPress={openHintDrawer}
              />
              <CustomButton
                title="📖 핵심 개념 알려주기"
                variant="primary"
                style={styles.actionBtnFull}
                onPress={openConceptNote}
              />
            </View>
          </>
        ) : mode === 'concept' ? (
          <>
            <Text style={styles.actionTitle}>제자에게 보여줄까요?</Text>
            <View style={styles.actionGrid}>
              <CustomButton title="닫기" variant="secondary" style={styles.actionBtnHalf} onPress={closeConceptNote} />
              <CustomButton title="제자에게 보여주기 ✨" variant="primary" style={styles.actionBtnHalf} onPress={handleShowConcept} />
            </View>
          </>
        ) : (
          <View style={{ height: 100 }} />
        )}
      </View>

      {/* Hint Drawer Overlay */}
      <Animated.View style={[styles.hintDrawer, { transform: [{ translateY: drawerAnim }] }]}>
        <View style={styles.hintDrawerHeader}>
          <Text style={styles.hintDrawerTitle}>힌트 자판기</Text>
          <TouchableOpacity onPress={closeHintDrawer}>
            <FontAwesome5 name="times" size={24} color="#C4C4C4" />
          </TouchableOpacity>
        </View>
        <Text style={styles.hintDrawerDesc}>칠판으로 던져줄 힌트를 고르세요!</Text>
        <View style={styles.hintList}>
          {hints.length > 0 ? hints.map((hint, idx) => (
            <TouchableOpacity key={idx} style={styles.hintItem} onPress={() => handleThrowHint(hint)}>
              <FontAwesome5 name="lightbulb" size={18} color="#FFD166" style={{ marginRight: 10 }} />
              <Text style={styles.hintItemText}>{hint}</Text>
            </TouchableOpacity>
          )) : (
            <Text style={{ fontFamily: 'Jua_400Regular', color: '#AAA', fontSize: 16, textAlign: 'center' }}>
              힌트를 불러오지 못했어요.
            </Text>
          )}
        </View>
      </Animated.View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#3D4C41' },
  loadingText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#FFF', marginTop: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 20,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: 'Jua_400Regular', fontSize: 22, color: '#FFF' },
  boardContainer: { padding: 20, marginTop: 10, zIndex: 5 },
  boardInner: {
    backgroundColor: '#2A3C24', borderWidth: 6, borderColor: '#7A5C41',
    borderRadius: 8, padding: 24, minHeight: 180, justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
  },
  boardLabel: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#FFD166', marginBottom: 8 },
  boardProblem: { fontFamily: 'Jua_400Regular', fontSize: 20, color: '#FFF', lineHeight: 30 },
  studentContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20, zIndex: 1,
  },
  bubbleContainer: { width: '80%', alignItems: 'center', marginBottom: 10 },
  speechBubble: {
    backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 14,
    borderRadius: 20, borderWidth: 2, borderColor: '#EAE1D3', width: '100%',
  },
  bubbleConfused: { borderColor: '#E8A5A5', backgroundColor: '#FFF0F0' },
  bubbleThinking: { borderColor: '#FFD166', backgroundColor: '#FFFBE6' },
  bubbleHappy: { borderColor: '#8BC34A', backgroundColor: '#F1F8E9' },
  bubbleText: {
    fontFamily: 'Jua_400Regular', fontSize: 16, color: colors.textDark,
    textAlign: 'center', lineHeight: 24,
  },
  bubbleTail: {
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 14,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FFF',
    marginTop: -2,
  },
  avatar: { borderWidth: 0, shadowOpacity: 0, elevation: 0, backgroundColor: 'transparent' },
  actionPanel: {
    backgroundColor: '#FFFDF9', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 24, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 10,
    elevation: 10, minHeight: 180,
  },
  actionTitle: {
    fontFamily: 'Jua_400Regular', fontSize: 20, color: colors.secondaryDark,
    marginBottom: 16, textAlign: 'center',
  },
  actionGrid: { gap: 12 },
  actionBtnHalf: { width: '48%', paddingVertical: 16 },
  actionBtnFull: { width: '100%', paddingVertical: 18 },
  conceptOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center',
    borderRadius: 8, padding: 16, zIndex: 10,
  },
  conceptCard: {
    backgroundColor: '#FFFAED', width: '100%', padding: 24,
    borderRadius: 12, borderWidth: 2, borderColor: '#EAE1D3',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6,
    elevation: 6, transform: [{ rotate: '-2deg' }],
  },
  pinIcon: { position: 'absolute', top: -12, alignSelf: 'center' },
  conceptCardTitle: {
    fontFamily: 'Jua_400Regular', fontSize: 18, color: '#8C5E3C',
    marginBottom: 14, textAlign: 'center',
  },
  conceptCardText: {
    fontFamily: 'Jua_400Regular', fontSize: 18, color: '#333', lineHeight: 28, textAlign: 'center',
  },
  flyingHint: {
    position: 'absolute', bottom: -80, alignSelf: 'center',
    backgroundColor: '#FFD166', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 24, borderWidth: 2, borderColor: '#E8A5A5', zIndex: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  flyingHintText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#333' },
  hintDrawer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 24, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.15, shadowRadius: 20,
    elevation: 20, zIndex: 30,
  },
  hintDrawerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  hintDrawerTitle: { fontFamily: 'Jua_400Regular', fontSize: 22, color: colors.primary },
  hintDrawerDesc: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#666', marginBottom: 16 },
  hintList: { gap: 12 },
  hintItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA',
    padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EEE',
  },
  hintItemText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#333', flex: 1 },
});
