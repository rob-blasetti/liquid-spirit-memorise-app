import { StyleSheet, Platform, StatusBar } from 'react-native';
import theme from './theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  // containerNeutral retained for legacy usage; matches default
  containerNeutral: {
    backgroundColor: theme.neutralLight,
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 8,
  },
  tileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  tile: {
    backgroundColor: '#f0f0f0',
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 10,
    marginBottom: 16,
    borderRadius: 8,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tileInfo: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,              // float up off the bottom edge
    left: 20,
    right: 20,
    flexDirection: 'row',
    // Glass fallback tint behind blur
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 30,        // nice pill shape
    paddingVertical: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    alignItems: 'center',
    overflow: 'hidden',      // clip blur to rounded shape
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    // optional shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    // optional elevation for Android
    elevation: 8,
  },
  navGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    zIndex: 0,
  },
  navContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  navHighlight: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    zIndex: 1,
  },
  navRipple: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    zIndex: 2,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    zIndex: 3,
  },
  navIcon: {
    marginBottom: 2,
  },
  navText: {
    fontSize: 9,
    color: theme.whiteColor,
    opacity: 0.6,            // default dimmed
  },
  navTextActive: {
    opacity: 1,              // full‑bright
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileTextContainer: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileGrade: {
    fontSize: 16,
  },
  scoreText: {
    fontSize: 16,
    marginBottom: 16,
  },
  homeButtonContainer: {
    width: '80%',
    marginVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: theme.whiteColor,
    padding: 20,
    borderRadius: 20,
    width: '100%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  childButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  childText: {
    fontSize: 16,
    marginLeft: 12,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  notification: {
    position: 'absolute',
    // offset to avoid status bar / notch
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 44,
    left: 0,
    right: 0,
    backgroundColor: theme.primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  notificationText: {
    color: theme.whiteColor || '#fff',
    fontSize: 16,
  },
});

export default styles;
