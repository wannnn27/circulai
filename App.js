import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainApp from './src/navigation/MainApp';
import { AppProvider } from './src/state/AppContext';
import { colors } from './src/theme/colors';

export default function App() {
  const [phase, setPhase] = useState('splash');

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar
        barStyle={phase === 'splash' ? 'light-content' : 'dark-content'}
        backgroundColor={phase === 'splash' ? colors.forest : colors.ivory}
      />

      <AppProvider>
        {phase === 'splash' && <SplashScreen onDone={() => setPhase('onboarding')} />}
        {phase === 'onboarding' && <OnboardingScreen onDone={() => setPhase('main')} />}
        {phase === 'main' && <MainApp />}
      </AppProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ivory
  }
});
