import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Logo({ size = 60, showText = true }) {
  const { isDarkMode, theme } = useTheme();

  const logoSource = isDarkMode 
    ? require('../../assets/Logo_Dark.png') 
    : require('../../assets/Logo_Light.jpeg');

  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer, { width: size, height: size, borderRadius: size / 2 }]}>
        <Image 
          source={logoSource} 
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {showText && (
        <Text style={[styles.logoText, { fontSize: size * 0.5, color: theme.textPrimary }]}>
          Mind<Text style={{ color: theme.primary }}>Forge</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontWeight: '800',
    marginLeft: 12,
    letterSpacing: -1,
  },
});
