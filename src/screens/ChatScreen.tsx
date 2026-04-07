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

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { studentName = '민이', gender = 'girl' } = route.params || {};

  const [inputText, setInputText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: '선생님! 오늘은 분수의 덧셈에 대해 알려주신다고 하셨죠? 기대돼요!',
    },
  ]);

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
          text: '아하! 분모가 다르면 분모를 똑같이 맞춰야 한다는 뜻인가요? 어떻게 맞추나요?',
        },
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Blackboard Background Pattern wrapping the chat */}
        <View style={styles.chatBackground}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 12}}>
                <FontAwesome5 name="arrow-left" size={24} color={colors.textDark} />
              </TouchableOpacity>
              <Avatar size={48} gender={gender} style={styles.headerAvatar} />
              <View>
                <Text style={styles.headerTitle}>1학년 2반 수업 중...</Text>
                <Text style={styles.headerSubtitle}>학생: {studentName}</Text>
              </View>
            </View>
          </View>

          {/* Messages */}
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

          {/* Input Area */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="민이에게 부드럽게 설명해주세요..."
              placeholderTextColor="#A1A1A1"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>가르치기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.endButton} onPress={() => setShowResult(true)}>
              <Text style={styles.sendButtonText}>수업 종료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <ResultModal 
        visible={showResult} 
        score={84} 
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
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 4,
    borderBottomColor: colors.secondaryDark,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 8,
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
    fontWeight: '600',
    marginTop: 2,
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
    backgroundColor: colors.chatAI,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16, fontFamily: "Jua_400Regular",
    lineHeight: 22,
    fontWeight: '500',
  },
  textUser: {
    color: '#FFFFFF',
  },
  textAI: {
    color: colors.textDark,
  },
  inputArea: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: colors.secondaryDark,
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
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.textDark,
  },
  sendButton: {
    backgroundColor: colors.primary,
    marginLeft: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: colors.secondaryDark,
    marginLeft: 8,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 16, fontFamily: "Jua_400Regular",
  },
});
