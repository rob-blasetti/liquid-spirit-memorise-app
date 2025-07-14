// navigation/NuriAuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import GuestRegisterStep1 from '../screens/GuestRegisterStep1';
import GuestRegisterStep2 from '../screens/GuestRegisterStep2';
import GuestLoginScreen from '../screens/GuestLoginScreen';
import LiquidSpiritLoginScreen from '../screens/LiquidSpiritLoginScreen';

const Stack = createStackNavigator();

export default function NuriAuthNavigator({ onSignIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} initialParams={{ onSignIn }} />
      <Stack.Screen name="GuestRegister1" component={GuestRegisterStep1} initialParams={{ onSignIn }} />
      <Stack.Screen name="GuestRegister2" component={GuestRegisterStep2} initialParams={{ onSignIn }} />
      <Stack.Screen name="GuestLogin" component={GuestLoginScreen} initialParams={{ onSignIn }} />
      <Stack.Screen name="LSLogin" component={LiquidSpiritLoginScreen} initialParams={{ onSignIn }} />
    </Stack.Navigator>
  );
}
