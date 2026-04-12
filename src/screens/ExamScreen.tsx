// src/screens/ExamScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Avatar } from '../components/Avatar';
import { colors } from '../theme/colors';
import { examsApi } from '../api/exams';
import { Exam, ExamQuestion, UserAnswer } from '../types';

// 성격별 문제 번호별 AI 생각 목록
const THOUGHTS_BY_PERSONALITY: Record<string, string[]> = {
  curious:       ['오! 이거 배운 기억 있어요!', '왜 이렇게 되는 거예요?', '음... 헷갈리는데요 🤔', '이 개념 재밌었는데!', '마지막! 집중해서 풀어볼게요!'],
  careful:       ['한 번 더 확인해볼게요...', '제가 제대로 이해한 게 맞나요?', '실수하면 안 되는데...', '천천히 다시 생각할게요.', '마지막 문제, 꼼꼼하게!'],
  clumsy:        ['앗, 이거 배웠나요?', '엇... 헷갈려요!', '아 맞다! 선생님이 말씀하셨는데...', '잠깐, 뭐가 답이었더라 😅', '마지막 문제야! 잘 할 수 있어요!'],
  perfectionist: ['예외 케이스는 없나요?', '더 정확히 말하면...', '이 풀이 방법 맞나요?', '완벽하게 풀어야겠어요.', '마지막! 완벽한 마무리를!'],
  steady:        ['천천히 생각해볼게요.', '조금 더 쉬운 예시를 떠올려요.', '느긋하게 풀어볼게요~', '잘 모르겠지만 해볼게요.', '마지막 문제도 성실히!'],
};

const SUBMITTING_THOUGHTS: Record<string, string> = {
  curious:       '저도 열심히 풀었어요! 결과 궁금해요!',
  careful:       '실수 없이 풀었는지 걱정돼요...',
  clumsy:        '앗, 다 풀었나요? 저도 다 했어요!',
  perfectionist: '완벽하게 풀었다고 생각해요!',
  steady:        '다 끝냈어요. 결과 기다릴게요 :)',
};

export const ExamScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId, stageId, studentName = '', personality = 'curious', subjectName = '' } = route.params || {};

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [lockedError, setLockedError] = useState<string | null>(null);

  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // AI 학생 생각 애니메이션
  const [aiThought, setAiThought] = useState('');
  const [aiDots, setAiDots] = useState('');
  const [aiThinking, setAiThinking] = useState(true);

  // 단답형 입력 모달
  const [shortAnswerModal, setShortAnswerModal] = useState<{ questionId: string; label: string } | null>(null);
  const [shortAnswerDraft, setShortAnswerDraft] = useState('');
  const shortAnswerInputRef = useRef<TextInput>(null);

  // 문제 이동 시 AI 생각 업데이트
  useEffect(() => {
    const thoughts = THOUGHTS_BY_PERSONALITY[personality] ?? THOUGHTS_BY_PERSONALITY.curious;
    setAiThinking(true);
    setAiThought('');
    const timer = setTimeout(() => {
      setAiThought(thoughts[currentQ % thoughts.length]);
      setAiThinking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentQ, personality]);

  // 타이핑 점 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setAiDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const created = await examsApi.create(subjectId, stageId);
        setExam(created);
      } catch (e: any) {
        if (e?.response?.status === 422) {
          const msg = e.response.data?.error?.message ?? '시험 해금 조건 미충족';
          setLockedError(msg);
        } else {
          Alert.alert('오류', '시험지를 생성하지 못했어요.');
          navigation.goBack();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!exam) return;
    const unanswered = exam.questions.filter(q => !userAnswers[q.id]);
    if (unanswered.length > 0) {
      Alert.alert('미완성', `${unanswered.length}개 문제에 아직 답하지 않았어요.`);
      return;
    }
    setSubmitting(true);
    try {
      const answers: UserAnswer[] = exam.questions.map(q => ({
        question_id: q.id,
        answer: userAnswers[q.id] ?? '',
      }));
      await examsApi.submitUserAnswers(subjectId, exam.id, answers);
      const result = await examsApi.grade(subjectId, exam.id);
      navigation.replace('ExamResult', { subjectId, result, studentName, subjectName });
    } catch {
      Alert.alert('오류', '채점에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>시험지를 생성하고 있어요...</Text>
      </SafeAreaView>
    );
  }

  if (lockedError) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <FontAwesome5 name="lock" size={60} color="#CCC" />
        <Text style={styles.lockedTitle}>시험이 잠겨있어요</Text>
        <Text style={styles.lockedDesc}>{lockedError}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!exam || exam.questions.length === 0) return null;

  const question = exam.questions[currentQ];
  const total = exam.questions.length;
  const answered = Object.keys(userAnswers).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단: 내 시험 */}
      <View style={styles.topHalf}>
        <View style={styles.examHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.examHeaderText}>{currentQ + 1} / {total}</Text>
          <Text style={styles.examHeaderText}>{answered}/{total} 답변</Text>
        </View>

        <ScrollView contentContainerStyle={styles.examPaperContent}>
          <View style={styles.examPaper}>
            <View style={styles.difficultyRow}>
              <Text style={styles.difficultyText}>
                {'★'.repeat(question.difficulty)}{'☆'.repeat(3 - question.difficulty)} 난이도
              </Text>
              <Text style={styles.conceptTag}>{question.concept_tag}</Text>
            </View>

            <Text style={styles.questionText}>{question.content}</Text>

            {question.type === 'multiple_choice' && question.options ? (
              question.options.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.optionBtn,
                    userAnswers[question.id] === opt && styles.optionBtnSelected,
                  ]}
                  onPress={() => handleSelectAnswer(question.id, opt)}
                >
                  <Text style={[
                    styles.optionText,
                    userAnswers[question.id] === opt && styles.optionTextSelected,
                  ]}>{opt}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.shortAnswerBox}>
                <Text style={styles.shortAnswerLabel}>단답형 — 아래에 답을 입력하세요</Text>
                <TouchableOpacity
                  style={styles.shortAnswerInput}
                  onPress={() => {
                    setShortAnswerDraft(userAnswers[question.id] ?? '');
                    setShortAnswerModal({ questionId: question.id, label: question.concept_tag });
                    setTimeout(() => shortAnswerInputRef.current?.focus(), 100);
                  }}
                >
                  <Text style={{ fontFamily: 'Jua_400Regular', fontSize: 16, color: userAnswers[question.id] ? colors.textDark : '#AAA' }}>
                    {userAnswers[question.id] ?? '탭하여 답변 입력...'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 이전/다음 네비 */}
            <View style={styles.navRow}>
              <TouchableOpacity
                style={[styles.navBtn, currentQ === 0 && { opacity: 0.3 }]}
                onPress={() => setCurrentQ(q => Math.max(0, q - 1))}
                disabled={currentQ === 0}
              >
                <FontAwesome5 name="chevron-left" size={16} color={colors.primary} />
                <Text style={styles.navBtnText}>이전</Text>
              </TouchableOpacity>

              {currentQ < total - 1 ? (
                <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentQ(q => q + 1)}>
                  <Text style={styles.navBtnText}>다음</Text>
                  <FontAwesome5 name="chevron-right" size={16} color={colors.primary} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting
                    ? <ActivityIndicator size="small" color="#FFF" />
                    : <Text style={styles.submitBtnText}>제출 및 채점</Text>
                  }
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 구분선 */}
      <View style={styles.divider}>
        <Text style={styles.dividerText}>VS</Text>
      </View>

      {/* 하단: AI 학생 */}
      <View style={styles.bottomHalf}>
        <View style={styles.studentArea}>
          <View style={styles.avatarWrapper}>
            <Avatar size={60} style={styles.studentAvatar} />
            <View style={styles.qBadge}>
              <Text style={styles.qBadgeText}>Q{currentQ + 1}</Text>
            </View>
          </View>
          <View style={styles.studentThoughtBubble}>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.studentThoughtText}>
              {submitting
                ? (SUBMITTING_THOUGHTS[personality] ?? `${studentName}도 열심히 채점 기다리는 중${aiDots}`)
                : aiThinking
                  ? `생각하는 중${aiDots}`
                  : (aiThought || `음... 생각 중이에요${aiDots}`)
              }
            </Text>
          </View>
        </View>
      </View>

      {/* 단답형 입력 모달 */}
      <Modal
        visible={!!shortAnswerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShortAnswerModal(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>단답형 답변 입력</Text>
            {shortAnswerModal && (
              <Text style={styles.modalLabel}>{shortAnswerModal.label}</Text>
            )}
            <TextInput
              ref={shortAnswerInputRef}
              style={styles.modalInput}
              value={shortAnswerDraft}
              onChangeText={setShortAnswerDraft}
              placeholder="답을 입력하세요"
              placeholderTextColor="#AAA"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                if (shortAnswerModal && shortAnswerDraft.trim()) {
                  handleSelectAnswer(shortAnswerModal.questionId, shortAnswerDraft.trim());
                }
                setShortAnswerModal(null);
              }}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShortAnswerModal(null)}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, !shortAnswerDraft.trim() && { opacity: 0.4 }]}
                disabled={!shortAnswerDraft.trim()}
                onPress={() => {
                  if (shortAnswerModal) {
                    handleSelectAnswer(shortAnswerModal.questionId, shortAnswerDraft.trim());
                  }
                  setShortAnswerModal(null);
                }}
              >
                <Text style={styles.modalConfirmText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.board },
  loadingText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#FFF', marginTop: 16 },
  lockedTitle: { fontFamily: 'Jua_400Regular', fontSize: 26, color: colors.textDark, marginTop: 20, marginBottom: 10 },
  lockedDesc: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#888', textAlign: 'center', lineHeight: 24 },
  backBtn: {
    marginTop: 24, backgroundColor: colors.primary,
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14,
  },
  backBtnText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#FFF' },
  topHalf: { flex: 3 },
  examHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 20,
  },
  examHeaderText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#FFF' },
  examPaperContent: { padding: 16 },
  examPaper: {
    backgroundColor: '#FFFDF9', borderRadius: 20, padding: 20,
    borderWidth: 3, borderColor: '#EAE1D3',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
  difficultyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  difficultyText: { fontFamily: 'Jua_400Regular', fontSize: 14, color: colors.accent },
  conceptTag: {
    fontFamily: 'Jua_400Regular', fontSize: 12, color: colors.primary,
    backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  questionText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: colors.textDark, lineHeight: 28, marginBottom: 20 },
  optionBtn: {
    padding: 14, borderRadius: 12, borderWidth: 2, borderColor: colors.border,
    marginBottom: 10, backgroundColor: '#FFF',
  },
  optionBtnSelected: { borderColor: colors.primary, backgroundColor: '#E8F5E9' },
  optionText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: colors.textDark },
  optionTextSelected: { color: colors.primary },
  shortAnswerBox: { marginBottom: 16 },
  shortAnswerLabel: { fontFamily: 'Jua_400Regular', fontSize: 14, color: '#888', marginBottom: 8 },
  shortAnswerInput: {
    borderWidth: 2, borderColor: colors.border, borderRadius: 12,
    padding: 14, minHeight: 50, justifyContent: 'center',
  },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  navBtnText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: colors.primary },
  submitBtn: {
    backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', minWidth: 120,
  },
  submitBtnText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#FFF' },
  divider: {
    height: 36, backgroundColor: colors.secondaryDark,
    justifyContent: 'center', alignItems: 'center',
  },
  dividerText: { fontFamily: 'Jua_400Regular', fontSize: 20, color: '#FFF' },
  bottomHalf: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  studentArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  avatarWrapper: { position: 'relative' },
  studentAvatar: { borderWidth: 3, borderColor: colors.primaryLight },
  qBadge: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1,
    borderWidth: 2, borderColor: '#FFF',
  },
  qBadgeText: { fontFamily: 'Jua_400Regular', fontSize: 10, color: '#FFF' },
  studentThoughtBubble: {
    flex: 1, marginLeft: 14, backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  studentName: { fontFamily: 'Jua_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 3 },
  studentThoughtText: { fontFamily: 'Jua_400Regular', fontSize: 15, color: '#FFF', lineHeight: 22 },
  // 단답형 모달
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    width: '100%', backgroundColor: '#FFFDF9', borderRadius: 20,
    padding: 24, gap: 12,
  },
  modalTitle: { fontFamily: 'Jua_400Regular', fontSize: 20, color: colors.textDark },
  modalLabel: { fontFamily: 'Jua_400Regular', fontSize: 14, color: colors.primary },
  modalInput: {
    fontFamily: 'Jua_400Regular', fontSize: 17, color: colors.textDark,
    borderWidth: 2, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#F0F0F0', alignItems: 'center',
  },
  modalCancelText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#888' },
  modalConfirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  modalConfirmText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#FFF' },
});
