import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const layout = StyleSheet.create({
  // ─── Base screens ───────────────────────────────────────────────────────────
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 148,
  },
  // ─── Containers ─────────────────────────────────────────────────────────────
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ─── App frame ──────────────────────────────────────────────────────────────
  appFrame: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  appContent: {
    flex: 1,
  },
  // ─── Divider ────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.lightGray,
  },
  // ─── Utility ────────────────────────────────────────────────────────────────
  hidden: {
    opacity: 0,
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
});
