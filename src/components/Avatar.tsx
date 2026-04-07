// src/components/Avatar.tsx
import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { colors } from '../theme/colors';

interface AvatarProps {
  imageUrl?: string;
  source?: ImageSourcePropType;
  gender?: 'boy' | 'girl';
  variant?: 'full' | 'face';
  size?: number;
  mood?: 'happy' | 'neutral' | 'confused';
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  source,
  gender,
  variant = 'full',
  size = 80,
  mood = 'happy',
  style,
}) => {
  let finalSource = source;
  if (!finalSource && gender === 'boy') {
    finalSource = variant === 'face' 
      ? require('../../assets/images/boy_face.png') 
      : require('../../assets/images/boy_character.png');
  } else if (!finalSource && gender === 'girl') {
    finalSource = variant === 'face'
      ? require('../../assets/images/girl_face.png')
      : require('../../assets/images/girl_character.png');
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <View style={[styles.innerCircle, { borderRadius: (size - 8) / 2 }]}>
        {finalSource ? (
          <Image
            source={finalSource}
            style={[styles.image, { borderRadius: (size - 8) / 2 }]}
            resizeMode="cover"
          />
        ) : imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, { borderRadius: (size - 8) / 2 }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.image,
              styles.placeholder,
              { borderRadius: (size - 8) / 2 },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: 4,
    borderWidth: 3,
    borderColor: colors.secondary,
    shadowColor: colors.secondaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: colors.primaryLight,
  },
});
