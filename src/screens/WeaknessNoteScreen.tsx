// src/screens/WeaknessNoteScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { weakPointsApi } from '../api/weakPoints';
import { josa } from '../utils/korean';
import { WeakPointTag } from '../types';

const DUST_COLORS = ['#E8F5E9', '#FFF9C4', '#FFECB3', '#FFCDD2', '#EF9A9A'];

export const WeaknessNoteScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId, studentName = '' } = route.params || {};

  const [tags, setTags] = useState<WeakPointTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      const data = await weakPointsApi.list(subjectId);
      setTags(data);
    } catch {
      Alert.alert('오류', '약점 목록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [subjectId]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchTags();
  }, [fetchTags]));

  const handleDelete = (tag: WeakPointTag) => {
    Alert.alert(
      '약점 해소',
      `"${tag.concept}"를 약점 목록에서 제거할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '제거',
          style: 'destructive',
          onPress: async () => {
            try {
              await weakPointsApi.delete(subjectId, tag.id);
              setTags(prev => prev.filter(t => t.id !== tag.id));
            } catch {
              Alert.alert('오류', '삭제에 실패했어요.');
            }
          },
        },
      ]
    );
  };

  const getDustStyle = (failCount: number) => {
    const idx = Math.min(failCount - 1, DUST_COLORS.length - 1);
    return { backgroundColor: DUST_COLORS[idx] };
  };

  const handlePractice = (item: WeakPointTag) => {
    navigation.navigate('Practice', { subjectId, studentName, concept: item.concept });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home', { subjectId })} style={{ marginRight: 16 }}>
            <FontAwesome5 name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <FontAwesome5 name="archive" size={28} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={styles.headerTitle}>개념 사물함</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {studentName ? `${studentName}${josa(studentName, '이', '')}가 헷갈려하는 빈틈을 채워주세요!` : '제자가 헷갈려하는 빈틈을 채워주세요!'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tags}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchTags(); }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="check-circle" size={60} color={colors.primaryLight} />
              <Text style={styles.emptyTitle}>약점 개념이 없어요!</Text>
              <Text style={styles.emptySub}>시험을 잘 보고 있군요.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.noteItem, getDustStyle(item.fail_count)]}
              onPress={() => handlePractice(item)}
              activeOpacity={0.85}
            >
              <View style={styles.noteIcon}>
                <FontAwesome5 name="book" size={22} color={colors.secondaryDark} />
                {item.fail_count >= 3 && (
                  <View style={styles.dustBadge}>
                    <Text style={styles.dustBadgeText}>!</Text>
                  </View>
                )}
              </View>

              <View style={styles.noteBody}>
                <Text style={styles.conceptText}>{item.concept}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.failCountText}>오답 {item.fail_count}회</Text>
                  <Text style={styles.lastFailText}>
                    {new Date(item.last_failed_at).toLocaleDateString('ko-KR')} 마지막 오답
                  </Text>
                </View>
                <Text style={styles.practiceHint}>탭하여 복습 도와주기 →</Text>
              </View>

              <TouchableOpacity
                onPress={(e) => { e.stopPropagation?.(); handleDelete(item); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome5 name="check" size={18} color={colors.success} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.secondaryDark,
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerTitle: { fontFamily: 'Jua_400Regular', fontSize: 26, color: '#FFF' },
  headerSubtitle: { fontFamily: 'Jua_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.75)' },
  listContainer: { padding: 16, gap: 12, paddingBottom: 40 },
  noteItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  noteIcon: { marginRight: 14, position: 'relative' },
  dustBadge: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: colors.error, width: 16, height: 16,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  dustBadgeText: { fontFamily: 'Jua_400Regular', fontSize: 11, color: '#FFF' },
  noteBody: { flex: 1 },
  conceptText: { fontFamily: 'Jua_400Regular', fontSize: 18, color: colors.textDark, marginBottom: 4 },
  metaRow: { flexDirection: 'row', gap: 12 },
  failCountText: { fontFamily: 'Jua_400Regular', fontSize: 13, color: colors.error },
  lastFailText: { fontFamily: 'Jua_400Regular', fontSize: 13, color: '#AAA' },
  practiceHint: { fontFamily: 'Jua_400Regular', fontSize: 12, color: colors.primary, marginTop: 4 },
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontFamily: 'Jua_400Regular', fontSize: 22, color: colors.textDark },
  emptySub: { fontFamily: 'Jua_400Regular', fontSize: 16, color: '#AAA' },
});
