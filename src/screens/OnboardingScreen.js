import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from '../components/AnimatedPressable';
import LeafMark from '../components/LeafMark';
import { onboarding } from '../data/appData';
import { layout } from '../styles/layout';
import { colors, shadows } from '../theme/colors';

const stepThemes = [
  {
    color: colors.forest,
    accent: colors.sand,
    wash: 'rgba(232,220,200,0.44)',
    icon: 'tshirt-crew-outline',
    sceneLabel: 'Profil gaya personal',
    features: [
      { icon: 'palette-outline', label: 'Warna' },
      { icon: 'human-male', label: 'Fit' },
      { icon: 'star-four-points-outline', label: 'Gaya' },
    ],
  },
  {
    color: '#7F4C3D',
    accent: '#DFA58F',
    wash: 'rgba(201,123,99,0.16)',
    icon: 'recycle',
    sceneLabel: 'Dibuat setelah dipesan',
    features: [
      { icon: 'timer-sand', label: 'On demand' },
      { icon: 'recycle', label: 'Sirkular' },
      { icon: 'leaf', label: 'Low waste' },
    ],
  },
  {
    color: '#31485B',
    accent: colors.sand,
    wash: 'rgba(49,72,91,0.10)',
    icon: 'account-group-outline',
    sceneLabel: 'Dikerjakan penjahit lokal',
    features: [
      { icon: 'hand-heart-outline', label: 'Fair work' },
      { icon: 'storefront-outline', label: 'UMKM' },
      { icon: 'map-marker-outline', label: 'Lokal' },
    ],
  },
];

function StoryScene({ theme, compact }) {
  return (
    <View style={[styles.scene, compact && styles.sceneCompact]}>
      <View
        style={[
          styles.iconBackdrop,
          compact && styles.iconBackdropCompact,
          { backgroundColor: theme.wash },
        ]}
      >
        <MaterialCommunityIcons name={theme.icon} size={compact ? 72 : 88} color={theme.color} />
      </View>

      <View style={styles.sceneLabel}>
        <View style={[styles.sceneLabelDot, { backgroundColor: theme.color }]} />
        <Text style={styles.sceneLabelText}>{theme.sceneLabel}</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen({ onDone }) {
  const { height } = useWindowDimensions();
  const compact = height < 720;
  const [index, setIndex] = useState(0);
  const item = onboarding[index];
  const theme = stepThemes[index] ?? stepThemes[0];
  const isLast = index === onboarding.length - 1;

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateX = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(contentTranslateX, {
        toValue: 0,
        speed: 12,
        bounciness: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentOpacity, contentTranslateX]);

  const transitionTo = (newIndex, direction = 1) => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateX, {
        toValue: -18 * direction,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIndex(newIndex);
      contentTranslateX.setValue(22 * direction);
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateX, {
          toValue: 0,
          speed: 15,
          bounciness: 4,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (isLast) {
      onDone();
      return;
    }

    transitionTo(index + 1);
  };

  const handleBack = () => {
    if (index > 0) transitionTo(index - 1, -1);
  };

  return (
    <View style={[layout.screen, styles.screen, compact && styles.screenCompact]}>
      <View style={styles.backgroundOrbOne} />
      <View style={styles.backgroundOrbTwo} />

      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <LeafMark color={colors.forest} size={23} />
          </View>
          <Text style={styles.brandText}>CIRCULAI</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lewati onboarding"
          onPress={onDone}
          hitSlop={12}
          style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
        >
          <Text style={styles.skipText}>Lewati</Text>
          <MaterialCommunityIcons name="arrow-right" size={14} color={colors.warmGray} />
        </Pressable>
      </View>

      <View style={styles.progressRow}>
        {onboarding.map((entry, dotIndex) => (
          <View key={entry.title} style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                dotIndex <= index && styles.progressFillActive,
                dotIndex === index && styles.progressFillCurrent,
              ]}
            />
          </View>
        ))}
      </View>

      <Animated.View
        style={[
          styles.animatedContent,
          {
            opacity: contentOpacity,
            transform: [{ translateX: contentTranslateX }],
          },
        ]}
      >
        <StoryScene theme={theme} compact={compact} />

        <View style={[styles.copyBlock, compact && styles.copyBlockCompact]}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>0{index + 1}</Text>
            <Text style={styles.stepPillDivider}>/</Text>
            <Text style={styles.stepPillTotal}>0{onboarding.length}</Text>
          </View>
          <Text style={[styles.title, compact && styles.titleCompact]}>{item.title}</Text>
          <Text style={[styles.desc, compact && styles.descCompact]}>{item.desc}</Text>
        </View>

        <View style={styles.featureRow}>
          {theme.features.map((feature) => (
            <View key={feature.label} style={styles.featurePill}>
              <MaterialCommunityIcons name={feature.icon} size={14} color={colors.forest} />
              <Text style={styles.featureText}>{feature.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={styles.bottomArea}>
        {index > 0 ? (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke langkah sebelumnya"
            style={styles.backButton}
            onPress={handleBack}
            scaleDown={0.93}
          >
            <MaterialCommunityIcons name="arrow-left" size={21} color={colors.forest} />
          </AnimatedPressable>
        ) : null}

        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Mulai menggunakan CIRCULAI' : 'Lanjut ke langkah berikutnya'}
          style={[styles.nextButton, index === 0 && styles.nextButtonFirst]}
          onPress={handleNext}
          scaleDown={0.975}
        >
          <View style={[styles.nextButtonInner, index === 0 && styles.nextButtonInnerFirst]}>
            <View style={index === 0 && styles.nextButtonCopyFirst}>
              <Text style={styles.nextButtonHint}>{isLast ? 'SEMUA SIAP' : 'LANGKAH BERIKUTNYA'}</Text>
              <Text style={[styles.nextButtonText, index === 0 && styles.nextButtonTextFirst]}>
                {isLast ? 'Mulai Sekarang' : 'Lanjut'}
              </Text>
            </View>
            <View style={[styles.nextButtonArrow, index === 0 && styles.nextButtonArrowFirst]}>
              <MaterialCommunityIcons
                name={isLast ? 'check' : 'arrow-right'}
                size={20}
                color={colors.forest}
              />
            </View>
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ivory,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  screenCompact: {
    paddingTop: 8,
    paddingBottom: 14,
  },
  backgroundOrbOne: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -120,
    right: -120,
    backgroundColor: 'rgba(232,220,200,0.42)',
  },
  backgroundOrbTwo: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    left: -90,
    bottom: 110,
    backgroundColor: 'rgba(201,123,99,0.06)',
  },
  topBar: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  brandText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingLeft: 10,
  },
  skipText: {
    color: colors.warmGray,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.62,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    overflow: 'hidden',
    borderRadius: 99,
    backgroundColor: colors.lightGray,
  },
  progressFill: {
    width: 0,
    height: '100%',
    borderRadius: 99,
    backgroundColor: colors.forest,
  },
  progressFillActive: {
    width: '100%',
    opacity: 0.35,
  },
  progressFillCurrent: {
    opacity: 1,
  },
  animatedContent: {
    flex: 1,
  },
  scene: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sceneCompact: {
    height: 200,
  },
  iconBackdrop: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackdropCompact: {
    width: 142,
    height: 142,
    borderRadius: 71,
  },
  sceneLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
  },
  sceneLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sceneLabelText: {
    color: colors.warmGray,
    fontSize: 11,
    fontWeight: '700',
  },
  copyBlock: {
    alignItems: 'center',
    paddingTop: 21,
    paddingHorizontal: 10,
  },
  copyBlockCompact: {
    paddingTop: 12,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    marginBottom: 10,
    backgroundColor: colors.sandLight,
  },
  stepPillText: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: '900',
  },
  stepPillDivider: {
    color: colors.sandDark,
    fontSize: 9,
    fontWeight: '700',
  },
  stepPillTotal: {
    color: colors.warmGrayLight,
    fontSize: 9,
    fontWeight: '800',
  },
  title: {
    maxWidth: 320,
    color: colors.charcoal,
    fontSize: 29,
    fontWeight: '900',
    lineHeight: 34,
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  titleCompact: {
    fontSize: 25,
    lineHeight: 29,
    marginBottom: 5,
  },
  desc: {
    maxWidth: 330,
    color: colors.warmGray,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  descCompact: {
    fontSize: 12,
    lineHeight: 17,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginTop: 14,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.56)',
  },
  featureText: {
    color: colors.charcoalMid,
    fontSize: 9,
    fontWeight: '700',
  },
  bottomArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 16,
  },
  backButton: {
    width: 58,
    height: 58,
    borderWidth: 1,
    borderColor: colors.lightGrayDark,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.offWhite,
  },
  nextButton: {
    flex: 1,
    height: 62,
    borderRadius: 20,
    backgroundColor: colors.forest,
    ...shadows.forest,
  },
  nextButtonFirst: {
    width: '100%',
  },
  nextButtonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 9,
  },
  nextButtonInnerFirst: {
    justifyContent: 'center',
    paddingLeft: 9,
  },
  nextButtonCopyFirst: {
    alignItems: 'center',
  },
  nextButtonHint: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  nextButtonTextFirst: {
    textAlign: 'center',
  },
  nextButtonArrow: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  nextButtonArrowFirst: {
    position: 'absolute',
    right: 9,
  },
});
