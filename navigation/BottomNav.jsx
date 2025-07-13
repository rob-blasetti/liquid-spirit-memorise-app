import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';
import styles from '../styles/mainAppStyles';
/**
 * Bottom navigation bar component.
 *
 * Props:
 * - goHome: function to navigate to Home screen
 * - goGrades: function to navigate to Grades screen
 * - goClass: function to navigate to Classes screen
 * - goGames: function to navigate to Games screen
 * - goAchievements: function to navigate to Achievements screen
 * - goSettings: function to navigate to Settings screen
 * - activeScreen: string identifier of the currently active screen
 */
const BottomNav = ({
  goHome,
  goGrades,
  goClass,
  goGames,
  goAchievements,
  goSettings,
  activeScreen,
}) => (
  <View style={styles.bottomNav}>
    <TouchableOpacity style={styles.navItem} onPress={goHome}>
      <Ionicons
        name={activeScreen === 'home' ? 'home' : 'home-outline'}
        size={24}
        color={themeVariables.whiteColor}
      />
      <Text style={styles.navText}>Home</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={goGrades}>
      <Ionicons
        name={activeScreen === 'grades' ? 'library' : 'library-outline'}
        size={24}
        color={themeVariables.whiteColor}
      />
      <Text style={styles.navText}>Library</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={goClass}>
      <Ionicons
        name={activeScreen === 'class' ? 'school' : 'school-outline'}
        size={24}
        color={themeVariables.whiteColor}
      />
      <Text style={styles.navText}>Classes</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={goGames}>
      <Ionicons
        name={activeScreen === 'games' ? 'game-controller' : 'game-controller-outline'}
        size={24}
        color={themeVariables.whiteColor}
      />
      <Text style={styles.navText}>Game</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={goAchievements}>
      <Ionicons
        name={activeScreen === 'achievements' ? 'trophy' : 'trophy-outline'}
        size={24}
        color={themeVariables.whiteColor}
      />
      <Text style={styles.navText}>Badges</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={goSettings}>
      <Ionicons
        name={activeScreen === 'settings' ? 'settings' : 'settings-outline'}
        size={24}
        color={themeVariables.whiteColor}
      />
      <Text style={styles.navText}>Settings</Text>
    </TouchableOpacity>
  </View>
);

export default BottomNav;