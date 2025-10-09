// navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import themeVariables from '../styles/theme';
import WelcomeScreen from '../screens/WelcomeScreen.jsx';
import GuestLogin from '../screens/auth/GuestLogin';
import LSLogin from '../screens/auth/LSLogin';
import Register from '../screens/auth/Register';
import Login from '../screens/auth/Login';
import ForgotYourPassword from '../screens/ForgotYourPassword';

const Stack = createStackNavigator();

export default function AuthNavigator({ onSignIn }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTitle: '',
        headerTransparent: true,
        headerTintColor: themeVariables.whiteColor,
        headerStyle: { backgroundColor: 'transparent' },
      }}
    >
      {/* Hide header on initial welcome screen */}
      <Stack.Screen name="Welcome" options={{ headerShown: false }}>
        {props => <WelcomeScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="GuestLogin">
        {props => <GuestLogin {...props} onSignIn={onSignIn} />}
      </Stack.Screen>
      <Stack.Screen name="NuriRegister">
        {props => <Register {...props} onSignIn={onSignIn} />}
      </Stack.Screen>
      <Stack.Screen name="NuriLogin">
        {props => <Login {...props} onSignIn={onSignIn} />}
      </Stack.Screen>
      <Stack.Screen name="LSLogin">
        {props => <LSLogin {...props} onSignIn={onSignIn} />}
      </Stack.Screen>
      <Stack.Screen name="ForgotYourPassword" component={ForgotYourPassword} />
    </Stack.Navigator>
  );
}
