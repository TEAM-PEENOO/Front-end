// src/components/CustomButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'colorful';
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconName?: string;
  iconFamily?: 'FontAwesome5' | 'Ionicons';
  iconColor?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  style,
  textStyle,
  iconName,
  iconFamily = 'FontAwesome5',
  iconColor = '#FFF',
  ...props
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return '#FFFDF9'; // Soft white/cream
      case 'danger':
        return colors.error;
      case 'colorful':
        return '#FFADAD'; // Pastel Pink
      case 'primary':
      default:
        return colors.primary; // Forest Green
    }
  };

  const getTextColor = () => {
    return variant === 'secondary' ? colors.textDark : '#FFF';
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'secondary':
        return '#E5D6C5';
      case 'primary':
        return '#5A9362';
      case 'colorful':
        return '#E59898';
      default:
        return colors.border;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.container,
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderBottomWidth: 5, // Gives a 3D clickable button feel
        },
        style,
      ]}
      {...props}
    >
      {iconName && (
        <View style={styles.iconContainer}>
          {iconFamily === 'FontAwesome5' ? (
            <FontAwesome5 name={iconName} size={20} color={variant === 'secondary' ? colors.textDark : iconColor} />
          ) : (
            <Ionicons name={iconName as any} size={24} color={variant === 'secondary' ? colors.textDark : iconColor} />
          )}
        </View>
      )}
      <Text style={[styles.text, { color: getTextColor(), fontFamily: 'Jua_400Regular' }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    fontSize: 20,
  },
});
