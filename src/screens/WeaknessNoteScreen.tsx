// src/screens/WeaknessNoteScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { colors } from '../theme/colors';

const MOCK_WEAKNESSES = [
  { id: '1', concept: '소수의 나눗셈', failCount: 3, lastFailed: '2일 전' },
  { id: '2', concept: '분수의 덧셈', failCount: 1, lastFailed: '1주일 전' },
  { id: '3', concept: '비례식의 기초', failCount: 5, lastFailed: '어제' },
];

export const WeaknessNoteScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { studentName, gender } = route.params || {};
  const [selectedWeakness, setSelectedWeakness] = React.useState<any>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 16}}>
            <FontAwesome5 name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <FontAwesome5 name="archive" size={28} color="#FFF" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>오답 사물함</Text>
        </View>
        <Text style={styles.headerSubtitle}>민이가 헷갈려하는 빈틈을 채워주세요!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {MOCK_WEAKNESSES.sort((a, b) => b.failCount - a.failCount).map((item, index) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.noteItem} 
            activeOpacity={0.8}
            onPress={() => setSelectedWeakness(item)}
          >
            {/* Warning Ribbon */}
            <View style={[styles.ribbon, item.failCount >= 3 ? styles.ribbonDanger : styles.ribbonSafe]} />
            
            <View style={styles.noteContent}>
              <View style={styles.noteHeader}>
                <Text style={styles.conceptText}>
                  {index + 1}. {item.concept}
                </Text>
                {item.failCount >= 3 && (
                  <View style={styles.warningBadge}>
                    <FontAwesome5 name="exclamation-triangle" size={12} color="#FFF" style={{marginRight: 4}} />
                    <Text style={styles.warningText}>긴급 복습!</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.noteFooter}>
                <View style={styles.statBox}>
                  <FontAwesome5 name="times-circle" size={14} color={colors.error} />
                  <Text style={styles.footerText}>오답: {item.failCount}회</Text>
                </View>
                <View style={styles.statBox}>
                  <FontAwesome5 name="clock" size={14} color="#888" />
                  <Text style={styles.footerText}>{item.lastFailed}</Text>
                </View>
              </View>

              <View style={styles.actionPrompt}>
                <Text style={styles.actionText}>터치해서 다시 가르치기</Text>
                <FontAwesome5 name="arrow-right" size={14} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Teach Again Action Modal */}
      <Modal
        visible={!!selectedWeakness}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedWeakness(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <FontAwesome5 name="lightbulb" size={32} color="#FFD166" style={{marginBottom: 12}} />
              <Text style={styles.modalTitle}>다시 가르치기</Text>
              <Text style={styles.modalSubtitle}>
                '{selectedWeakness?.concept}' 을(를) 어떻게 가르쳐볼까요?
              </Text>
            </View>

            <View style={styles.modalActions}>
              <CustomButton 
                title="개념부터 차근차근" 
                variant="primary" 
                iconName="book-open"
                style={{marginBottom: 12}}
                onPress={() => {
                  setSelectedWeakness(null);
                  navigation.navigate('Chat', { studentName, gender });
                }}
              />
              <CustomButton 
                title="비슷한 문제 같이 풀기" 
                variant="colorful" 
                iconName="pen"
                style={{marginBottom: 12}}
                onPress={() => {
                  setSelectedWeakness(null);
                  navigation.navigate('Chat', { studentName, gender });
                }}
              />
              <CustomButton 
                title="다음에 가르치기 (닫기)" 
                variant="secondary" 
                style={{marginTop: 8}}
                onPress={() => setSelectedWeakness(null)}
              />
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F0E6', // slightly darker pastel background for notes
  },
  header: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: '#DDA7A5', // Pastel Coral/Red for danger/locker vibe
    borderBottomWidth: 4,
    borderBottomColor: '#C49391',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 30,
    color: '#FFF',
  },
  headerSubtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#FFF0F0',
  },
  listContainer: {
    padding: 20,
    gap: 20,
  },
  noteItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5D6C5',
    shadowColor: '#D4C5B3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    overflow: 'hidden',
  },
  ribbon: {
    width: 12,
  },
  ribbonDanger: {
    backgroundColor: colors.error,
  },
  ribbonSafe: {
    backgroundColor: colors.primary,
  },
  noteContent: {
    flex: 1,
    padding: 20,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  conceptText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: colors.textDark,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  warningText: {
    fontFamily: 'Jua_400Regular',
    color: '#FFF',
    fontSize: 14,
  },
  noteFooter: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  footerText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#666',
  },
  actionPrompt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderTopColor: '#EEE',
    paddingTop: 16,
  },
  actionText: {
    fontFamily: 'Jua_400Regular',
    color: colors.primary,
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#EAE1D3',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 26,
    color: colors.primary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: colors.textDark,
    textAlign: 'center',
  },
  modalActions: {
    width: '100%',
  },
});
