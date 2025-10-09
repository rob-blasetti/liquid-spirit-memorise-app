// navigation/NuriAuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import GuestLogin from '../screens/auth/GuestLogin';
import LSLogin from '../screens/auth/LSLogin';
import Register from '../screens/auth/Register';
import Login from '../screens/auth/Login';

const Stack = createStackNavigator();

export default function NuriAuthNavigator({ onSignIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} initialParams={{ onSignIn }} />
      <Stack.Screen name="GuestLogin" component={GuestLogin} initialParams={{ onSignIn }} />
      <Stack.Screen name="NuriRegister" component={Register} initialParams={{ onSignIn }} />
      <Stack.Screen name="NuriLogin" component={Login} initialParams={{ onSignIn }} />
      <Stack.Screen name="LSLogin" component={LSLogin} initialParams={{ onSignIn }} />
    </Stack.Navigator>
  );
}
