// src/components/ResultModal.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface ResultModalProps {
  visible: boolean;
  score: number;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ visible, score, onClose }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalBox, { transform: [{ scale: scaleValue }] }]}>
          
          <View style={styles.stamp}>
            <FontAwesome5 name="medal" size={40} color="#FFD166" />
          </View>
          
          <Text style={styles.title}>참 잘했어요!</Text>
          <Text style={styles.subtitle}>민이가 한 뼘 더 성장했어요.</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>수업 품질 점수</Text>
            <Text style={styles.scoreValue}>{score}점</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>교실로 돌아가기</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E5D6C5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  stamp: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: '#FFD166',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Jua_400Regular',
    fontSize: 28,
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: '#8C7A5E',
    marginBottom: 24,
    textAlign: 'center',
  },
  scoreContainer: {
    backgroundColor: '#F5F0E6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  scoreLabel: {
    fontFamily: 'Jua_400Regular',
    fontSize: 14,
    color: '#8C7A5E',
    marginBottom: 4,
  },
  scoreValue: {
    fontFamily: 'Jua_400Regular',
    fontSize: 36,
    color: colors.textDark,
  },
  button: {
    backgroundColor: colors.secondaryDark,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#603E26',
  },
  buttonText: {
    fontFamily: 'Jua_400Regular',
    fontSize: 18,
    color: '#FFF',
  },
});
