// components/NotificationBanner.js

import React, { useRef, useEffect } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const NotificationBanner = ({ title, onPress, onHide }) => {
  const translateY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    // Slide in
    Animated.timing(translateY, {
      toValue: 20,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Hide after 3s
    const timeout = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -80,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onHide && onHide());
    }, 3000);

    return () => clearTimeout(timeout);
  }, [translateY, onHide]);

  return (
    <Animated.View style={[styles.notification, { transform: [{ translateY }] }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.subtitle}>Achievement unlocked:</Text>
            <Text style={styles.titleText}>{title}</Text>
          </View>
          <Ionicons
            name="star"
            size={28}
            color="#FFD700"
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notification: {
    position: 'absolute',
    alignSelf: 'center',
    width: width * 0.9,               // 90% of screen width
    backgroundColor: '#fff',          // pure white
    borderRadius: 14,                 // smooth corners
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 50 : 20,  // below status bar
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    // Android shadow
    elevation: 10,
    zIndex: 2000,                     // ensure it floats above all
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700', // bold
    color: '#000',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginTop: 2,
  },
  icon: {
    marginLeft: 8,
  },
});

export default NotificationBanner;
