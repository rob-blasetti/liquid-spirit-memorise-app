// navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen.jsx';
import GuestLoginScreen from '../screens/GuestLoginScreen';
import LiquidSpiritLoginScreen from '../screens/LiquidSpiritLoginScreen';
import NuriRegisterScreen from '../screens/NuriRegisterScreen';
import NuriLoginScreen from '../screens/NuriLoginScreen';

const Stack = createStackNavigator();

export default function AuthNavigator({ onSignIn }) {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: true,
      headerBackTitleVisible: false,
      headerTitle: ''
    }}>
      {/* Hide header on initial welcome screen */}
      <Stack.Screen name="Welcome" options={{ headerShown: false }}>
        {props => <WelcomeScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="GuestLogin">
        {props => <GuestLoginScreen {...props} onSignIn={onSignIn} />}
      </Stack.Screen>
      <Stack.Screen name="NuriRegister">
        {props => <NuriRegisterScreen {...props} onSignIn={onSignIn} />}
      </Stack.Screen>
      <Stack.Screen name="NuriLogin">
        {props => <NuriLoginScreen {...props} onSignIn={onSignIn} />}
      </Stack.Screen>
      <Stack.Screen name="LSLogin">
        {props => <LiquidSpiritLoginScreen {...props} onSignIn={onSignIn} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}