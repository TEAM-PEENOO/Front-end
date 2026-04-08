// src/components/CustomButton.tsx
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
  Animated,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'colorful';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
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
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 30,
      bounciness: 15,
    }).start();
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 15,
    }).start();
    if (onPressOut) onPressOut(e);
  };

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
    <AnimatedTouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderBottomWidth: 5, // Gives a 3D clickable button feel
          transform: [{ scale: scaleAnim }],
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
    </AnimatedTouchableOpacity>
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
