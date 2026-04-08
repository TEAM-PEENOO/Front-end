// src/screens/PracticeScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { Avatar } from '../components/Avatar';
import { colors } from '../theme/colors';

type StudentState = 'confused' | 'thinking' | 'happy';
type Mode = 'idle' | 'hint' | 'concept';

const HINTS = [
  "단위 통일하기",
  "소수점 이동 규칙 찾기",
  "나눗셈을 곱셈으로 바꾸기"
];

export const PracticeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { studentName = '', concept = '' } = route.params || {};

  const [studentState, setStudentState] = useState<StudentState>('confused');
  const [mode, setMode] = useState<Mode>('idle');
  const [selectedHint, setSelectedHint] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const drawerAnim = useRef(new Animated.Value(300)).current; 
  const hintFlyAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const openHintDrawer = () => {
    setMode('hint');
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeHintDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMode('idle'));
  };

  const handleThrowHint = (hint: string) => {
    setSelectedHint(hint);
    Animated.sequence([
      Animated.timing(hintFlyAnim, {
        toValue: { x: 0, y: -450 },
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hintFlyAnim.setValue({ x: 0, y: 0 });
      setSelectedHint(null);
      triggerReaction('thinking');
      closeHintDrawer();
    });
  };

  const openConceptNote = () => {
    setMode('concept');
  };

  const closeConceptNote = () => {
    setMode('idle');
  };

  const handleShowConcept = () => {
    closeConceptNote();
    triggerReaction('happy');
  };

  const triggerReaction = (newState: StudentState) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setStudentState(newState);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const getStudentMsg = () => {
    if (studentState === 'confused') return "선생님... 이 문제 너무 헷갈려요. 어디서부터 시작해야 할까요?";
    if (studentState === 'thinking') return "아! 힌트를 주시니까 조금 알 것 같아요. 그러니까 먼저 자릿수를 맞추고...";
    return "이해가 쏙쏙 돼요! 정답은 5 맞죠?! 저 해냈어요!";
  };

  const getBubbleStyle = () => {
    if (studentState === 'confused') return styles.bubbleConfused;
    if (studentState === 'thinking') return styles.bubbleThinking;
    return styles.bubbleHappy;
  };

  const handleFinish = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{concept} 복습하기</Text>
        <View style={{width: 24}} /> 
      </View>

      {/* Chalkboard Problem Area */}
      <View style={styles.boardContainer}>
        <View style={styles.boardInner}>
          <Text style={styles.boardLabel}>[ 비슷한 문제 ]</Text>
          <Text style={styles.boardProblem}>
            2.5 리터의 주스를 0.5 리터씩 컵에 나누어 담으려고 합니다. 컵은 몇 개가 필요할까요?
          </Text>

          {/* Flashcard Overlay for Concept Mode */}
          {mode === 'concept' && (
            <View style={styles.conceptOverlay}>
              <View style={styles.conceptCard}>
                <FontAwesome5 name="thumbtack" size={24} color="#FF6B6B" style={styles.pinIcon} />
                <Text style={styles.conceptCardTitle}>✨ 핵심 공식 메모</Text>
                <Text style={styles.conceptCardText}>
                  소수의 연산에서는 {"\n"}
                  <Text style={styles.highlightText}>소수점의 자리</Text>를 맞추거나{"\n"}
                  똑같이 10, 100을 곱해 자연수로!
                </Text>
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
            <Text style={styles.bubbleText}>
              {getStudentMsg()}
            </Text>
          </View>
          <View style={styles.bubbleTail} />
        </Animated.View>

        <Avatar
          gender="girl"
          size={140}
          variant="face"
          style={styles.avatar}
        />
      </View>

      {/* Action Panel */}
      <View style={styles.actionPanel}>
        {studentState === 'happy' ? (
          <View style={styles.actionGrid}>
             <CustomButton 
              title="잘했어! 도장 찍어주기 💮" 
              variant="primary" 
              style={styles.actionBtnSuccess}
              onPress={handleFinish}
            />
          </View>
        ) : mode === 'idle' ? (
          <>
            <Text style={styles.actionTitle}>어떻게 도와줄까요?</Text>
            <View style={styles.actionGrid}>
              <CustomButton 
                title="💡 힌트 던져주기" 
                variant="colorful" 
                style={styles.actionBtnSuccess}
                onPress={openHintDrawer}
              />
              <CustomButton 
                title="📖 핵심 공식 알려주기" 
                variant="primary" 
                style={styles.actionBtnSuccess}
                onPress={openConceptNote}
              />
            </View>
          </>
        ) : mode === 'concept' ? (
          <>
            <Text style={styles.actionTitle}>제자에게 보여줄까요?</Text>
            <View style={styles.actionGrid}>
              <CustomButton 
                title="닫기" 
                variant="secondary" 
                style={styles.actionBtnHalf}
                onPress={closeConceptNote}
              />
              <CustomButton 
                title="제자에게 보여주기 ✨" 
                variant="primary" 
                style={styles.actionBtnHalf}
                onPress={handleShowConcept}
              />
            </View>
          </>
        ) : (
           <View style={{height: 100}} /> 
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
          {HINTS.map((hint, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.hintItem}
              onPress={() => handleThrowHint(hint)}
            >
              <FontAwesome5 name="lightbulb" size={18} color="#FFD166" style={{marginRight: 10}} />
              <Text style={styles.hintItemText}>{hint}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3D4C41', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: '#FFF',
  },
  boardContainer: {
    padding: 20,
    marginTop: 10,
    zIndex: 5,
  },
  boardInner: {
    backgroundColor: '#2A3C24',
    borderWidth: 6,
    borderColor: '#7A5C41',
    borderRadius: 8,
    padding: 24,
    minHeight: 180,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  boardLabel: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#FFD166',
    marginBottom: 8,
  },
  boardProblem: {
    fontFamily: 'Jua_400Regular',
    fontSize: 24,
    color: '#FFF',
    lineHeight: 34,
  },
  studentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    zIndex: 1,
  },
  bubbleContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  speechBubble: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EAE1D3',
    width: '100%',
  },
  bubbleConfused: {
    borderColor: '#E8A5A5',
    backgroundColor: '#FFF0F0',
  },
  bubbleThinking: {
    borderColor: '#FFD166',
    backgroundColor: '#FFFBE6',
  },
  bubbleHappy: {
    borderColor: '#8BC34A',
    backgroundColor: '#F1F8E9',
  },
  bubbleText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: colors.textDark,
    textAlign: 'center',
    lineHeight: 24,
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
    marginTop: -2, 
  },
  avatar: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  actionPanel: {
    backgroundColor: '#FFFDF9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    minHeight: 180,
  },
  actionTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: colors.secondaryDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionBtnHalf: {
    width: '48%',
    paddingVertical: 16,
  },
  actionBtnSuccess: {
    width: '100%',
    paddingVertical: 18,
  },
  conceptOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 16,
    zIndex: 10,
  },
  conceptCard: {
    backgroundColor: '#FFFAED',
    width: '100%',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EAE1D3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    transform: [{ rotate: '-2deg' }],
  },
  pinIcon: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
  },
  conceptCardTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: '#8C5E3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  conceptCardText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: '#333',
    lineHeight: 32,
    textAlign: 'center',
  },
  highlightText: {
    backgroundColor: '#FFD166',
    color: '#000',
  },
  flyingHint: {
    position: 'absolute',
    bottom: -80,
    alignSelf: 'center',
    backgroundColor: '#FFD166',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E8A5A5',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  flyingHintText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#333',
  },
  hintDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 30,
  },
  hintDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hintDrawerTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: colors.primary,
  },
  hintDrawerDesc: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  hintList: {
    gap: 12,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  hintItemText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#333',
  },
});
