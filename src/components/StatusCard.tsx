// src/components/StatusCard.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface StatusCardProps {
  studentName: string;
  subjectName?: string;
  stageName?: string;
  progressText?: string;
  memoryRetention: number; // 0 to 100
  style?: ViewStyle;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  studentName,
  subjectName,
  stageName,
  progressText,
  memoryRetention,
  style,
}) => {
  const getMemoryColor = () => {
    if (memoryRetention > 75) return '#4CAF50'; // Green
    if (memoryRetention > 40) return '#FFEB3B'; // Yellow
    return '#FF5252'; // Red
  };

  const getMemoryLabel = () => {
    if (memoryRetention > 75) return '🟢 선명함';
    if (memoryRetention > 40) return '🟡 흐릿해지는 중';
    return '🔴 복습 필요';
  };

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.nameText}>{studentName}의 수첩</Text>
        <View style={styles.stageBadge}>
          <Text style={styles.stageBadgeText}>{stageName}</Text>
        </View>
      </View>

      <Text style={styles.subjectText}>{subjectName} ({progressText})</Text>

      <View style={styles.retentionContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6}}>
          <Text style={styles.retentionLabel}>기억 유지율</Text>
          <Text style={styles.retentionStatus}>{getMemoryLabel()}</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.max(0, Math.min(100, memoryRetention))}%`, backgroundColor: getMemoryColor() },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#EAE1D3',
    shadowColor: '#CDA883',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 22, 
    fontFamily: "Jua_400Regular",
    color: colors.textDark,
  },
  stageBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stageBadgeText: {
    fontSize: 16,
    fontFamily: "Jua_400Regular",
    color: '#FFF',
  },
  subjectText: {
    fontSize: 16,
    fontFamily: "Jua_400Regular",
    color: '#8C7A5E',
    marginBottom: 16,
  },
  retentionContainer: {
    marginTop: 8,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  retentionLabel: {
    fontSize: 16, 
    fontFamily: "Jua_400Regular",
    color: colors.textDark,
  },
  retentionStatus: {
    fontSize: 14,
    fontFamily: "Jua_400Regular",
    color: '#666',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#EBEBEB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
});
