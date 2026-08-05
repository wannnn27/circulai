import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../theme/colors';

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'CA';
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function ProfileAvatar({
  name,
  photoUri,
  size = 64,
  editable = false,
  onPress,
  light = false
}) {
  const radius = size / 2;
  const content = (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: light ? colors.sand : colors.forest,
        },
      ]}
    >
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: size, height: size, borderRadius: radius }} />
      ) : (
        <Text style={[styles.initials, { color: light ? colors.forest : colors.white, fontSize: size * 0.3 }]}>
          {getInitials(name)}
        </Text>
      )}

      {editable && (
        <View style={[styles.editBadge, { width: size * 0.34, height: size * 0.34, borderRadius: size * 0.17 }]}>
          <Feather name="camera" size={Math.max(10, size * 0.16)} color={colors.white} />
        </View>
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ganti foto profil"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  initials: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.white,
  },
  pressed: {
    opacity: 0.72,
  },
});
