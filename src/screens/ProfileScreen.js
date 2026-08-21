import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from '../components/AnimatedPressable';
import IconButton from '../components/IconButton';
import LeafMark from '../components/LeafMark';
import MetricCard from '../components/MetricCard';
import ProfileActionModal from '../components/ProfileActionModal';
import ProfileAvatar from '../components/ProfileAvatar';
import { profileGroups } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { colors, shadows } from '../theme/colors';
import { deleteProfilePhoto, pickProfilePhoto } from '../utils/profilePhoto';

// Colored backgrounds for menu icons
const menuIconColors = {
  zap: { bg: '#FFF3E0', color: '#E65100' },
  heart: { bg: '#FDE8E8', color: '#C94C4C' },
  'maximize-2': { bg: '#E8F7E4', color: '#3DA829' },
  'map-pin': { bg: '#E3F2FD', color: '#1565C0' },
  award: { bg: '#F3E5F5', color: '#7B1FA2' },
  bell: { bg: '#E8EAF6', color: '#3949AB' },
  shield: { bg: '#E8F7E4', color: '#3DA829' },
  'help-circle': { bg: '#FFF8E1', color: '#F57F17' },
  'file-text': { bg: '#E8F7E4', color: '#3DA829' },
  'refresh-cw': { bg: '#FDF4E3', color: '#D99A3D' },
};

export default function ProfileScreen({ onNavigate, onExchange }) {
  const [activePanel, setActivePanel] = useState(null);
  const {
    addresses,
    circularPoints,
    measurements,
    orders,
    preferences,
    resetAccountData,
    styleProfile,
    updateUserProfile,
    userProfile,
    wishlist,
    isLoggedIn,
    openAuthModal,
    requireAuth,
    logout,
  } = useAppState();

  const handlePhotoChange = async () => {
    try {
      const photoUri = await pickProfilePhoto();
      if (!photoUri) return;
      deleteProfilePhoto(userProfile.photoUri);
      updateUserProfile({ photoUri });
    } catch (error) {
      Alert.alert(
        'Foto belum dapat dipilih',
        error.code === 'PHOTO_PERMISSION_DENIED'
          ? 'Izinkan akses galeri agar CIRCULAI dapat menggunakan foto pilihanmu.'
          : 'Terjadi masalah saat memproses foto. Silakan coba lagi.'
      );
    }
  };

  const handleLogout = () => {
    if (!isLoggedIn) {
      openAuthModal('Masuk untuk mengakses semua fitur personalisasi.');
      return;
    }
    Alert.alert(
      'Keluar dari akun?',
      'Kamu akan keluar dari akun CIRCULAI.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: () => {
            logout();
          }
        }
      ]
    );
  };

  return (
    <>
      <ScrollView
        style={layout.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      {/* ─── Hero header ────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        {/* Decorative orbs */}
        <View style={styles.heroOrb1} />
        <View style={styles.heroOrb2} />

        <View style={styles.topRow}>
          <Text style={styles.profileTitle}>Profil Saya</Text>
          <IconButton name="bell" variant="inverted" size="md" onPress={() => setActivePanel('notifications')} />
        </View>

        {!isLoggedIn ? (
          <View style={styles.guestHeroRow}>
            <View style={styles.guestAvatar}>
              <Feather name="user" size={32} color={colors.sand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>Tamu / Pengunjung</Text>
              <Text style={styles.userEmail}>Masuk untuk menikmati semua fitur</Text>
              <AnimatedPressable
                style={styles.guestLoginBtn}
                onPress={() => openAuthModal('Masuk ke akun CIRCULAI kamu.')}
                scaleDown={0.95}
              >
                <Text style={styles.guestLoginBtnText}>Masuk / Daftar Akun</Text>
              </AnimatedPressable>
            </View>
          </View>
        ) : (
          <View style={styles.userRow}>
            <View style={styles.avatarRing}>
              <ProfileAvatar
                editable
                light
                name={userProfile.name}
                photoUri={userProfile.photoUri}
                size={62}
                onPress={handlePhotoChange}
              />
            </View>

            <Pressable style={styles.userInfo} onPress={() => setActivePanel('profile')}>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userEmail}>{userProfile.email}</Text>
              <View style={styles.memberBadge}>
                <LeafMark color={colors.sand} size={14} />
                <Text style={styles.memberBadgeText}>CIRCULAI Member</Text>
              </View>
            </Pressable>
            <Pressable style={styles.editProfile} onPress={() => setActivePanel('profile')}>
              <Feather name="edit-2" size={13} color={colors.sand} />
            </Pressable>
          </View>
        )}
      </View>

      {/* ─── Floating stats card ──────────────────────────────────────────── */}
      <View style={styles.statsCard}>
        <MetricCard value={`${isLoggedIn ? orders.length : 0}`} label="Pesanan" flat />
        <View style={styles.statsDivider} />
        <MetricCard value={isLoggedIn ? "2.4m" : "0m"} label="Kain Hemat" flat />
        <View style={styles.statsDivider} />
        <Pressable onPress={() => (onExchange ? onExchange() : onNavigate('exchange'))}>
          <MetricCard value={`${circularPoints}`} label="Impact Pts" flat />
        </Pressable>
      </View>

      {/* ─── Quick Access — Pesanan & Impact ───────────────────────────────── */}
      <View style={styles.quickRow}>
        <AnimatedPressable
          style={styles.quickCard}
          onPress={() => requireAuth(() => onNavigate('orders'), 'Masuk untuk melihat pesanan kamu.')}
          scaleDown={0.96}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#E8F5E3' }]}>
            <Feather name="package" size={18} color={colors.forest} />
          </View>
          <Text style={styles.quickLabel}>Pesanan</Text>
          <Text style={styles.quickSub}>{isLoggedIn ? orders.length : 0} aktif</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.quickCard}
          onPress={() => onNavigate('impact')}
          scaleDown={0.96}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#FDF4E3' }]}>
            <MaterialCommunityIcons name="leaf" size={18} color={colors.warning} />
          </View>
          <Text style={styles.quickLabel}>Dampak</Text>
          <Text style={styles.quickSub}>{circularPoints} poin</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.quickCard}
          onPress={() => requireAuth(() => onNavigate('exchange'), 'Masuk untuk eco swap.')}
          scaleDown={0.96}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#E6F0F4' }]}>
            <MaterialCommunityIcons name="recycle" size={18} color={colors.ming} />
          </View>
          <Text style={styles.quickLabel}>Eco Swap</Text>
          <Text style={styles.quickSub}>Tukar poin</Text>
        </AnimatedPressable>
      </View>

      {/* ─── AI Style Card ────────────────────────────────────────────────── */}
      <AnimatedPressable
        style={styles.styleCard}
        onPress={() => onNavigate('quiz')}
        scaleDown={0.98}
      >
        <View style={styles.styleIconBg}>
          <MaterialCommunityIcons name="lightning-bolt" size={22} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.styleTitle}>
            {styleProfile ? styleProfile.archetype : 'My Circular Style'}
          </Text>
          <Text style={styles.styleCopy}>
            {styleProfile
              ? styleProfile.tagline
              : 'Selesaikan quiz untuk melihat profil gaya personalmu'}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.warmGray} />
      </AnimatedPressable>

      {/* ─── Impact / Loyalty card ────────────────────────────────────────── */}
      <Pressable style={({ pressed }) => [styles.impactCard, pressed && styles.menuItemPressed]} onPress={() => setActivePanel('membership')}>
        <View style={styles.impactCardHeader}>
          <View style={styles.impactIconBg}>
            <MaterialCommunityIcons name="recycle" size={18} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.impactTitle}>Impact Points: {circularPoints}</Text>
            <Text style={styles.impactCopy}>
              {isLoggedIn ? `${Math.max(0, 500 - circularPoints)} poin lagi untuk naik ke tier Emerald` : 'Masuk ke akun untuk mengumpulkan poin'}
            </Text>
          </View>
          <Feather name="chevron-right" size={17} color={colors.warmGray} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: isLoggedIn ? '64%' : '0%' }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabelText}>{isLoggedIn ? 'Green' : 'Guest'}</Text>
          <Text style={styles.progressLabelText}>{isLoggedIn ? '64% → Emerald' : '0 Poin'}</Text>
        </View>
      </Pressable>

      {/* ─── Menu groups ──────────────────────────────────────────────────── */}
      {profileGroups.map((group) => (
        <View key={group.title} style={styles.menuGroup}>
          <Text style={styles.groupTitle}>{group.title.toUpperCase()}</Text>
          <View style={styles.menuCard}>
            {group.items.map((item, index) => {
              const badge =
                item.label === 'Wishlist'
                  ? `${wishlist.length}`
                  : item.label === 'Ukuran Tersimpan'
                  ? `${measurements.height} cm`
                  : item.label === 'Alamat'
                  ? `${addresses.length}`
                  : item.label === 'Notifikasi'
                  ? preferences.notifications.orderUpdates ? 'Aktif' : 'Atur'
                  : item.label === 'My Circular Style' && styleProfile
                  ? 'Ready'
                  : item.badge;

              const iconCfg = menuIconColors[item.icon] ?? { bg: colors.ivory, color: colors.warmGray };

              return (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [
                    styles.menuItem,
                    index < group.items.length - 1 && styles.menuItemBorder,
                    pressed && styles.menuItemPressed,
                  ]}
                  onPress={() => handleMenuPress(item.label, onNavigate, setActivePanel, onExchange, requireAuth)}
                >
                  <View style={[styles.menuIcon, { backgroundColor: iconCfg.bg }]}>
                    <Feather name={item.icon} size={16} color={iconCfg.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {!!item.desc && <Text style={styles.menuDesc}>{item.desc}</Text>}
                  </View>
                  {!!badge && (
                    <View style={styles.menuBadge}>
                      <Text style={styles.menuBadgeText}>{badge}</Text>
                    </View>
                  )}
                  <Feather name="chevron-right" size={16} color={colors.lightGrayDark} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      {/* ─── Logout / Login ─────────────────────────────────────────────────── */}
      <AnimatedPressable
        style={[styles.logoutButton, !isLoggedIn && styles.loginGuestButton]}
        onPress={handleLogout}
        scaleDown={0.97}
      >
        <View style={[styles.logoutIcon, !isLoggedIn && styles.loginGuestIcon]}>
          <Feather name={isLoggedIn ? 'log-out' : 'log-in'} size={16} color={isLoggedIn ? colors.error : colors.forest} />
        </View>
        <Text style={[styles.logoutText, !isLoggedIn && styles.loginGuestText]}>
          {isLoggedIn ? 'Keluar dari Akun' : 'Masuk ke Akun CIRCULAI'}
        </Text>
      </AnimatedPressable>

      {/* App version */}
      <Text style={styles.version}>CIRCULAI v1.0.0 — Sustainable Fashion Platform</Text>
      </ScrollView>
      <ProfileActionModal panel={activePanel} onClose={() => setActivePanel(null)} />
    </>
  );
}

function handleMenuPress(label, onNavigate, setActivePanel, onExchange, requireAuth) {
  if (label === 'My Circular Style') { onNavigate('quiz'); return; }
  if (label === 'Wishlist') {
    requireAuth?.(() => onNavigate('explore', { wishlistOnly: true }), 'Masuk ke akun untuk melihat Wishlist tersimpan.');
    return;
  }
  if (label === 'Alamat') {
    requireAuth?.(() => onNavigate('profile-addresses'), 'Masuk ke akun untuk mengelola alamat pengiriman.');
    return;
  }
  if (label === 'Circular Exchange') {
    requireAuth?.(() => {
      if (onExchange) onExchange();
      else onNavigate('exchange');
    }, 'Masuk ke akun untuk menukar atau mendonasikan pakaian.');
    return;
  }

  const panelByLabel = {
    'Ukuran Tersimpan': 'measurements',
    Membership: 'membership',
    Notifikasi: 'notifications',
    Keamanan: 'security',
    Bantuan: 'help',
    'Kebijakan Privasi': 'privacy'
  };

  const targetPanel = panelByLabel[label] ?? null;
  if (['measurements', 'membership', 'notifications', 'security'].includes(targetPanel)) {
    requireAuth?.(() => setActivePanel(targetPanel), `Masuk ke akun untuk mengelola ${label.toLowerCase()}.`);
  } else {
    setActivePanel(targetPanel);
  }
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
  },
  // ─── Quick Row ────────────────────────────────────────────────────────────
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  quickCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    gap: 5,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  quickLabel: {
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '900',
  },
  quickSub: {
    color: colors.warmGray,
    fontSize: 9,
    fontWeight: '600',
  },
  // ─── Hero ─────────────────────────────────────────────────────────────────
  hero: {
    backgroundColor: colors.forest,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  heroOrb1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(232,220,200,0.07)',
    right: -60,
    top: -60,
  },
  heroOrb2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(201,123,99,0.10)',
    left: -40,
    bottom: -40,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  profileTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  guestHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  guestAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestLoginBtn: {
    backgroundColor: colors.sand,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  guestLoginBtnText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    paddingVertical: 4,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(232,220,200,0.40)',
    padding: 2,
  },
  userInfo: {
    flex: 1,
  },
  editProfile: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,220,200,0.14)',
  },
  userName: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12,
    marginTop: 2,
  },
  memberBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(232,220,200,0.16)',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(232,220,200,0.15)',
  },
  memberBadgeText: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  // ─── Stats card ───────────────────────────────────────────────────────────
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -18,
    marginBottom: 18,
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.md,
  },
  statsDivider: {
    width: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 4,
  },
  // ─── Style card ───────────────────────────────────────────────────────────
  styleCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 12,
    ...shadows.sm,
  },
  styleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
  },
  styleTitle: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  styleCopy: {
    color: colors.warmGray,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  // ─── Impact card ──────────────────────────────────────────────────────────
  impactCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 22,
  },
  impactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 14,
  },
  impactIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
  },
  impactTitle: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
  },
  impactCopy: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(122,122,114,0.20)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: colors.forest,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabelText: {
    color: colors.warmGray,
    fontSize: 10,
    fontWeight: '600',
  },
  // ─── Menu groups ──────────────────────────────────────────────────────────
  menuGroup: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  groupTitle: {
    color: colors.warmGrayLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  menuCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  menuItemPressed: {
    backgroundColor: colors.ivory,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  menuDesc: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 1,
  },
  menuBadge: {
    borderRadius: 9999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: colors.successLight,
  },
  menuBadgeText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '900',
  },
  // ─── Logout ───────────────────────────────────────────────────────────────
  logoutButton: {
    marginHorizontal: 20,
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: 'rgba(201,76,76,0.20)',
    marginBottom: 16,
  },
  logoutIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,76,76,0.12)',
  },
  logoutText: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: '900',
  },
  loginGuestButton: {
    backgroundColor: colors.forestAlpha9,
    borderColor: colors.forestAlpha20,
  },
  loginGuestIcon: {
    backgroundColor: 'rgba(47,79,58,0.12)',
  },
  loginGuestText: {
    color: colors.forest,
  },
  // ─── App version ──────────────────────────────────────────────────────────
  version: {
    color: colors.warmGrayLight,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
});
