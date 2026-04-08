// src/screens/StageSetupScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { colors } from '../theme/colors';
import { CurriculumItem } from './CurriculumSetupScreen';

export const StageSetupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { curriculumItems = [], ...onboardingParams } = route.params || {};

  const [itemStageMap, setItemStageMap] = useState<Record<string, number>>(() => {
    const initialMap: Record<string, number> = {};
    curriculumItems.forEach((item: CurriculumItem) => {
      initialMap[item.id] = 1;
    });
    return initialMap;
  });

  const [stageNames, setStageNames] = useState<Record<number, string>>({
    1: '1단계',
  });

  const maxStage = useMemo(() => {
    let max = 1;
    Object.values(itemStageMap).forEach(val => {
      if (val > max) max = val;
    });
    return max;
  }, [itemStageMap]);

  const updateItemStage = (id: string, delta: number) => {
    setItemStageMap(prev => {
      const current = prev[id];
      const nextStage = current + delta;
      if (nextStage < 1) return prev;
      return { ...prev, [id]: nextStage };
    });
  };

  const handleNext = () => {
    // Navigate to Home with full config
    // In a real app we'd save to backend DB here.
    const finalStages = [];
    for (let i = 1; i <= maxStage; i++) {
        finalStages.push({
            stageLevel: i,
            name: stageNames[i] || `${i}단계`,
            items: curriculumItems.filter((it: CurriculumItem) => itemStageMap[it.id] === i)
        });
    }

    navigation.reset({
      index: 0,
       routes: [{ 
         name: 'Home', 
         params: { 
           ...onboardingParams,
           stages: finalStages,
         } 
       }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome5 name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>단계(Stage) 묶기</Text>
          <Text style={styles.headerSubtitle}>항목들을 묶어 단계를 나눠보세요</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          <View style={styles.infoCard}>
            <FontAwesome5 name="info-circle" size={20} color={colors.primary} style={{marginRight: 10}}/>
            <Text style={styles.infoText}>+ / - 버튼을 눌러 각 항목이 속할 단계 번호를 조정하세요.</Text>
          </View>

          {Array.from({ length: maxStage }).map((_, idx) => {
            const stageNum = idx + 1;
            return (
              <View key={stageNum} style={styles.stageBlock}>
                <View style={styles.stageHeader}>
                  <Text style={styles.stageBadge}>Stage {stageNum}</Text>
                  <TextInput
                    style={styles.stageNameInput}
                    placeholder={`단계 이름 (예: ${stageNum}단계)`}
                    value={stageNames[stageNum] || ''}
                    onChangeText={text => setStageNames(prev => ({ ...prev, [stageNum]: text }))}
                    placeholderTextColor="#CCC"
                  />
                </View>

                {curriculumItems
                  .filter((item: CurriculumItem) => itemStageMap[item.id] === stageNum)
                  .map((item: CurriculumItem) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemText} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.ctrlGroup}>
                         <TouchableOpacity onPress={() => updateItemStage(item.id, -1)} disabled={stageNum === 1} style={[styles.ctrlBtn, stageNum===1 && styles.ctrlBtnDisabled]}>
                            <FontAwesome5 name="minus" size={14} color={stageNum===1 ? '#CCC' : colors.primary} />
                         </TouchableOpacity>
                         <Text style={styles.stageLabel}>{stageNum}</Text>
                         <TouchableOpacity onPress={() => updateItemStage(item.id, 1)} style={styles.ctrlBtn}>
                             <FontAwesome5 name="plus" size={14} color={colors.primary} />
                         </TouchableOpacity>
                      </View>
                    </View>
                ))}
              </View>
            );
          })}

          <View style={styles.actionContainer}>
            <CustomButton
              title="설정 완료, 교실로 가기!"
              iconName="check-circle"
              variant="primary"
              onPress={handleNext}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#3B6B4C' },
  header: {
    padding: 24, paddingTop: 60, alignItems: 'center', borderBottomWidth: 4, borderColor: '#2D5239',
  },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  headerTitle: { fontFamily: 'Jua_400Regular', fontSize: 32, color: '#FFF', marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#D1E8D9' },
  container: {
    padding: 24, paddingBottom: 60, backgroundColor: '#FAF3E0', minHeight: '100%',
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#C8E6C9'
  },
  infoText: { flex: 1, fontFamily: 'Jua_400Regular', fontSize: 16, color: '#2E7D32' },
  stageBlock: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 2, borderColor: '#EAE1D3',
    shadowColor: '#000', shadowOffset: {width:0, height:3}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  stageHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 2, borderColor: '#F0F0F0', paddingBottom: 12
  },
  stageBadge: {
    fontFamily: 'Jua_400Regular', fontSize: 16, color: '#FFF', backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, overflow: 'hidden', marginRight: 12,
  },
  stageNameInput: {
    flex: 1, fontFamily: 'Jua_400Regular', fontSize: 20, color: colors.textDark, padding: 0,
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F9F9F9'
  },
  itemText: { fontFamily: 'Jua_400Regular', fontSize: 16, color: colors.textDark, flex: 1, marginRight: 10 },
  ctrlGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F5F1', borderRadius: 20, paddingHorizontal: 4, paddingVertical: 4 },
  ctrlBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 16, shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity:0.1, shadowRadius:1, elevation:1 },
  ctrlBtnDisabled: { backgroundColor: '#F9F9F9', elevation: 0 },
  stageLabel: { fontFamily: 'Jua_400Regular', fontSize: 16, width: 24, textAlign: 'center', color: colors.secondaryDark },
  actionContainer: { marginTop: 10, width: '100%' },
});
