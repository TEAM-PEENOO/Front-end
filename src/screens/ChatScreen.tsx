// src/screens/ChatScreen.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, FlatList, ActivityIndicator,
  Alert, Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Avatar } from '../components/Avatar';
import { colors } from '../theme/colors';
import { curriculumApi } from '../api/curriculum';
import { sessionsApi } from '../api/sessions';
import { CurriculumItem } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId, studentName = '', personality = 'curious', subjectName = '' } = route.params || {};

  // 주제 선택 상태
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CurriculumItem | null>(null);

  // 세션 상태
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endResult, setEndResult] = useState<any>(null);
  const [showEndModal, setShowEndModal] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const streamingTextRef = useRef('');

  // 커리큘럼 항목 로딩 (화면 진입 시)
  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const items = await curriculumApi.list(subjectId);
      setCurriculumItems(items);
    } catch {
      Alert.alert('오류', '학습 항목을 불러오지 못했어요.');
    } finally {
      setLoadingItems(false);
    }
  }, [subjectId]);

  React.useEffect(() => { loadItems(); }, [loadItems]);

  // 항목 선택 → 세션 시작
  const handleSelectItem = async (item: CurriculumItem) => {
    setSelectedItem(item);
    try {
      const session = await sessionsApi.create(subjectId, item.title, item.id);
      setSessionId(session.id);
      setMessages([{
        id: 'init',
        role: 'assistant',
        text: `선생님! 오늘은 [${item.title}]에 대해 가르쳐주신다고 하셨죠? 기대돼요!`,
      }]);
    } catch {
      Alert.alert('오류', '세션을 시작하지 못했어요.');
      setSelectedItem(null);
    }
  };

  // 메시지 전송 (SSE 스트리밍)
  const sendMessage = async () => {
    if (!inputText.trim() || streaming || !sessionId) return;
    const userText = inputText.trim();
    setInputText('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);

    // 빈 AI 메시지 자리 확보
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', text: '' }]);
    streamingTextRef.current = '';
    setStreaming(true);

    try {
      await sessionsApi.chat(subjectId, sessionId, userText, (delta) => {
        streamingTextRef.current += delta;
        const current = streamingTextRef.current;
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, text: current } : m)
        );
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, text: '(응답 오류가 발생했어요.)' } : m)
      );
    } finally {
      setStreaming(false);
    }
  };

  // 세션 종료
  const handleEndSession = () => {
    if (!sessionId || ending) return;
    if (Platform.OS === 'web') {
      if (!window.confirm('수업을 종료할까요?\n종료하면 약점 개념이 정리되고 수업이 완료됩니다.')) return;
      doEndSession();
    } else {
      Alert.alert(
        '수업 종료',
        '수업을 종료할까요?\n종료하면 약점 개념이 정리되고 수업이 완료됩니다.',
        [
          { text: '계속 가르치기', style: 'cancel' },
          { text: '종료하기', style: 'destructive', onPress: doEndSession },
        ]
      );
    }
  };

  const doEndSession = async () => {
    setEnding(true);
    try {
      const result = await sessionsApi.end(subjectId, sessionId!);
      setEndResult(result);
      setShowEndModal(true);
    } catch {
      Alert.alert('오류', '세션 종료에 실패했어요.');
    } finally {
      setEnding(false);
    }
  };

  // ── 주제 선택 화면 ───────────────────────────────────────────────
  if (!selectedItem) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FAF3E0' }]}>
        <View style={styles.selectorHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
            <FontAwesome5 name="arrow-left" size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.selectorTitle}>오늘의 수업 주제</Text>
          <Text style={styles.selectorSubtitle}>{studentName}에게 무엇을 가르칠까요?</Text>
        </View>

        {loadingItems ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={curriculumItems}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.topicList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.topicCard, item.taught && styles.topicCardTaught]}
                onPress={() => handleSelectItem(item)}
                activeOpacity={0.8}
              >
                <FontAwesome5
                  name={item.taught ? 'check-circle' : 'circle'}
                  size={20}
                  color={item.taught ? colors.success : colors.primaryLight}
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.topicCardText}>{item.title}</Text>
                {item.taught && (
                  <Text style={styles.retaughtBadge}>복습</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: '#AAA', marginTop: 40, fontFamily: 'Jua_400Regular', fontSize: 16 }}>
                커리큘럼 항목이 없어요.
              </Text>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // ── 채팅 화면 ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.board }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* 헤더 */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => { setSelectedItem(null); setMessages([]); setSessionId(null); }} style={{ marginRight: 12 }}>
            <FontAwesome5 name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <Avatar size={40} style={styles.chatAvatar} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.chatHeaderName}>{studentName}</Text>
            <Text style={styles.chatHeaderTopic} numberOfLines={1}>{selectedItem.title}</Text>
          </View>
          <TouchableOpacity
            style={[styles.endBtn, ending && { opacity: 0.6 }]}
            onPress={handleEndSession}
            disabled={ending}
          >
            {ending
              ? <ActivityIndicator size="small" color="#FFF" />
              : <Text style={styles.endBtnText}>수업 종료</Text>
            }
          </TouchableOpacity>
        </View>

        {/* 메시지 목록 */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item: msg }) => (
            <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
              {msg.role === 'assistant' && <Avatar size={32} style={{ marginRight: 8, alignSelf: 'flex-end' }} />}
              <View style={[styles.bubbleContent, msg.role === 'user' ? styles.bubbleContentUser : styles.bubbleContentAI]}>
                <Text style={[styles.bubbleText, msg.role === 'user' && { color: '#FFF' }]}>
                  {msg.text}
                  {msg.role === 'assistant' && streaming && msg.text === '' && (
                    <Text style={{ color: '#AAA' }}>▌</Text>
                  )}
                </Text>
              </View>
            </View>
          )}
        />

        {/* 입력창 */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="설명을 입력하세요..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="rgba(255,255,255,0.5)"
            multiline
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (streaming || !inputText.trim()) && { opacity: 0.4 }]}
            onPress={sendMessage}
            disabled={streaming || !inputText.trim()}
          >
            {streaming
              ? <ActivityIndicator size="small" color="#FFF" />
              : <FontAwesome5 name="paper-plane" size={20} color="#FFF" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 세션 종료 결과 모달 */}
      <Modal visible={showEndModal} transparent animationType="slide">
        <View style={styles.endModalOverlay}>
          <View style={styles.endModalContent}>
            <FontAwesome5 name="graduation-cap" size={48} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.endModalTitle}>수업 완료!</Text>

            {endResult && (
              <>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>수업 품질 점수</Text>
                  <Text style={styles.scoreValue}>{endResult.quality_score}점</Text>
                </View>

                {endResult.weak_points?.length > 0 && (
                  <View style={styles.weakBox}>
                    <Text style={styles.weakTitle}>이번 수업 약점 개념</Text>
                    {endResult.weak_points.map((wp: any, i: number) => (
                      <Text key={i} style={styles.weakItem}>• {wp.concept}</Text>
                    ))}
                  </View>
                )}
              </>
            )}

            <TouchableOpacity
              style={styles.endModalBtn}
              onPress={() => {
                setShowEndModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.endModalBtnText}>홈으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  // 주제 선택
  selectorHeader: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 },
  selectorTitle: { fontFamily: 'Jua_400Regular', fontSize: 28, color: colors.textDark, marginTop: 8 },
  selectorSubtitle: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#888', marginTop: 6 },
  topicList: { padding: 20, gap: 12 },
  topicCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    padding: 18, borderRadius: 16, borderWidth: 2, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  topicCardTaught: { borderColor: colors.primaryLight },
  topicCardText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: colors.textDark, flex: 1 },
  retaughtBadge: {
    fontFamily: 'Jua_400Regular', fontSize: 12, color: colors.primary,
    backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  // 채팅
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  chatAvatar: { borderWidth: 2, borderColor: colors.primaryLight },
  chatHeaderName: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#FFF' },
  chatHeaderTopic: { fontFamily: 'Jua_400Regular', fontSize: 13, color: colors.primaryLight },
  endBtn: {
    backgroundColor: colors.error, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', minWidth: 70,
  },
  endBtnText: { fontFamily: 'Jua_400Regular', fontSize: 14, color: '#FFF' },
  messageList: { padding: 16, gap: 12 },
  bubble: { flexDirection: 'row', alignItems: 'flex-end' },
  bubbleUser: { justifyContent: 'flex-end' },
  bubbleAI: { justifyContent: 'flex-start' },
  bubbleContent: { maxWidth: '78%', padding: 14, borderRadius: 18 },
  bubbleContentUser: { backgroundColor: colors.chatUser, borderBottomRightRadius: 4 },
  bubbleContentAI: { backgroundColor: colors.chatAI, borderBottomLeftRadius: 4 },
  bubbleText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: colors.textDark, lineHeight: 22 },
  inputRow: {
    flexDirection: 'row', padding: 12, backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'flex-end', gap: 10,
  },
  chatInput: {
    flex: 1, fontFamily: 'Jua_400Regular', fontSize: 16, color: '#FFF',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingHorizontal: 16,
    paddingVertical: 10, maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: colors.primary, width: 48, height: 48,
    borderRadius: 24, justifyContent: 'center', alignItems: 'center',
  },
  // 종료 모달
  endModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  endModalContent: {
    backgroundColor: '#FFFDF9', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 32, alignItems: 'center', gap: 12,
  },
  endModalTitle: { fontFamily: 'Jua_400Regular', fontSize: 30, color: colors.primary },
  scoreRow: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%',
    backgroundColor: '#F0F9F3', padding: 16, borderRadius: 16,
  },
  scoreLabel: { fontFamily: 'Jua_400Regular', fontSize: 18, color: colors.textDark },
  scoreValue: { fontFamily: 'Jua_400Regular', fontSize: 22, color: colors.primary },
  weakBox: {
    width: '100%', backgroundColor: '#FFF3F5', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#FFCDD2',
  },
  weakTitle: { fontFamily: 'Jua_400Regular', fontSize: 16, color: colors.error, marginBottom: 6 },
  weakItem: { fontFamily: 'Jua_400Regular', fontSize: 15, color: colors.textDark },
  endModalBtn: {
    backgroundColor: colors.primary, paddingVertical: 18, paddingHorizontal: 40,
    borderRadius: 16, width: '100%', alignItems: 'center', marginTop: 8,
  },
  endModalBtnText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#FFF' },
});
