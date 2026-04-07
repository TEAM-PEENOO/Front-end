// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusCard } from '../components/StatusCard';
import { CustomButton } from '../components/CustomButton';
import { colors } from '../theme/colors';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { studentName = '민이', gender = 'girl' } = route.params || {};

  const characterSource = gender === 'boy' 
    ? require('../../assets/images/boy_character.png')
    : require('../../assets/images/girl_character.png');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground 
        source={require('../../assets/images/classroom_bg.png')} 
        style={styles.bgImage}
        imageStyle={{ opacity: 0.85 }} // slightly dimmed to let UI pop
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* Top Header - Glassmorphism style to see bg */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome5 name="store-alt" size={24} color={colors.secondaryDark} style={{ marginRight: 10 }} />
              <Text style={styles.headerTitle}>햇살 드는 1학년 2반</Text>
            </View>
            <Text style={styles.headerSubtitle}>오늘도 {studentName}와 힘차게 시작해볼까요?</Text>
          </View>

          {/* Character Stage Area */}
          <View style={styles.stageContainer}>
            <View style={styles.characterFrame}>
              <Image 
                source={characterSource} 
                style={styles.characterImg} 
                resizeMode="cover"
              />
            </View>
            <View style={styles.characterSpeechBubble}>
              <Text style={styles.speechText}>
                "선생님! 오늘은 어떤 걸 배울까요?"
              </Text>
            </View>
          </View>

          {/* Status Card - Clickable for Growth Timeline */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('GrowthTimeline')} style={{ zIndex: 10 }}>
            <StatusCard
              studentName={studentName}
              level={3}
              memoryRetention={76}
              style={styles.statusCard}
            />
          </TouchableOpacity>

          {/* Wood UI Board wrapping action buttons */}
          <View style={styles.woodBoardContainer}>
            <View style={styles.woodBoardInner}>
              <View style={styles.actionGrid}>
                <CustomButton
                  title="가르치기 (수업 시작)"
                  variant="primary"
                  iconName="chalkboard-teacher"
                  style={styles.mainActionBtn}
                  textStyle={styles.mainActionText}
                  onPress={() => navigation.navigate('Chat', { studentName, gender })}
                />
                <View style={styles.secondaryActionRow}>
                  <CustomButton
                    title="시험 보기"
                    variant="colorful"
                    iconName="award"
                    style={styles.subActionBtn}
                    onPress={() => navigation.navigate('Exam', { studentName, gender })}
                  />
                  <CustomButton
                    title="오답 사물함"
                    variant="secondary"
                    iconName="archive"
                    style={styles.subActionBtn}
                    onPress={() => navigation.navigate('Weakness', { studentName, gender })}
                  />
                </View>
              </View>
            </View>
          </View>

        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    padding: 24,
    paddingBottom: 60, // extra padding to clear scrolling
  },
  header: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 243, 212, 0.92)', // Glassy cream
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD166',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    color: colors.secondaryDark,
    fontFamily: 'Jua_400Regular',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8C7A5E',
    marginTop: 8,
    fontFamily: 'Jua_400Regular',
  },
  stageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
    position: 'relative',
    zIndex: 2,
  },
  characterFrame: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF',
    borderWidth: 6,
    borderColor: colors.primary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  characterImg: {
    width: '100%',
    height: '100%',
  },
  characterSpeechBubble: {
    position: 'absolute',
    top: -20,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderWidth: 3,
    borderColor: '#E5D6C5',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  speechText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: colors.textDark,
  },
  statusCard: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  woodBoardContainer: {
    backgroundColor: '#CDA883', // Soft wooden color base
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#8A5A44', // Darker wood contour
    borderBottomWidth: 10,  // Fake 3D depth mimicking tabletop
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  woodBoardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)', // Frost layer
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  actionGrid: {
    gap: 16,
  },
  mainActionBtn: {
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  mainActionText: {
    fontSize: 24,
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  subActionBtn: {
    flex: 1,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
