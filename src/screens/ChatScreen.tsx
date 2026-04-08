// src/screens/ChatScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Avatar } from '../components/Avatar';
import { colors } from '../theme/colors';
import { ResultModal } from '../components/ResultModal';
import { CustomButton } from '../components/CustomButton';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { studentName = '민이', gender = 'girl', subjectName = '웹 기초', stages = [] } = route.params || {};

  const currentStage = stages.length > 0 ? stages[0] : { name: '1단계', items: [{ id: '1', title: 'HTML 기본' }] };
  const topics = currentStage.items || [];

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: `선생님! 오늘은 [${topic}]에 대해 가르쳐주신다고 하셨죠? 기대돼요!`,
      },
    ]);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text: inputText },
    ]);
    setInputText('');
    
    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `아하! 선생님 설명을 들으니까 ${selectedTopic}이 조금 이해되는 것 같아요! 정말인가요?`,
        },
      ]);
    }, 1500);
  };

  if (!selectedTopic) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FAF3E0' }]}>
        <View style={styles.selectorHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
            <FontAwesome5 name="arrow-left" size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.selectorTitle}>오늘의 수업 주제</Text>
          <Text style={styles.selectorSubtitle}>{studentName}에게 무엇을 가르칠까요?</Text>
        </View>

        <ScrollView contentContainerStyle={styles.topicList}>
          {topics.map((item: any) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.topicCard}
              onPress={() => handleSelectTopic(item.title)}
            >
              <Text style={styles.topicCardText}>{item.title}</Text>
              <FontAwesome5 name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          ))}
          {topics.length === 0 && (
            <Text style={styles.emptyText}>가르칠 수 있는 항목이 없습니다. 단계를 설정해주세요.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.chatBackground}>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <TouchableOpacity onPress={() => setSelectedTopic(null)} style={{marginRight: 12}}>
                <FontAwesome5 name="arrow-left" size={24} color={colors.textDark} />
              </TouchableOpacity>
              <Avatar size={48} gender={gender} style={styles.headerAvatar} />
              <View>
                <Text style={styles.headerTitle}>{subjectName} 수업 중...</Text>
                <Text style={styles.headerSubtitle}>주제: {selectedTopic}</Text>
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.messageContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  msg.sender === 'user' ? styles.messageUser : styles.messageAI,
                ]}
              >
                {msg.sender === 'ai' && (
                  <Avatar size={36} gender={gender} style={styles.messageAvatar} />
                )}
                <View
                  style={[
                    styles.bubble,
                    msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAI,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.sender === 'user' ? styles.textUser : styles.textAI,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder={`${studentName}에게 부드럽게 설명해주세요...`}
              placeholderTextColor="#A1A1A1"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>설명하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.endButton} onPress={() => setShowResult(true)}>
              <Text style={styles.sendButtonText}>종료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <ResultModal 
        visible={showResult} 
        score={88} 
        onClose={() => {
          setShowResult(false);
          navigation.navigate('Home');
        }} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.board, // Chalkboard green background
  },
  container: {
    flex: 1,
  },
  chatBackground: {
    flex: 1,
  },
  selectorHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  selectorTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 32,
    color: colors.primary,
    marginBottom: 8,
  },
  selectorSubtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: colors.secondaryDark,
  },
  topicList: {
    padding: 24,
  },
  topicCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#EAE1D3',
    elevation: 2,
  },
  topicCardText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: colors.textDark,
  },
  emptyText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#EAE1D3',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 8,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    marginRight: 12,
    borderWidth: 2,
  },
  headerTitle: {
    fontSize: 18, fontFamily: "Jua_400Regular",
    fontWeight: '800',
    color: colors.textDark,
  },
  headerSubtitle: {
    fontSize: 14, fontFamily: "Jua_400Regular",
    color: colors.primary,
    marginTop: 4,
  },
  messageContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageUser: {
    justifyContent: 'flex-end',
  },
  messageAI: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: colors.chatUser,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#FFFDF9',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16, fontFamily: "Jua_400Regular",
    lineHeight: 22,
  },
  textUser: {
    color: '#FFFFFF',
  },
  textAI: {
    color: colors.textDark,
  },
  inputArea: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#EAE1D3',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16, fontFamily: "Jua_400Regular",
    maxHeight: 100,
    borderColor: '#EAE1D3',
    borderWidth: 1,
    color: colors.textDark,
  },
  sendButton: {
    backgroundColor: colors.primary,
    marginLeft: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: colors.textLight,
    fontSize: 16, fontFamily: "Jua_400Regular",
  },
});
