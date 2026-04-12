// src/screens/StageEditScreen.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { stagesApi } from '../api/stages';
import { curriculumApi } from '../api/curriculum';
import { Stage, CurriculumItem } from '../types';
import { colors } from '../theme/colors';

// 로컬 편집용 stage 타입 (신규 단계는 id가 없음)
interface LocalStage {
  id?: string;              // 없으면 신규
  name: string;
  assignedItemIds: string[];
  deleted?: boolean;
}

export const StageEditScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId, subjectName = '', curriculumItems: passedItems } = route.params || {};

  const [allItems, setAllItems] = useState<CurriculumItem[]>(passedItems || []);
  const [stages, setStages] = useState<LocalStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 아이템 배정 모달
  const [assignModal, setAssignModal] = useState<{ stageIdx: number } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [stageData, itemData] = await Promise.all([
        stagesApi.list(subjectId),
        passedItems ? Promise.resolve(passedItems as CurriculumItem[]) : curriculumApi.list(subjectId),
      ]);
      const sortedItems = [...itemData].sort((a, b) => a.order_index - b.order_index);
      setAllItems(sortedItems);
      setStages(
        stageData
          .sort((a, b) => a.order_index - b.order_index)
          .map((s: Stage) => ({
            id: s.id,
            name: s.name,
            assignedItemIds: s.curriculum_items.map((i) => i.id),
          }))
      );
    } catch {
      Alert.alert('오류', '단계 목록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── 단계 이름 변경 ──────────────────────────────────────────────────
  const setName = (idx: number, name: string) => {
    setStages(prev => prev.map((s, i) => i === idx ? { ...s, name } : s));
  };

  // ── 단계 삭제 ───────────────────────────────────────────────────────
  const handleDeleteStage = (idx: number) => {
    const stage = stages[idx];
    const label = stage.id ? `"${stage.name}" 단계를 삭제하면 이 단계의 시험 기록도 사라질 수 있어요.` : `"${stage.name}" 단계를 제거할까요?`;
    Alert.alert('단계 삭제', label, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: () => {
          if (stage.id) {
            // 기존 단계: deleted 플래그 설정 (저장 시 DELETE 호출)
            setStages(prev => prev.map((s, i) => i === idx ? { ...s, deleted: true } : s));
          } else {
            // 신규 단계: 그냥 제거
            setStages(prev => prev.filter((_, i) => i !== idx));
          }
        },
      },
    ]);
  };

  // ── 단계 추가 ───────────────────────────────────────────────────────
  const handleAddStage = () => {
    setStages(prev => [...prev, { name: `단계 ${prev.filter(s => !s.deleted).length + 1}`, assignedItemIds: [] }]);
  };

  // ── 아이템 배정 토글 ─────────────────────────────────────────────────
  const toggleItem = (stageIdx: number, itemId: string) => {
    setStages(prev => prev.map((s, i) => {
      if (i !== stageIdx) return s;
      const already = s.assignedItemIds.includes(itemId);
      return {
        ...s,
        assignedItemIds: already
          ? s.assignedItemIds.filter(id => id !== itemId)
          : [...s.assignedItemIds, itemId],
      };
    }));
  };

  // ── 저장 ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const activeStages = stages.filter(s => !s.deleted);
    if (activeStages.some(s => !s.name.trim())) {
      Alert.alert('알림', '모든 단계의 이름을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);

      // 1) 삭제 (기존 단계)
      const toDelete = stages.filter(s => s.id && s.deleted);
      for (const s of toDelete) {
        await stagesApi.delete(subjectId, s.id!);
      }

      // 2) 수정 (기존 단계)
      const toUpdate = stages.filter(s => s.id && !s.deleted);
      for (const s of toUpdate) {
        await stagesApi.update(subjectId, s.id!, {
          name: s.name.trim(),
          curriculum_item_ids: s.assignedItemIds,
        });
      }

      // 3) 신규 생성
      for (let i = 0; i < activeStages.length; i++) {
        const s = activeStages[i];
        if (!s.id) {
          await stagesApi.create(subjectId, s.name.trim(), s.assignedItemIds, i);
        }
      }

      Alert.alert('완료', '단계 편집이 저장됐어요!', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.detail?.message || e?.message || '저장에 실패했어요.';
      Alert.alert('오류', msg);
    } finally {
      setSaving(false);
    }
  };

  // ── 배정 모달 ────────────────────────────────────────────────────────
  const renderAssignModal = () => {
    if (!assignModal) return null;
    const { stageIdx } = assignModal;
    const stage = stages[stageIdx];
    if (!stage) return null;

    return (
      <Modal transparent animationType="slide" onRequestClose={() => setAssignModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{stage.name} — 항목 배정</Text>
              <TouchableOpacity onPress={() => setAssignModal(null)}>
                <FontAwesome5 name="times" size={20} color="#888" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {allItems.map(item => {
                const checked = stage.assignedItemIds.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.modalItemRow}
                    onPress={() => toggleItem(stageIdx, item.id)}
                  >
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <FontAwesome5 name="check" size={10} color="#FFF" />}
                    </View>
                    <Text style={styles.modalItemText}>{item.title}</Text>
                    {item.taught && (
                      <Text style={styles.taughtTag}>학습됨</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
              {allItems.length === 0 && (
                <Text style={styles.emptyText}>커리큘럼 항목이 없어요. 먼저 항목을 추가해주세요.</Text>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setAssignModal(null)}>
              <Text style={styles.modalDoneBtnText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const activeStages = stages.filter(s => !s.deleted);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
            <FontAwesome5 name="arrow-left" size={22} color="#3E2723" />
          </TouchableOpacity>
          <FontAwesome5 name="layer-group" size={24} color="#3E2723" style={{ marginRight: 10 }} />
          <Text style={styles.headerTitle}>단계 편집</Text>
        </View>
        <Text style={styles.headerSubtitle}>[{subjectName}] 학습 단계를 수정해요</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* 안내 */}
          <View style={styles.infoBox}>
            <FontAwesome5 name="info-circle" size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.infoText}>단계 이름을 탭해서 수정하고, "항목 배정" 버튼으로 커리큘럼 항목을 연결해요.</Text>
          </View>

          {/* 단계 카드 */}
          {activeStages.map((stage, visibleIdx) => {
            // stages 배열에서의 실제 인덱스
            const realIdx = stages.indexOf(stage);
            return (
              <View key={`${stage.id ?? 'new'}-${visibleIdx}`} style={styles.stageCard}>
                {/* 단계 헤더 */}
                <View style={styles.stageHeader}>
                  <View style={styles.stageBadge}>
                    <Text style={styles.stageBadgeText}>{visibleIdx + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.stageNameInput}
                    value={stage.name}
                    onChangeText={t => setName(realIdx, t)}
                    placeholder="단계 이름"
                    placeholderTextColor="#BBB"
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={() => handleDeleteStage(realIdx)}
                    style={styles.stageDeleteBtn}
                  >
                    <FontAwesome5 name="trash" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>

                {/* 배정된 항목 */}
                <View style={styles.assignedContainer}>
                  {stage.assignedItemIds.length === 0 ? (
                    <Text style={styles.noItemsText}>아직 배정된 항목이 없어요</Text>
                  ) : (
                    stage.assignedItemIds.map(itemId => {
                      const item = allItems.find(i => i.id === itemId);
                      if (!item) return null;
                      return (
                        <View key={itemId} style={styles.assignedChip}>
                          <FontAwesome5
                            name={item.taught ? 'check-circle' : 'circle'}
                            size={12}
                            color={item.taught ? colors.success : '#CCC'}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.assignedChipText}>{item.title}</Text>
                        </View>
                      );
                    })
                  )}
                </View>

                {/* 항목 배정 버튼 */}
                <TouchableOpacity
                  style={styles.assignBtn}
                  onPress={() => setAssignModal({ stageIdx: realIdx })}
                >
                  <FontAwesome5 name="list-ul" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.assignBtnText}>항목 배정 ({stage.assignedItemIds.length}개)</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {activeStages.length === 0 && (
            <View style={styles.emptyBox}>
              <FontAwesome5 name="layer-group" size={40} color="#DDD" />
              <Text style={styles.emptyText}>아직 단계가 없어요. 아래에서 추가해보세요!</Text>
            </View>
          )}

          {/* 단계 추가 버튼 */}
          <TouchableOpacity style={styles.addStageBtn} onPress={handleAddStage}>
            <FontAwesome5 name="plus" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.addStageBtnText}>단계 추가</Text>
          </TouchableOpacity>

          {/* 저장 버튼 */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <FontAwesome5 name="save" size={16} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>저장하기</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderAssignModal()}
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
  container: { padding: 16, paddingBottom: 48, gap: 14 },
  infoBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12,
  },
  infoText: { fontFamily: 'Jua_400Regular', fontSize: 13, color: '#4A7C59', flex: 1 },
  stageCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 16,
    borderWidth: 2, borderColor: '#EAE1D3',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2,
    gap: 10,
  },
  stageHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stageBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  stageBadgeText: { fontFamily: 'Jua_400Regular', fontSize: 14, color: '#FFF' },
  stageNameInput: {
    flex: 1, fontFamily: 'Jua_400Regular', fontSize: 18, color: '#3E2723',
    backgroundColor: '#FFF9E6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1.5, borderColor: '#EAE1D3',
  },
  stageDeleteBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center',
  },
  assignedContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, minHeight: 28 },
  noItemsText: { fontFamily: 'Jua_400Regular', fontSize: 13, color: '#CCC', paddingLeft: 4 },
  assignedChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0F8F1', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  assignedChipText: { fontFamily: 'Jua_400Regular', fontSize: 13, color: '#3E7C50' },
  assignBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F0F8F1', borderRadius: 12, paddingVertical: 10,
    borderWidth: 1.5, borderColor: colors.primaryLight,
  },
  assignBtnText: { fontFamily: 'Jua_400Regular', fontSize: 15, color: colors.primary },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontFamily: 'Jua_400Regular', fontSize: 15, color: '#AAA', textAlign: 'center', padding: 8 },
  addStageBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.primaryLight, borderStyle: 'dashed',
    borderRadius: 16, paddingVertical: 14,
  },
  addStageBtnText: { fontFamily: 'Jua_400Regular', fontSize: 17, color: colors.primary },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, marginTop: 4,
  },
  saveBtnText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#FFF' },
  // ── 모달 ────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FEF9EC', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24, paddingTop: 8,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: '#EAE1D3',
  },
  modalTitle: { fontFamily: 'Jua_400Regular', fontSize: 18, color: '#3E2723' },
  modalItemRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: '#F3EDE0',
    gap: 12,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#CCC',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  modalItemText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#3E2723', flex: 1 },
  taughtTag: {
    fontFamily: 'Jua_400Regular', fontSize: 12, color: colors.success,
    backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },
  modalDoneBtn: {
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center',
  },
  modalDoneBtnText: { fontFamily: 'Jua_400Regular', fontSize: 17, color: '#FFF' },
});
