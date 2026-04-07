// src/components/StatusCard.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface StatusCardProps {
  studentName: string;
  level: number;
  memoryRetention: number; // 0 to 100
  style?: ViewStyle;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  studentName,
  level,
  memoryRetention,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.nameText}>{studentName}</Text>
        <Text style={styles.levelText}>Lv. {level}</Text>
      </View>
      <View style={styles.retentionContainer}>
        <Text style={styles.retentionLabel}>기억 유지율</Text>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.max(0, Math.min(100, memoryRetention))}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.secondaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nameText: {
    fontSize: 22, fontFamily: "Jua_400Regular",
    fontWeight: '800',
    color: colors.textDark,
  },
  levelText: {
    fontSize: 18, fontFamily: "Jua_400Regular",
    fontWeight: 'bold',
    color: colors.primary,
  },
  retentionContainer: {
    marginTop: 8,
  },
  retentionLabel: {
    fontSize: 14, fontFamily: "Jua_400Regular",
    color: colors.textDark,
    marginBottom: 6,
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#EBEBEB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
});
