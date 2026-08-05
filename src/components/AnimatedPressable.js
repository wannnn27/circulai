import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

const WRAPPER_STYLE_KEYS = [
  'alignSelf',
  'aspectRatio',
  'bottom',
  'display',
  'flex',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'height',
  'left',
  'margin',
  'marginBottom',
  'marginEnd',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginTop',
  'marginVertical',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'position',
  'right',
  'top',
  'width',
  'zIndex',
];

const HORIZONTAL_SIZE_KEYS = ['width', 'minWidth', 'maxWidth', 'flex', 'flexBasis', 'flexGrow'];

function splitPressableStyle(style) {
  const flattened = StyleSheet.flatten(style) ?? {};
  const wrapperStyle = {};
  const visualStyle = { ...flattened };

  WRAPPER_STYLE_KEYS.forEach((key) => {
    if (flattened[key] === undefined) return;
    wrapperStyle[key] = flattened[key];

    if (!['minHeight', 'maxHeight', 'minWidth', 'maxWidth'].includes(key)) {
      delete visualStyle[key];
    }
  });

  const fillStyle = {};
  if (HORIZONTAL_SIZE_KEYS.some((key) => flattened[key] !== undefined)) {
    fillStyle.width = '100%';
  }
  if (flattened.height !== undefined) {
    fillStyle.height = '100%';
  }

  return { wrapperStyle, visualStyle, fillStyle };
}

/**
 * AnimatedPressable — drop-in Pressable replacement with scale press feedback.
 * Provides premium tactile feel for all interactive elements.
 *
 * Props:
 *  - scaleDown: number (default 0.96) — scale value when pressed
 *  - duration: number (default 120) — animation duration in ms
 *  - All standard Pressable props
 */
export default function AnimatedPressable({
  children,
  style,
  containerStyle,
  scaleDown = 0.96,
  duration = 120,
  onPress,
  disabled,
  hitSlop,
  onPressIn,
  onPressOut,
  ...rest
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const { wrapperStyle, visualStyle, fillStyle } = splitPressableStyle(style);

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: scaleDown,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
    onPressIn?.();
  }, [scale, scaleDown, onPressIn]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
    onPressOut?.();
  }, [scale, onPressOut]);

  return (
    <Pressable
      style={[wrapperStyle, containerStyle]}
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={hitSlop}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[visualStyle, fillStyle, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
