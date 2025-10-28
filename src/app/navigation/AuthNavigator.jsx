// navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Start from '../../modules/auth/screens/Start';
import GuestLogin from '../../modules/auth/screens/auth/GuestLogin';
import LSLogin from '../../modules/auth/screens/auth/LSLogin';
import Register from '../../modules/auth/screens/auth/Register';
import Login from '../../modules/auth/screens/auth/Login';
import ForgotYourPassword from '../../modules/auth/screens/ForgotYourPassword';

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
        {props => <Start {...props} />}
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
