import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, Platform, StyleSheet, Animated, Easing } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '../../ui/stylesheets/theme';
import styles from '../../ui/stylesheets/mainAppStyles';

const BottomNav = ({
  goHome,
  goGrades,
  goClass,
  goGames,
  goAchievements,
  goSettings,
  activeScreen,
  showClassTab = false,
}) => {
  const tabs = useMemo(
    () => [
      { name: 'home',    label: 'Home',        icon: 'home',            onPress: goHome },
      { name: 'grades',  label: 'Library',     icon: 'library',         onPress: goGrades },
      ...(showClassTab ? [{ name: 'class', label: 'Classes', icon: 'school', onPress: goClass }] : []),
      { name: 'games',   label: 'Game',        icon: 'game-controller', onPress: goGames },
      { name: 'achievements', label: 'Badges', icon: 'trophy',          onPress: goAchievements },
      { name: 'settings',    label: 'Settings',icon: 'settings',        onPress: goSettings },
    ],
    [goHome, goGrades, goClass, goGames, goAchievements, goSettings, showClassTab]
  );

  const activeIndex = Math.max(0, tabs.findIndex(t => t.name === activeScreen));

  // Layout + animation values
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const indexAnim = useRef(new Animated.Value(activeIndex >= 0 ? activeIndex : 0)).current;
  const scaleXAnim = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0.01)).current;
  const rippleX = useRef(new Animated.Value(0)).current;

  // Constants to align with styles.bottomNav padding
  const H_PADDING = 12;
  const SLOT_GAP = 8; // inner horizontal gap so pill doesn't touch edges

  const contentWidth = Math.max(0, containerWidth - H_PADDING * 2);
  const slotWidth = tabs.length > 0 ? contentWidth / tabs.length : 0;
  const pillWidth = Math.max(0, slotWidth - SLOT_GAP);

  useEffect(() => {
    const nextIndex = activeIndex >= 0 ? activeIndex : 0;
    Animated.parallel([
      Animated.timing(indexAnim, {
        toValue: nextIndex,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleXAnim, {
          toValue: 1.15,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleXAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [activeIndex, indexAnim, scaleXAnim]);

  const translateX = Animated.multiply(indexAnim, slotWidth);

  const onLayout = e => {
    const { width, height } = e.nativeEvent.layout;
    setContainerWidth(width);
    setContainerHeight(height);
  };

  const triggerRipple = (tabIndex) => {
    if (slotWidth <= 0 || containerHeight <= 0) return;
    const baseSize = 44;
    const left = H_PADDING + tabIndex * slotWidth + slotWidth / 2 - baseSize / 2;
    rippleX.setValue(left);
    rippleScale.setValue(0.01);
    rippleOpacity.setValue(0.18);
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 2.2,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View
      style={styles.bottomNav}
      onLayout={onLayout}
    >
      {/* Frosted glass background */}
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType={Platform.OS === 'ios' ? 'dark' : 'dark'}
        blurAmount={22}
        reducedTransparencyFallbackColor="rgba(20,20,20,0.6)"
      />

      {/* Top gloss gradient */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(255,255,255,0.35)',
          'rgba(255,255,255,0.08)',
          'rgba(255,255,255,0.00)'
        ]}
        locations={[0, 0.35, 1]}
        style={styles.navGloss}
      />

      {/* Liquid pill highlight */}
      {pillWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.navHighlight,
            {
              left: H_PADDING + SLOT_GAP / 2,
              width: pillWidth,
              transform: [
                { translateX },
                { scaleX: scaleXAnim },
              ],
            },
          ]}
        />
      )}

      {/* Press ripple */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.navRipple,
          {
            opacity: rippleOpacity,
            transform: [
              { translateX: rippleX },
              { translateY: (containerHeight > 0 ? (containerHeight / 2 - 22) : 0) },
              { scale: rippleScale },
            ],
          },
        ]}
      />

      {/* Content */}
      <View style={styles.navContent}>
        {tabs.map((item, i) => {
          const isActive = activeScreen === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={styles.navItem}
              onPressIn={() => triggerRipple(i)}
              onPress={item.onPress}
              activeOpacity={0.85}
            >
              <Ionicons
                name={ isActive ? item.icon : `${item.icon}-outline` }
                size={20}
                color={theme.whiteColor}
                style={[
                  styles.navIcon,
                  { opacity: isActive ? 1 : 0.8 },
                ]}
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
    </View>
  );
};

export default BottomNav;
