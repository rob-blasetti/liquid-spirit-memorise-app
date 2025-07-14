// navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen.jsx';
import GuestRegisterStep1 from '../screens/GuestRegisterStep1';
import GuestRegisterStep2 from '../screens/GuestRegisterStep2';
import GuestLoginScreen from '../screens/GuestLoginScreen';
import LiquidSpiritLoginScreen from '../screens/LiquidSpiritLoginScreen';

const Stack = createStackNavigator();

export default function AuthNavigator({ onSignIn }) {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: true,
      headerBackTitleVisible: false,
      headerTitle: ''
    }}>
      {/* Hide header on initial welcome screen */}
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        initialParams={{ onSignIn }}
        options={{ headerShown: false }}
      />
      {/* Guest registration and login screens with back button */}
      <Stack.Screen
        name="GuestRegister1"
        component={GuestRegisterStep1}
        initialParams={{ onSignIn }}
      />
      <Stack.Screen
        name="GuestRegister2"
        component={GuestRegisterStep2}
        initialParams={{ onSignIn }}
      />
      <Stack.Screen
        name="GuestLogin"
        component={GuestLoginScreen}
        initialParams={{ onSignIn }}
      />
      <Stack.Screen
        name="LSLogin"
        component={LiquidSpiritLoginScreen}
        initialParams={{ onSignIn }}
      />
    </Stack.Navigator>
  );
}