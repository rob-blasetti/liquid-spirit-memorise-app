import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '../styles/theme';
import styles from '../styles/mainAppStyles';

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
    {[
      { name: 'home',    label: 'Home',        icon: 'home',         onPress: goHome },
      { name: 'grades',  label: 'Library',     icon: 'library',      onPress: goGrades },
      { name: 'class',   label: 'Classes',     icon: 'school',       onPress: goClass },
      { name: 'games',   label: 'Game',        icon: 'game-controller', onPress: goGames },
      { name: 'achievements', label: 'Badges', icon: 'trophy',       onPress: goAchievements },
      { name: 'settings',    label: 'Settings',icon: 'settings',     onPress: goSettings },
    ].map(item => {
      const isActive = activeScreen === item.name;
      return (
        <TouchableOpacity
          key={item.name}
          style={styles.navItem}
          onPress={item.onPress}
        >
          <Ionicons
            name={ isActive ? item.icon : `${item.icon}-outline` }
            size={24}
            color={theme.whiteColor}
            style={[styles.navIcon, { opacity: isActive ? 1 : 0.6 }]}
          />
          <Text
            style={[
              styles.navText,
              isActive && styles.navTextActive
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default BottomNav;
