// src/screens/SyllabusScreen.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

export const SyllabusScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { 
    subjectName = '웹 기초', 
    stages = [
      { name: '1단계', items: ["HTML 기본", "CSS 스타일링"] },
      { name: '2단계', items: ["JS 변수와 조건문", "JS 반복문"] },
      { name: '3단계', items: ["DOM 조작", "이벤트 리스너"] }
    ] 
  } = route.params || {};

  const currentStageIndex = 0; // Mock: currently at step 1
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 16}}>
            <FontAwesome5 name="arrow-left" size={24} color="#3E2723" />
          </TouchableOpacity>
          <FontAwesome5 name="map" size={28} color="#3E2723" style={{marginRight: 12}} />
          <Text style={styles.headerTitle}>우리 반 진도표</Text>
        </View>
        <Text style={styles.headerSubtitle}>[{subjectName}] 커리큘럼 로드맵</Text>
      </View>

      <Animated.ScrollView 
        contentContainerStyle={styles.boardContainer}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        <View style={styles.corkboard}>
          {/* Vertical dash line linking the notes */}
          <View style={styles.timelineLine} />

          {stages.map((stage: any, index: number) => {
            const isCurrent = index === currentStageIndex;
            const isCompleted = index < currentStageIndex;
            
            return (
              <View key={index} style={styles.stageCardWrapper}>
                
                {/* Note Paper */}
                <View style={[styles.noteCard, isCurrent && styles.noteCardCurrent]}>
                  {/* Pin Graphic */}
                  <View style={styles.pinIcon}>
                    <FontAwesome5 name="thumbtack" size={28} color={isCompleted ? "#4CAF50" : (isCurrent ? "#F44336" : "#9E9E9E")} />
                  </View>

                  <View style={styles.cardHeader}>
                    <Text style={[styles.stageName, isCurrent && styles.stageNameCurrent]}>
                      {stage.name}
                    </Text>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>진행 중</Text>
                      </View>
                    )}
                    {isCompleted && (
                      <FontAwesome5 name="check-circle" size={20} color="#4CAF50" />
                    )}
                  </View>

                  <View style={styles.cardBody}>
                    {stage.items && stage.items.map((item: any, i: number) => {
                      const itemName = typeof item === 'string' ? item : item.name;
                      return (
                        <View key={i} style={styles.itemRow}>
                          <FontAwesome5 name="check" size={14} color="#795548" style={{minWidth: 20}} />
                          <Text style={styles.itemText}>{itemName}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
                
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8D6E63', // Outer rim color (wood)
  },
  header: {
    backgroundColor: '#3E2723', // Dark brown header
    padding: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#271917',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEBE9', // Light paper background behind title
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  headerTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 26,
    color: '#3E2723',
  },
  headerSubtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#D7CCC8',
    marginTop: 12,
    marginLeft: 8,
  },
  boardContainer: {
    padding: 16,
    paddingBottom: 60,
  },
  corkboard: {
    backgroundColor: '#C19A6B', // Cork texture base color
    borderRadius: 12,
    padding: 24,
    minHeight: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 6,
    borderColor: '#795548', // Wood frame
  },
  timelineLine: {
    position: 'absolute',
    top: 40,
    bottom: 40,
    left: 44, // Align with pins
    width: 4,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#8D6E63', // faint line on corkboard
    zIndex: 1,
  },
  stageCardWrapper: {
    marginBottom: 32,
    position: 'relative',
    paddingLeft: 40, // Space for timeline line
    zIndex: 2,
  },
  noteCard: {
    backgroundColor: '#F7F3E8', // Light yellow/cream paper
    borderRadius: 8,
    padding: 20,
    paddingTop: 24, // Space for pin
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E8E1CE',
  },
  noteCardCurrent: {
    backgroundColor: '#E8F5E9', // Slight green tint for current
    borderWidth: 2,
    borderColor: '#81C784',
    transform: [{ rotate: '-1deg' }],
  },
  pinIcon: {
    position: 'absolute',
    top: -14,
    left: -20, // Push pin slightly off-center to left to align with timeline
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(121, 85, 72, 0.2)',
    paddingBottom: 12,
    marginBottom: 16,
  },
  stageName: {
    fontFamily: 'Jua_400Regular',
    fontSize: 22,
    color: '#4E342E',
  },
  stageNameCurrent: {
    color: '#2E7D32',
    fontSize: 24,
  },
  currentBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  currentBadgeText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 14,
    color: '#FFF',
  },
  cardBody: {
    paddingLeft: 8,
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#5D4037',
    lineHeight: 24,
  },
});
