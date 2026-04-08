// src/screens/OnboardingScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { subjectsApi } from '../api/subjects';
import { personasApi } from '../api/personas';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Personality = 'curious' | 'careful' | 'clumsy' | 'perfectionist';

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const existingSubjectId: string | undefined = route.params?.existingSubjectId;

  // Form State
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [studentName, setStudentName] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl'>('girl');
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Flow State
  const [currentStep, setCurrentStep] = useState(0);

  // Animation Refs
  // Page 1 is centered initially
  const page1Anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const page1Rot = useRef(new Animated.Value(0)).current;

  // Page 2 is hidden way off-screen (top-right) initially
  const page2Anim = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH, y: -400 })).current;
  const page2Rot = useRef(new Animated.Value(1)).current; // 1 means rotated

  // Character & Stamp
  const charAnim = useRef(new Animated.Value(0)).current;
  const stampScale = useRef(new Animated.Value(5)).current;
  const stampOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (personality) {
      charAnim.setValue(0);
      let animConfig: any = null;
      switch (personality) {
        case 'curious':
          animConfig = Animated.spring(charAnim, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true });
          break;
        case 'careful':
          animConfig = Animated.loop(Animated.sequence([
            Animated.timing(charAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(charAnim, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
          ]));
          break;
        case 'clumsy':
          animConfig = Animated.sequence([
            Animated.timing(charAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.timing(charAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
            Animated.timing(charAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.timing(charAnim, { toValue: 0, duration: 100, useNativeDriver: true })
          ]);
          break;
        case 'perfectionist':
          animConfig = Animated.sequence([
            Animated.timing(charAnim, { toValue: 1.2, duration: 150, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.spring(charAnim, { toValue: 1, friction: 4, useNativeDriver: true })
          ]);
          break;
      }
      if (animConfig) animConfig.start();
    }
  }, [personality]);

  const goToNextPage = () => {
    // Throw Page 1 leftwards
    Animated.parallel([
      Animated.timing(page1Anim, {
        toValue: { x: -SCREEN_WIDTH - 100, y: 100 },
        duration: 450,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(page1Rot, {
        toValue: 1, // Will map to -15deg
        duration: 450,
        useNativeDriver: true,
      })
    ]).start(() => {
      setCurrentStep(1);
      // Bring Page 2 in from top right
      Animated.parallel([
        Animated.spring(page2Anim, {
          toValue: { x: 0, y: 0 },
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(page2Rot, {
          toValue: 0, // Normal orientation
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const goBackToPage1 = () => {
    // Throw Page 2 back top-right
    Animated.parallel([
      Animated.timing(page2Anim, {
        toValue: { x: SCREEN_WIDTH, y: -400 },
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(page2Rot, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(() => {
      setCurrentStep(0);
      // Bring Page 1 back
      Animated.parallel([
        Animated.spring(page1Anim, {
          toValue: { x: 0, y: 0 },
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(page1Rot, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const submitForm = async () => {
    if (submitting) return;
    setSubmitting(true);

    // Stamp + Screen Shake 애니메이션
    Animated.parallel([
      Animated.timing(stampOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.spring(stampScale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(120),
        Animated.timing(shakeAnim, { toValue: 15, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ])
    ]).start();

    try {
      // 1. 과목 생성 (기존 subjectId가 있으면 스킵)
      let subjectId = existingSubjectId;
      if (!subjectId) {
        const subject = await subjectsApi.create(subjectName.trim(), subjectDesc.trim() || undefined);
        subjectId = subject.id;
      }

      // 2. 페르소나 생성
      await personasApi.create(subjectId, studentName.trim(), personality || 'curious');

      setTimeout(() => {
        navigation.navigate('CurriculumSetup', {
          subjectId,
          subjectName: subjectName.trim(),
          subjectDesc: subjectDesc.trim(),
          studentName: studentName.trim(),
          gender,
          personality: personality || 'curious',
        });
      }, 1200);
    } catch (e: any) {
      setSubmitting(false);
      stampOpacity.setValue(0);
      stampScale.setValue(5);
      Alert.alert('오류', e?.response?.data?.error?.message || '저장에 실패했어요. 다시 시도해주세요.');
    }
  };

  const getCharTransform = () => {
    switch (personality) {
      case 'curious':
        return [{ translateY: charAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) }];
      case 'careful':
        return [{ scale: charAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }];
      case 'clumsy':
        return [{ rotate: charAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-15deg', '15deg'] }) }];
      case 'perfectionist':
        return [{ scale: charAnim.interpolate({ inputRange: [0, 1, 1.2], outputRange: [1, 1, 1.1] }) }];
      default:
        return [];
    }
  };

  const page1Rotation = page1Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-15deg'] });
  const page2Rotation = page2Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '15deg'] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={{ flex: 1, transform: [{ translateY: shakeAnim }] }}>
        <ImageBackground
          source={require('../../assets/images/wooden_desk_sunlight.png')}
          style={styles.deskBackground}
          resizeMode="cover"
        >
          {/* Subtle Darkening Overlay to make paper pop */}
          <View style={styles.darkOverlay} />

          <TouchableOpacity onPress={() => {
            if (currentStep === 1) goBackToPage1();
            else navigation.goBack();
          }} style={styles.backButton}>
            <View style={styles.backButtonInner}>
              <FontAwesome5 name="arrow-left" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>

          <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            {/* PAGE 1: Subject Info */}
            <Animated.View style={[styles.pageWrapper, {
              transform: [
                { translateX: page1Anim.x },
                { translateY: page1Anim.y },
                { rotate: page1Rotation }
              ],
              opacity: currentStep === 0 ? 1 : (Platform.OS === 'android' ? 0 : 1) // hide if offscreen to prevent touch issues
            }]}
              pointerEvents={currentStep === 0 ? 'auto' : 'none'}
            >
              <View style={styles.paper}>
                {/* Vintage Paper Header */}
                <View style={styles.paperHeader}>
                  <Text style={styles.paperTitle}>과외 계약서</Text>
                  <Text style={styles.paperSubtitle}>No. 2026-001</Text>
                  <View style={styles.stampBoxOutline}>
                    <Text style={styles.stampBoxText}>교과 확인</Text>
                  </View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.label}>[ 1 ] 선생님의 과목은 무엇입니까?</Text>
                  <TextInput
                    style={styles.fountainPenInput}
                    placeholder="만년필로 적듯 과목명을 적어주세요..."
                    value={subjectName}
                    onChangeText={setSubjectName}
                    placeholderTextColor="rgba(26, 26, 36, 0.3)"
                    maxLength={15}
                  />

                  <Text style={[styles.label, { marginTop: 30 }]}>과목에 대한 짧은 소개:</Text>
                  <TextInput
                    style={[styles.fountainPenInput, { minHeight: 80, textAlignVertical: 'top' }]}
                    placeholder="어떤 것을 가르치는지 설명해주세요."
                    value={subjectDesc}
                    onChangeText={setSubjectDesc}
                    placeholderTextColor="rgba(26, 26, 36, 0.3)"
                    maxLength={40}
                    multiline
                  />
                </View>

                {subjectName.trim().length > 0 && (
                  <TouchableOpacity style={styles.nextPageBtn} onPress={goToNextPage}>
                    <Text style={styles.nextPageText}>다음 장으로 넘기기</Text>
                    <FontAwesome5 name="arrow-right" size={16} color="#1A1A24" />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>

            {/* PAGE 2: Student Info */}
            <Animated.View style={[styles.pageWrapper, {
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              transform: [
                { translateX: page2Anim.x },
                { translateY: page2Anim.y },
                { rotate: page2Rotation }
              ],
              opacity: currentStep === 1 ? 1 : (Platform.OS === 'android' ? 0 : 1)
            }]}
              pointerEvents={currentStep === 1 ? 'auto' : 'none'}
            >
              <View style={styles.paper}>
                <View style={styles.paperHeader}>
                  <Text style={styles.paperTitle}>과외 학생 프로필 만들기</Text>
                  <Text style={styles.paperSubtitle}>부록 - 1</Text>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.label}>[ 2 ] 제자의 성별과 이름</Text>
                  <View style={styles.genderRow}>
                    <TouchableOpacity style={[styles.genderBubble, gender === 'boy' && styles.genderBubbleActive]} onPress={() => setGender('boy')}>
                      <FontAwesome5 name="male" size={16} color={gender === 'boy' ? '#FFF' : '#666'} style={{ marginRight: 6 }} />
                      <Text style={[styles.genderText, gender === 'boy' && { color: '#FFF' }]}>남자</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.genderBubble, gender === 'girl' && styles.genderBubbleActive]} onPress={() => setGender('girl')}>
                      <FontAwesome5 name="female" size={16} color={gender === 'girl' ? '#FFF' : '#666'} style={{ marginRight: 6 }} />
                      <Text style={[styles.genderText, gender === 'girl' && { color: '#FFF' }]}>여자</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.fountainPenInputSmall}
                      placeholder="이름 입력"
                      value={studentName}
                      onChangeText={setStudentName}
                      placeholderTextColor="rgba(26, 26, 36, 0.3)"
                      maxLength={8}
                    />
                  </View>

                  <Text style={[styles.label, { marginTop: 24 }]}>[ 3 ] 제자의 학습 개성 (성격)</Text>
                  <View style={styles.personalityGrid}>
                    <TouchableOpacity style={[styles.pCard, personality === 'curious' && styles.pCardActive]} onPress={() => setPersonality('curious')}>
                      <Text style={styles.pEmoji}>🔵</Text>
                      <Text style={styles.pTitle}>호기심쟁이</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.pCard, personality === 'careful' && styles.pCardActive]} onPress={() => setPersonality('careful')}>
                      <Text style={styles.pEmoji}>🟢</Text>
                      <Text style={styles.pTitle}>신중이</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.pCard, personality === 'clumsy' && styles.pCardActive]} onPress={() => setPersonality('clumsy')}>
                      <Text style={styles.pEmoji}>🟡</Text>
                      <Text style={styles.pTitle}>덤벙이</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.pCard, personality === 'perfectionist' && styles.pCardActive]} onPress={() => setPersonality('perfectionist')}>
                      <Text style={styles.pEmoji}>🔴</Text>
                      <Text style={styles.pTitle}>완벽주의자</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Character Preview */}
                  <View style={styles.previewContainer}>
                    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, { transform: getCharTransform() }]}>
                      {personality ? (
                        <Image
                          source={
                            gender === 'girl'
                              ? personality === 'curious'      ? require('../../assets/images/girl_curious.png')
                                : personality === 'careful'    ? require('../../assets/images/girl_careful.png')
                                : personality === 'clumsy'     ? require('../../assets/images/girl_clumsy.png')
                                :                                require('../../assets/images/girl_perfectionist.png')
                              : personality === 'curious'      ? require('../../assets/images/char_curious.png')
                                : personality === 'careful'    ? require('../../assets/images/char_careful.png')
                                : personality === 'clumsy'     ? require('../../assets/images/char_clumsy.png')
                                :                                require('../../assets/images/char_perfectionist.png')
                          }
                          style={styles.previewCharImg}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.previewPlaceholder}>
                          <Text style={{ color: '#fff', fontSize: 40 }}>?</Text>
                        </View>
                      )}
                    </Animated.View>
                  </View>

                  {personality && (
                    <Text style={styles.previewText}>
                      {personality === 'curious' && "선생님, 이건 왜 그런 거예요!?"}
                      {personality === 'careful' && "음... 천천히 다시 읽어볼게요."}
                      {personality === 'clumsy' && "앗! 방금 배운 건데 까먹었어요!"}
                      {personality === 'perfectionist' && "이 개념의 예외 상황까지 알고 싶어요."}
                    </Text>
                  )}
                </View>

                {studentName.trim().length > 0 && personality && (
                  <View style={styles.signatureRow}>
                    <View style={styles.signArea}>
                      <Text style={styles.signLabel}>과외 선생님 서명</Text>
                      <View style={styles.signLine}></View>
                    </View>
                    <TouchableOpacity style={styles.approvalBtn} onPress={submitForm}>
                      <Text style={styles.approvalBtnText}>신고서 최종 제출</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STAMP EFFECT OVERLAY */}
                <Animated.View style={[styles.stampOverlay, { opacity: stampOpacity, transform: [{ scale: stampScale }, { rotate: '-10deg' }] }]} pointerEvents="none">
                  <View style={styles.stampGraphic}>
                    <Text style={styles.stampGraphicText}>과외 계약 완료</Text>
                    <Text style={styles.stampGraphicSub}>APPROVED</Text>
                  </View>
                </Animated.View>

              </View>
            </Animated.View>
          </KeyboardAvoidingView>

        </ImageBackground>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  deskBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(50, 30, 20, 0.4)', // Warm dark overlay to let paper pop
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F7F3E8', // Rough creamy paper texture look
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#E8E1CE',
    overflow: 'hidden',
  },
  paperHeader: {
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#2C3043', // Ink black
    paddingBottom: 16,
    marginBottom: 32,
    position: 'relative',
  },
  paperTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 32,
    color: '#1A1A24',
    letterSpacing: 2,
  },
  paperSubtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#5C6378',
    marginTop: 6,
  },
  stampBoxOutline: {
    position: 'absolute',
    right: 0,
    top: -5,
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#C43A31',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
    transform: [{ rotate: '5deg' }]
  },
  stampBoxText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 14,
    color: '#C43A31',
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
  },
  label: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#1A1A24',
    marginBottom: 8,
  },
  fountainPenInput: {
    fontFamily: 'Jua_400Regular',
    fontSize: 24,
    color: '#0B1C40', // Deep fountain pen ink
    borderBottomWidth: 2,
    borderBottomColor: '#8E99B0',
    paddingVertical: 10,
  },
  nextPageBtn: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 20,
  },
  nextPageText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: '#1A1A24',
    marginRight: 8,
    textDecorationLine: 'underline',
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#EAE6D8',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D0CAB8',
  },
  genderBubbleActive: {
    backgroundColor: '#3E5C4E', // Vintage ink green
    borderColor: '#3E5C4E',
  },
  genderText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#555',
  },
  fountainPenInputSmall: {
    flex: 1,
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: '#0B1C40',
    borderBottomWidth: 2,
    borderBottomColor: '#8E99B0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  personalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pCard: {
    width: '48%',
    backgroundColor: '#FDFBF7',
    borderWidth: 2,
    borderColor: '#D0CAB8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  pCardActive: {
    borderColor: '#3E5C4E',
    backgroundColor: '#EBF0E6',
    borderStyle: 'solid',
  },
  pEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  pTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#1A1A24',
  },
  previewContainer: {
    marginTop: 10,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCharImg: {
    width: 130,
    height: 130,
  },
  previewPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EAE6D8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#3E5C4E',
    textAlign: 'center',
    marginTop: 8,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 10,
  },
  signArea: {
    flex: 1,
    marginRight: 20,
  },
  signLabel: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#5C6378',
    marginBottom: 10,
  },
  signLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#2C3043',
  },
  approvalBtn: {
    backgroundColor: '#1A1A24',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  approvalBtnText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: '#F4ECE1',
  },
  stampOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  stampGraphic: {
    borderWidth: 10,
    borderColor: '#B22222', // Deeper ink red
    borderRadius: 16,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: [{ rotate: '5deg' }]
  },
  stampGraphicText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 50,
    color: '#B22222',
    textAlign: 'center',
    letterSpacing: 4,
  },
  stampGraphicSub: {
    fontFamily: 'Jua_400Regular',
    fontSize: 24,
    color: '#B22222',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 8,
  }
});
