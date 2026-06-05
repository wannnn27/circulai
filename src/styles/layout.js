import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

export const layout = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center'
  },
  appFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: colors.ivory
  },
  appContent: {
    flex: 1
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.ivory
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 116
  },
  flex: {
    flex: 1
  }
});
