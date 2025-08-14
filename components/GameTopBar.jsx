import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import themeVariables from '../styles/theme';

// variant: 'default' | 'whiteShadow'
const GameTopBar = ({ onBack, iconColor = themeVariables.primaryColor, variant = 'default' }) => {
  const useWhiteShadow = variant === 'whiteShadow';
  const buttonStyles = [styles.iconButton, useWhiteShadow && styles.whiteCircleButton];
  const chevronColor = useWhiteShadow ? themeVariables.blackColor : iconColor;
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={buttonStyles} activeOpacity={0.85}>
        {useWhiteShadow && (
          <LinearGradient
            pointerEvents="none"
            colors={[
              'rgba(255,255,255,0.8)',
              'rgba(255,255,255,0.35)',
              'rgba(255,255,255,0.0)'
            ]}
            locations={[0, 0.5, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.buttonGloss}
          />
        )}
        <Ionicons name="chevron-back" size={22} color={chevronColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Position the back chevron in the top-left corner of the game screen
  container: {
    position: 'absolute',
    top: 16,
    left: 20, // align with BottomNav left margin
    zIndex: 1,
  },
  iconButton: {
    padding: 4,
  },
  whiteCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFEFF2', // slightly darker to show depth
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    // Drop shadow: shallower offset, stronger opacity for depth
    shadowColor: themeVariables.blackColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  buttonGloss: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: '60%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});

export default GameTopBar;
