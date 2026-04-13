// src/screens/SubjectListScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, Pressable, ActivityIndicator, Alert, RefreshControl, Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { subjectsApi } from '../api/subjects';
import { useAuth } from '../context/AuthContext';
import { Subject } from '../types';
import { colors } from '../theme/colors';

const PERSONALITY_LABEL: Record<string, string> = {
  curious: '호기심쟁이',
  careful: '신중이',
  clumsy: '덤벙이',
  perfectionist: '완벽주의자',
};

export const SubjectListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await subjectsApi.list();
      setSubjects(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('오류', '과목 목록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchSubjects();
  }, [fetchSubjects]));

  const handleDelete = (subject: Subject) => {
    const doDelete = async () => {
      try {
        await subjectsApi.delete(subject.id);
        setSubjects(prev => prev.filter(s => s.id !== subject.id));
      } catch {
        Alert.alert('오류', '삭제에 실패했어요.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`"${subject.name}" 과목과 모든 학습 기록이 삭제됩니다. 계속할까요?`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        '과목 삭제',
        `"${subject.name}" 과목과 모든 학습 기록이 삭제됩니다. 계속할까요?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '삭제', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const handleEnter = (subject: Subject) => {
    if (!subject.persona) {
      // 페르소나 미설정 → 온보딩부터
      navigation.navigate('Onboarding', { existingSubjectId: subject.id });
      return;
    }
    navigation.navigate('Home', { subjectId: subject.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>과외 학생 고르기</Text>
          <Text style={styles.headerSub}>오늘은 어떤 학생과 함께하시나요?</Text>
        </View>
        <TouchableOpacity
          onPress={async () => {
            if (Platform.OS === 'web') {
              if (window.confirm('로그아웃 할까요?')) await logout();
            } else {
              Alert.alert('로그아웃', '로그아웃 할까요?', [
                { text: '취소', style: 'cancel' },
                { text: '로그아웃', onPress: logout },
              ]);
            }
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ padding: 8 }}
        >
          <FontAwesome5 name="sign-out-alt" size={22} color={colors.secondaryDark} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSubjects(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="seedling" size={60} color={colors.primaryLight} />
            <Text style={styles.emptyTitle}>아직 과목이 없어요</Text>
            <Text style={styles.emptySub}>첫 번째 과목을 만들고{'\n'} AI 과외 학생을 키워보세요!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            onPress={() => handleEnter(item)}
          >
            {/* 카드 좌측 컬러 바 */}
            <View style={[styles.cardAccent, { backgroundColor: colors.primary }]} />

            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={{ padding: 6 }}
                >
                  <FontAwesome5 name="trash-alt" size={16} color="#CCC" />
                </TouchableOpacity>
              </View>

              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
              ) : null}

              {item.persona ? (
                <View style={styles.personaRow}>
                  <FontAwesome5 name="user-graduate" size={13} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.personaText}>
                    {item.persona.name} ({PERSONALITY_LABEL[item.persona.personality] ?? item.persona.personality})
                  </Text>
                </View>
              ) : (
                <View style={styles.personaRow}>
                  <FontAwesome5 name="exclamation-circle" size={13} color={colors.secondary} style={{ marginRight: 6 }} />
                  <Text style={[styles.personaText, { color: colors.secondary }]}>제자 미설정</Text>
                </View>
              )}
            </View>

            <FontAwesome5 name="chevron-right" size={16} color={colors.primaryLight} style={{ alignSelf: 'center', marginRight: 16 }} />
          </Pressable>
        )}
      />

      {/* 새 과목 만들기 FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Onboarding', {})}
      >
        <FontAwesome5 name="plus" size={22} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 28,
    color: colors.primary,
  },
  headerSub: {
    fontFamily: 'Jua_400Regular',
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardAccent: {
    width: 6,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  cardBody: {
    flex: 1,
    padding: 16,
    gap: 6,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: colors.textDark,
    flex: 1,
  },
  cardDesc: {
    fontFamily: 'Jua_400Regular',
    fontSize: 14,
    color: '#888',
  },
  personaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  personaText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 14,
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: colors.textDark,
  },
  emptySub: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
