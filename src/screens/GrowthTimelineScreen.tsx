// src/screens/GrowthTimelineScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const GrowthTimelineScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Default mock stages if none are passed
  const fallbackStages = [
    { name: '1단계', items: ["HTML 기본", "CSS 기초"] },
    { name: '2단계', items: ["변수와 함수", "조건문"] },
    { name: '3단계', items: ["배열과 객체", "반복문"] },
    { name: '4단계', items: ["React 컴포넌트", "State 활용"] }
  ];

  const { studentName = '민이', stages = fallbackStages } = route.params || {};

  // For visual demonstration, we assume stage 0 is completed, stage 1 is current, stage 2+ are future
  // You would normally calculate this from user's actual progress object.
  const currentStageIndex = stages.length > 1 ? 1 : 0; 
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 16}}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{studentName} 성장 앨범</Text>
      </View>

      <Animated.ScrollView contentContainerStyle={styles.container} style={{opacity: fadeAnim}}>
        <View style={styles.timelineWrapper}>
          <View style={styles.treeTrunk} />

          {stages.map((stage: any, index: number) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isFuture = index > currentStageIndex;

            return (
              <View key={index} style={styles.timelineItem}>
                
                {/* Badge/Dot aligned to trunk */}
                <View style={[
                    styles.timelineDot, 
                    isCurrent && styles.timelineDotCurrent,
                    isCompleted && styles.timelineDotCompleted,
                ]}>
                  {isCompleted && <FontAwesome5 name="check" size={14} color="#FFF" />}
                  {isCurrent && <FontAwesome5 name="seedling" size={16} color="#FFF" />}
                  {isFuture && <FontAwesome5 name="lock" size={12} color="#D1BFAe" />}
                </View>

                {/* Card */}
                <View style={[
                  styles.timelineCard, 
                  isCurrent && styles.activeCard,
                  isFuture && styles.futureCard
                ]}>
                  
                  <View style={styles.cardHeader}>
                    <Text style={[
                      styles.cardTitle, 
                      isCurrent && styles.activeText,
                      isFuture && styles.futureText
                    ]}>
                      {stage.name}
                    </Text>

                    {isCompleted && (
                      <View style={styles.badgeCompleted}>
                        <FontAwesome5 name="medal" size={12} color="#FFF" style={{marginRight: 4}} />
                        <Text style={styles.badgeCompletedText}>달성 완료</Text>
                      </View>
                    )}
                    {isCurrent && (
                      <View style={styles.badgeCurrent}>
                        <FontAwesome5 name="fire-alt" size={12} color="#FFF" style={{marginRight: 4}} />
                        <Text style={styles.badgeCurrentText}>성장 중</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.itemList}>
                    {stage.items && stage.items.map((item: any, idx: number) => {
                      const itemName = typeof item === 'string' ? item : item.name;
                      
                      let iconName = "square"; // regular
                      let iconColor = colors.primary;
                      
                      if (isCompleted) {
                        iconName = "check-square"; // solid
                        iconColor = "#4CAF50";
                      } else if (isFuture) {
                        iconName = "lock";
                        iconColor = "#B0BEC5";
                      }

                      return (
                         <View key={idx} style={styles.itemRow}>
                          <FontAwesome5 name={iconName} solid={iconName !== 'square'} size={isFuture ? 14 : 16} color={iconColor} style={styles.itemIcon} />
                          <Text style={[
                            styles.itemText,
                            isCompleted && styles.itemTextCompleted,
                            isFuture && styles.itemTextFuture
                          ]}>
                            {itemName}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.encouragement}>
          <FontAwesome5 name="heart" size={24} color={colors.error} style={{marginBottom: 8}} />
          <Text style={styles.encouragementText}>다음 진급까지 멋지게 이끌어주세요!</Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F6F0',
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 24,
    color: '#FFF',
  },
  container: {
    padding: 24,
    paddingTop: 40,
  },
  timelineWrapper: {
    position: 'relative',
    paddingLeft: 40, // Space for trunk
  },
  treeTrunk: {
    position: 'absolute',
    left: 20,
    top: 20,
    bottom: 20,
    width: 6,
    backgroundColor: '#D1BFAe',
    borderRadius: 3,
  },
  timelineItem: {
    marginBottom: 32,
    position: 'relative',
    justifyContent: 'center',
  },
  timelineDot: {
    position: 'absolute',
    left: -35,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#D1BFAe',
    zIndex: 2,
  },
  timelineDotCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    transform: [{scale: 1.2}],
  },
  timelineDotCompleted: {
    backgroundColor: '#8BC34A',
    borderColor: '#8BC34A',
  },
  timelineCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EAE1D3',
    shadowColor: '#C4B59D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2,
  },
  activeCard: {
    borderColor: colors.primary,
    borderWidth: 3,
    shadowOpacity: 1,
    shadowColor: colors.primary,
  },
  futureCard: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 20,
    color: colors.textDark,
  },
  activeText: {
    color: colors.primary,
    fontSize: 22,
  },
  futureText: {
    color: '#9E9E9E',
  },
  badgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCompletedText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 12,
    color: '#FFF',
  },
  badgeCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7043',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCurrentText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 12,
    color: '#FFF',
  },
  itemList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 24,
    textAlign: 'center',
  },
  itemText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: colors.secondaryDark,
  },
  itemTextCompleted: {
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  itemTextFuture: {
    color: '#BDBDBD',
  },
  encouragement: {
    marginTop: 40,
    alignItems: 'center',
  },
  encouragementText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#A09282',
  },
});
