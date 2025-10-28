import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import TopNav from './TopNav';

// variant retained for backwards compatibility: 'default' | 'whiteShadow'
const GameTopBar = ({
  variant = 'default',
  iconColor,
  containerStyle,
  style,
  children,
  ...navProps
}) => {
  const insets = useContext(SafeAreaInsetsContext);
  const mergedNavProps = {
    ...navProps,
    backIconColor: navProps.backIconColor ?? iconColor,
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingTop: 0 }, style]}>
      <View pointerEvents="box-none" style={styles.frame}>
        <TopNav
          {...mergedNavProps}
          containerStyle={[
            styles.topNav,
            variant === 'whiteShadow' && styles.whiteShadow,
            containerStyle,
          ]}
        >
          {children}
        </TopNav>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  frame: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  topNav: {
    paddingHorizontal: 0,
  },
  whiteShadow: {},
});

export default GameTopBar;
