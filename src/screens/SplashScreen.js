import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import LeafMark from '../components/LeafMark';
import { layout } from '../styles/layout';
import { colors } from '../theme/colors';

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <View style={[layout.screen, styles.splash]}>
      <View style={styles.logoOrbitLarge} />
      <View style={styles.logoOrbitSmall} />
      <View style={styles.logoMark}>
        <LeafMark color={colors.sand} size={48} />
      </View>
      <Text style={styles.title}>CIRCULAI</Text>
      <Text style={styles.tagline}>Your Style, Less Waste.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest
  },
  logoOrbitLarge: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: 'rgba(232,220,200,0.2)',
    marginTop: -120
  },
  logoOrbitSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(232,220,200,0.35)',
    marginTop: -120
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,220,200,0.15)',
    marginBottom: 32
  },
  title: {
    color: colors.ivory,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8
  },
  tagline: {
    color: 'rgba(232,220,200,0.82)',
    fontSize: 15,
    fontWeight: '600'
  }
});
