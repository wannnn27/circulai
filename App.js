/**
 * @file App.js
 * @description Application entry point for CIRCULAI.
 *
 * Manages the top-level phase state (splash → onboarding → main) and
 * configures the Android navigation bar colour to match the app theme.
 */

import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorBoundary from './src/components/ErrorBoundary';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainApp from './src/navigation/MainApp';
import { AppProvider } from './src/state/AppContext';
import { colors } from './src/theme/colors';

const ONBOARDING_KEY = '@circulai/has_completed_onboarding';

export default function App() {
  const [phase, setPhase] = useState('splash');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const backgroundColor = colors.ivory;

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((val) => {
        if (val === 'true') {
          setHasCompletedOnboarding(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    NavigationBar.setPositionAsync('relative').catch(() => {});
    NavigationBar.setButtonStyleAsync('dark').catch(() => {});
    NavigationBar.setBackgroundColorAsync(colors.ivory).catch(() => {});
    NavigationBar.setBorderColorAsync(colors.lightGray).catch(() => {});
  }, []);

  const handleSplashDone = () => {
    if (hasCompletedOnboarding) {
      setPhase('main');
    } else {
      setPhase('onboarding');
    }
  };

  const handleOnboardingDone = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
    setHasCompletedOnboarding(true);
    setPhase('main');
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SafeAreaView
          style={[styles.root, { backgroundColor }]}
          edges={phase === 'main' ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}
        >
          <StatusBar
            style="dark"
            backgroundColor={backgroundColor}
            translucent={false}
          />

          <AppProvider>
            {phase === 'splash' && <SplashScreen onDone={handleSplashDone} />}
            {phase === 'onboarding' && <OnboardingScreen onDone={handleOnboardingDone} />}
            {phase === 'main' && <MainApp />}
          </AppProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ivory
  }
});
