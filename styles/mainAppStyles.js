import { StyleSheet, Platform, StatusBar } from 'react-native';
import theme from './theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: theme.primaryColor,
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
    backgroundColor: theme.bottomNavBg, // e.g. '#4B2770'
    borderRadius: 30,        // nice pill shape
    paddingVertical: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    // optional shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // optional elevation for Android
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    marginBottom: 2,
  },
  navText: {
    fontSize: 11,
    color: theme.whiteColor,
    opacity: 0.6,            // default dimmed
  },
  navTextActive: {
    opacity: 1,              // full‑bright
    borderBottomWidth: 2,
    borderBottomColor: theme.whiteColor,
    paddingBottom: 2,
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
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
