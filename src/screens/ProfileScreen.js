import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import IconButton from '../components/IconButton';
import LeafMark from '../components/LeafMark';
import MetricCard from '../components/MetricCard';
import { profileGroups } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { cardShadow, colors } from '../theme/colors';

export default function ProfileScreen({ onNavigate }) {
  const { orders, wishlist, styleProfile } = useAppState();

  return (
    <ScrollView style={layout.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.topRow}>
          <Text style={styles.profileTitle}>Profil</Text>
          <IconButton name="bell" inverted />
        </View>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Feather name="user" size={28} color={colors.forest} />
          </View>
          <View style={styles.userTextArea}>
            <Text style={styles.userName}>Adi Pratama</Text>
            <Text style={styles.userEmail}>adi.pratama@email.com</Text>
            <View style={styles.memberBadge}>
              <LeafMark color={colors.sand} size={14} />
              <Text style={styles.memberBadgeText}>CIRCULAI Member</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        <MetricCard value={`${orders.length}`} label="Pesanan" flat />
        <MetricCard value="2.4m" label="Kain Hemat" flat />
        <MetricCard value="320" label="Impact Points" flat />
      </View>

      <Pressable style={styles.styleCard} onPress={() => onNavigate('quiz')}>
        <View style={styles.styleIcon}>
          <Feather name="zap" size={22} color={colors.white} />
        </View>
        <View style={layout.flex}>
          <Text style={styles.styleTitle}>
            {styleProfile ? styleProfile.archetype : 'My Circular Style'}
          </Text>
          <Text style={styles.styleCopy}>
            {styleProfile ? styleProfile.tagline : 'Selesaikan quiz untuk melihat profil gaya personalmu'}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.warmGray} />
      </Pressable>

      <View style={styles.impactCard}>
        <View style={styles.impactIcon}>
          <MaterialCommunityIcons name="recycle" size={22} color={colors.white} />
        </View>
        <View style={layout.flex}>
          <Text style={styles.impactTitle}>Impact Points: 320</Text>
          <Text style={styles.impactCopy}>180 poin lagi untuk naik ke tier Emerald</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '64%' }]} />
          </View>
        </View>
        <Feather name="chevron-right" size={18} color={colors.warmGray} />
      </View>

      {profileGroups.map((group) => (
        <View key={group.title} style={styles.menuGroup}>
          <Text style={styles.groupTitle}>{group.title.toUpperCase()}</Text>
          <View style={styles.menuCard}>
            {group.items.map((item, index) => {
              const badge =
                item.label === 'Wishlist'
                  ? `${wishlist.length}`
                  : item.label === 'My Circular Style' && styleProfile
                    ? 'Ready'
                    : item.badge;

              return (
                <Pressable
                  key={item.label}
                  style={[styles.menuItem, index < group.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => handleMenuPress(item.label, onNavigate)}
                >
                  <View style={styles.menuIcon}>
                    <Feather name={item.icon} size={17} color={colors.warmGray} />
                  </View>
                  <View style={layout.flex}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {!!item.desc && <Text style={styles.menuDesc}>{item.desc}</Text>}
                  </View>
                  {!!badge && (
                    <View style={styles.smallBadge}>
                      <Text style={styles.smallBadgeText}>{badge}</Text>
                    </View>
                  )}
                  <Feather name="chevron-right" size={17} color={colors.lightGray} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <Pressable style={styles.logoutButton} onPress={() => Alert.alert('Keluar', 'Ini prototype, sesi pengguna tetap aktif.')}>
        <Feather name="log-out" size={16} color={colors.error} />
        <Text style={styles.logoutText}>Keluar</Text>
      </Pressable>
    </ScrollView>
  );
}

function handleMenuPress(label, onNavigate) {
  if (label === 'My Circular Style') {
    onNavigate('quiz');
    return;
  }
  if (label === 'Wishlist') {
    onNavigate('explore');
    return;
  }
  Alert.alert(label, 'Fitur ini sudah disiapkan sebagai placeholder interaktif di prototype.');
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120
  },
  hero: {
    backgroundColor: colors.forest,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 28
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  profileTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900'
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand
  },
  userTextArea: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900'
  },
  userEmail: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    marginTop: 2
  },
  memberBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: 'rgba(232,220,200,0.18)',
    marginTop: 9
  },
  memberBadgeText: {
    color: colors.sand,
    fontSize: 11,
    fontWeight: '800'
  },
  stats: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -16,
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingVertical: 12,
    ...cardShadow
  },
  styleCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14
  },
  styleIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest
  },
  styleTitle: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '900'
  },
  styleCopy: {
    color: colors.warmGray,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2
  },
  impactCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.sand,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20
  },
  impactIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest
  },
  impactTitle: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900'
  },
  impactCopy: {
    color: colors.warmGray,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.white,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.forest
  },
  menuGroup: {
    marginHorizontal: 20,
    marginBottom: 16
  },
  groupTitle: {
    color: colors.warmGray,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 8
  },
  menuCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ivory
  },
  menuLabel: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '800'
  },
  menuDesc: {
    color: colors.warmGray,
    fontSize: 12,
    marginTop: 1
  },
  smallBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: colors.sand
  },
  smallBadgeText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '900'
  },
  logoutButton: {
    marginHorizontal: 20,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.error,
    marginTop: 2
  },
  logoutText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '900'
  }
});
