import { StyleSheet } from 'react-native';
import themeVariables from './theme';

const buttonStyles = StyleSheet.create({
  pill: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: themeVariables.whiteColor,
  },
  pillDisabled: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderColor: 'rgba(255,255,255,0.45)',
  },
  pillText: {
    color: themeVariables.blackColor,
    fontWeight: '600',
  },
  pillTextDisabled: {
    color: 'rgba(13, 23, 60, 0.5)',
  },
});

export default buttonStyles;
