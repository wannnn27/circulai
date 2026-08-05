import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainApp from './src/navigation/MainApp';
import { AppProvider } from './src/state/AppContext';
import { colors } from './src/theme/colors';

export default function App() {
  const [phase, setPhase] = useState('splash');
  const backgroundColor = phase === 'splash' ? colors.forest : colors.ivory;

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    NavigationBar.setPositionAsync('relative').catch(() => {});
    NavigationBar.setButtonStyleAsync('dark').catch(() => {});
    NavigationBar.setBackgroundColorAsync(colors.ivory).catch(() => {});
    NavigationBar.setBorderColorAsync(colors.lightGray).catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.root, { backgroundColor }]}
        edges={phase === 'main' ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}
      >
        <StatusBar
          style={phase === 'splash' ? 'light' : 'dark'}
          backgroundColor={backgroundColor}
          translucent={false}
        />

        <AppProvider>
          {phase === 'splash' && <SplashScreen onDone={() => setPhase('onboarding')} />}
          {phase === 'onboarding' && <OnboardingScreen onDone={() => setPhase('main')} />}
          {phase === 'main' && <MainApp />}
        </AppProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ivory
  }
});
