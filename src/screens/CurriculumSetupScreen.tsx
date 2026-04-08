// src/screens/CurriculumSetupScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { colors } from '../theme/colors';

export interface CurriculumItem {
  id: string;
  title: string;
}

export const CurriculumSetupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const onboardingParams = route.params || {};

  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState<CurriculumItem[]>([
    { id: '1', title: 'HTML 기본 구조' }, // Default examples to help user
    { id: '2', title: 'CSS 박스 모델' }
  ]);

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems(prev => [...prev, { id: Date.now().toString(), title: newItem.trim() }]);
      setNewItem('');
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
  };

  const handleNext = () => {
    if (items.length > 0) {
      navigation.navigate('StageSetup', { ...onboardingParams, curriculumItems: items });
    }
  };

  const renderItem = ({ item, index }: { item: CurriculumItem; index: number }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemIndex}>{index + 1}.</Text>
      <Text style={styles.itemText} numberOfLines={1}>{item.title}</Text>
      
      <View style={styles.itemControls}>
        <TouchableOpacity onPress={() => moveUp(index)} disabled={index === 0} style={styles.ctrlBtn}>
          <FontAwesome5 name="chevron-up" size={16} color={index === 0 ? '#E0E0E0' : colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => moveDown(index)} disabled={index === items.length - 1} style={styles.ctrlBtn}>
          <FontAwesome5 name="chevron-down" size={16} color={index === items.length - 1 ? '#E0E0E0' : colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeItem(item.id)} style={[styles.ctrlBtn, { marginLeft: 8 }]}>
          <FontAwesome5 name="trash" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome5 name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>커리큘럼 공방</Text>
          <Text style={styles.headerSubtitle}>가르칠 내용을 자유롭게 적어보세요</Text>
        </View>

        <View style={styles.boardContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="학습 항목 (예: 조건문과 반복문)"
              value={newItem}
              onChangeText={setNewItem}
              onSubmitEditing={handleAddItem}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
              <FontAwesome5 name="plus" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>가르칠 항목을 추가해주세요!</Text>
            }
          />

          <View style={styles.actionContainer}>
            <CustomButton
              title="다음: 단계(Stage) 묶기"
              iconName="arrow-right"
              variant="colorful"
              onPress={handleNext}
              style={items.length === 0 ? { opacity: 0.5 } : {}}
              disabled={items.length === 0}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3B6B4C', // Chalkboard green vibe
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: '#2D5239',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 32,
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#D1E8D9',
  },
  boardContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FAF3E0',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Jua_400Regular',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5D6C5',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: colors.textDark,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#EAE1D3',
  },
  itemIndex: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: colors.secondaryDark,
    marginRight: 10,
    width: 24,
  },
  itemText: {
    flex: 1,
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: colors.textDark,
  },
  itemControls: {
    flexDirection: 'row',
  },
  ctrlBtn: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 40,
  },
  actionContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
});
