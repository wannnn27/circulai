/**
 * @file ErrorBoundary.js
 * @description React class-based Error Boundary.
 *
 * Catches unhandled render-phase exceptions anywhere in the component tree
 * and renders a polished fallback UI instead of letting the app go blank.
 * Wrap the app root (or individual high-risk subtrees) with this component.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */

import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, shadows } from '../theme/colors';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  /** Derive state from the caught error before the next render. */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /** Log error details for debugging (swap for Sentry / Crashlytics in prod). */
  componentDidCatch(error, info) {
    if (__DEV__) {
      console.error('[ErrorBoundary] Uncaught render error:', error, info);
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isDev = __DEV__;
    const message = this.state.error?.message ?? 'Terjadi kesalahan tak terduga.';

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconWrap}>
            <Feather name="alert-triangle" size={36} color={colors.terracotta} />
          </View>

          <Text style={styles.heading}>Oops, ada yang tidak beres</Text>
          <Text style={styles.body}>
            Aplikasi mengalami masalah yang tidak terduga. Silakan coba lagi —
            data kamu aman tersimpan.
          </Text>

          {isDev && (
            <View style={styles.devCard}>
              <Text style={styles.devLabel}>DEV — Error detail</Text>
              <Text style={styles.devMessage} selectable>
                {message}
              </Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
            onPress={this.handleReset}
          >
            <Feather name="refresh-cw" size={16} color={colors.white} />
            <Text style={styles.retryText}>Coba Lagi</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,123,99,0.10)',
    marginBottom: 24,
  },
  heading: {
    color: colors.charcoal,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28,
  },
  body: {
    color: colors.warmGray,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  devCard: {
    width: '100%',
    borderRadius: 14,
    padding: 14,
    backgroundColor: 'rgba(201,123,99,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201,123,99,0.22)',
    marginBottom: 24,
  },
  devLabel: {
    color: colors.terracotta,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  devMessage: {
    color: colors.charcoal,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.forest,
    ...shadows.forest,
  },
  retryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  retryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
});
