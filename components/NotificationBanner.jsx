import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, Text } from 'react-native';
import styles from '../styles/mainAppStyles';

const NotificationBanner = ({ title, onPress, onHide }) => {
  const translateY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 20,
      duration: 300,
      useNativeDriver: true,
    }).start();

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
    <Animated.View style={[styles.notification, { transform: [{ translateY }] }] }>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.notificationText}>Achievement unlocked: {title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default NotificationBanner;
