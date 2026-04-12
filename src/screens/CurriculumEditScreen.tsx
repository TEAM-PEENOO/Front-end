// src/screens/CurriculumEditScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { curriculumApi } from '../api/curriculum';
import { CurriculumItem } from '../types';
import { colors } from '../theme/colors';

type EditingState = { id: string; title: string } | null;

export const CurriculumEditScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId, subjectName = '' } = route.params || {};

  const [items, setItems] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editing, setEditing] = useState<EditingState>(null);

  const fetchItems = useCallback(async () => {
    try {
      const data = await curriculumApi.list(subjectId);
      setItems(data.sort((a, b) => a.order_index - b.order_index));
    } catch {
      Alert.alert('오류', '커리큘럼 목록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── 추가 ──────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      setSaving(true);
      const created = await curriculumApi.create(subjectId, title, undefined, items.length);
      setItems(prev => [...prev, created]);
      setNewTitle('');
    } catch {
      Alert.alert('오류', '항목을 추가하지 못했어요.');
    } finally {
      setSaving(false);
    }
  };

  // ── 수정 완료 ──────────────────────────────────────────────────────────
  const handleUpdateTitle = async () => {
    if (!editing) return;
    const title = editing.title.trim();
    if (!title) { setEditing(null); return; }
    try {
      setSaving(true);
      await curriculumApi.update(subjectId, editing.id, { title });
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, title } : i));
    } catch {
      Alert.alert('오류', '항목을 수정하지 못했어요.');
    } finally {
      setSaving(false);
      setEditing(null);
    }
  };

  // ── 삭제 ──────────────────────────────────────────────────────────────
  const handleDelete = (item: CurriculumItem) => {
    Alert.alert(
      '항목 삭제',
      `"${item.title}"을(를) 삭제할까요?\n가르친 내용이 있으면 기록도 함께 사라져요.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제', style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await curriculumApi.delete(subjectId, item.id);
              setItems(prev => prev.filter(i => i.id !== item.id));
            } catch {
              Alert.alert('오류', '항목을 삭제하지 못했어요.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  // ── 순서 이동 ──────────────────────────────────────────────────────────
  const handleMove = async (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const newItems = [...items];
    [newItems[idx], newItems[targetIdx]] = [newItems[targetIdx], newItems[idx]];
    setItems(newItems);
    try {
      await curriculumApi.reorder(subjectId, newItems.map(i => i.id));
    } catch {
      Alert.alert('오류', '순서를 저장하지 못했어요.');
      setItems(items); // 롤백
    }
  };

  // ── 다음 단계 편집으로 ────────────────────────────────────────────────
  const handleNext = () => {
    navigation.navigate('StageEdit', { subjectId, subjectName, curriculumItems: items });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
            <FontAwesome5 name="arrow-left" size={22} color="#3E2723" />
          </TouchableOpacity>
          <FontAwesome5 name="book-open" size={24} color="#3E2723" style={{ marginRight: 10 }} />
          <Text style={styles.headerTitle}>커리큘럼 편집</Text>
        </View>
        <Text style={styles.headerSubtitle}>[{subjectName}] 학습 항목을 수정해요</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* 안내 */}
          <View style={styles.infoBox}>
            <FontAwesome5 name="info-circle" size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.infoText}>항목을 탭하면 이름을 수정할 수 있어요. 화살표로 순서를 바꿀 수 있어요.</Text>
          </View>

          {/* 항목 리스트 */}
          {items.map((item, idx) => (
            <View key={item.id} style={styles.itemRow}>
              {/* 순서 버튼 */}
              <View style={styles.orderButtons}>
                <TouchableOpacity
                  onPress={() => handleMove(idx, -1)}
                  disabled={idx === 0}
                  style={[styles.orderBtn, idx === 0 && styles.orderBtnDisabled]}
                >
                  <FontAwesome5 name="chevron-up" size={12} color={idx === 0 ? '#DDD' : '#888'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMove(idx, 1)}
                  disabled={idx === items.length - 1}
                  style={[styles.orderBtn, idx === items.length - 1 && styles.orderBtnDisabled]}
                >
                  <FontAwesome5 name="chevron-down" size={12} color={idx === items.length - 1 ? '#DDD' : '#888'} />
                </TouchableOpacity>
              </View>

              {/* 순번 */}
              <Text style={styles.indexText}>{idx + 1}</Text>

              {/* 제목 (편집 모드 or 표시 모드) */}
              {editing?.id === item.id ? (
                <TextInput
                  style={styles.editInput}
                  value={editing.title}
                  onChangeText={t => setEditing({ id: item.id, title: t })}
                  onBlur={handleUpdateTitle}
                  onSubmitEditing={handleUpdateTitle}
                  autoFocus
                  returnKeyType="done"
                />
              ) : (
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => setEditing({ id: item.id, title: item.title })}
                >
                  <Text style={[styles.itemTitle, item.taught && styles.itemTitleTaught]}>
                    {item.title}
                    {item.taught && <Text style={styles.taughtBadge}> ✓ 학습됨</Text>}
                  </Text>
                </TouchableOpacity>
              )}

              {/* 삭제 버튼 */}
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <FontAwesome5 name="trash" size={14} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          {items.length === 0 && (
            <View style={styles.emptyBox}>
              <FontAwesome5 name="inbox" size={40} color="#DDD" />
              <Text style={styles.emptyText}>아직 항목이 없어요. 아래에서 추가해보세요!</Text>
            </View>
          )}

          {/* 새 항목 추가 */}
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="새 학습 항목 이름..."
              placeholderTextColor="#BBB"
              value={newTitle}
              onChangeText={setNewTitle}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addBtn, !newTitle.trim() && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={!newTitle.trim() || saving}
            >
              <FontAwesome5 name="plus" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* 다음 버튼 */}
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <FontAwesome5 name="layer-group" size={16} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.nextBtnText}>단계 편집하기</Text>
                <FontAwesome5 name="arrow-right" size={16} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FEF9EC' },
  header: {
    backgroundColor: '#FEF3C7', paddingTop: 56, paddingBottom: 18,
    paddingHorizontal: 24, borderBottomWidth: 3, borderColor: '#D4B886',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  headerTitle: { fontFamily: 'Jua_400Regular', fontSize: 24, color: '#3E2723' },
  headerSubtitle: { fontFamily: 'Jua_400Regular', fontSize: 14, color: '#8C7A5E', marginLeft: 44 },
  container: { padding: 16, paddingBottom: 48, gap: 12 },
  infoBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12,
  },
  infoText: { fontFamily: 'Jua_400Regular', fontSize: 13, color: '#4A7C59', flex: 1 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1.5, borderColor: '#EAE1D3',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    gap: 8,
  },
  orderButtons: { flexDirection: 'column', gap: 2 },
  orderBtn: {
    width: 24, height: 24, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 6,
  },
  orderBtnDisabled: { backgroundColor: '#FAFAFA' },
  indexText: { fontFamily: 'Jua_400Regular', fontSize: 13, color: '#AAA', width: 20, textAlign: 'center' },
  itemTitle: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#3E2723', flex: 1 },
  itemTitleTaught: { color: colors.success },
  taughtBadge: { fontFamily: 'Jua_400Regular', fontSize: 12, color: colors.success },
  editInput: {
    flex: 1, fontFamily: 'Jua_400Regular', fontSize: 16, color: '#3E2723',
    backgroundColor: '#FFF9E6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  deleteBtn: {
    width: 32, height: 32, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFF0F0', borderRadius: 8,
  },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontFamily: 'Jua_400Regular', fontSize: 15, color: '#AAA', textAlign: 'center' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addInput: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
    fontFamily: 'Jua_400Regular', fontSize: 15, color: '#3E2723',
    borderWidth: 1.5, borderColor: '#EAE1D3',
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: '#C8E6C9' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.secondary, borderRadius: 16, paddingVertical: 16, marginTop: 8,
  },
  nextBtnText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#FFF' },
});
