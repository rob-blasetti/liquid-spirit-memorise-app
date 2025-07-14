// navigation/NuriAuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import GuestLoginScreen from '../screens/GuestLoginScreen';
import LiquidSpiritLoginScreen from '../screens/LiquidSpiritLoginScreen';
import NuriRegisterScreen from '../screens/NuriRegisterScreen';
import NuriLoginScreen from '../screens/NuriLoginScreen';

const Stack = createStackNavigator();

export default function NuriAuthNavigator({ onSignIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} initialParams={{ onSignIn }} />
      <Stack.Screen name="GuestLogin" component={GuestLoginScreen} initialParams={{ onSignIn }} />
      <Stack.Screen name="NuriRegister" component={NuriRegisterScreen} initialParams={{ onSignIn }} />
      <Stack.Screen name="NuriLogin" component={NuriLoginScreen} initialParams={{ onSignIn }} />
      <Stack.Screen name="LSLogin" component={LiquidSpiritLoginScreen} initialParams={{ onSignIn }} />
    </Stack.Navigator>
  );
}
