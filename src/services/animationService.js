import React from 'react';
import LottieView from 'lottie-react-native';

export const playCelebrateAnimation = props => (
  <LottieView
    source={require('../assets/animations/sparkle.json')}
    autoPlay
    loop
    {...props}
  />
);

export const playSuccessAnimation = props => (
  <LottieView
    source={require('../assets/animations/sparkle.json')}
    autoPlay
    loop={false}
    {...props}
  />
);

export const playEncouragementAnimation = props => (
  <LottieView
    source={require('../assets/animations/bubble.json')}
    autoPlay
    loop={false}
    {...props}
  />
);
