// navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../../screens/auth/WelcomeScreen';
import GuestLoginScreen from '../../screens/auth/GuestLoginScreen';
import LiquidSpiritLoginScreen from '../../screens/auth/LiquidSpiritLoginScreen';
import NuriRegisterScreen from '../../screens/auth/NuriRegisterScreen';
import NuriLoginScreen from '../../screens/auth/NuriLoginScreen';
import ForgotPasswordScreen from '../../screens/auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

export default function AuthNavigator({ onSignIn }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
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
      <Stack.Screen name="ForgotYourPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
