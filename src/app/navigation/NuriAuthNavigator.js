// navigation/NuriAuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Start from '../../modules/auth/screens/Start';
import GuestLogin from '../../modules/auth/screens/auth/GuestLogin';
import LSLogin from '../../modules/auth/screens/auth/LSLogin';
import Register from '../../modules/auth/screens/auth/Register';
import Login from '../../modules/auth/screens/auth/Login';

const Stack = createStackNavigator();

export default function NuriAuthNavigator({ onSignIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Start} initialParams={{ onSignIn }} />
      <Stack.Screen name="GuestLogin" component={GuestLogin} initialParams={{ onSignIn }} />
      <Stack.Screen name="NuriRegister" component={Register} initialParams={{ onSignIn }} />
      <Stack.Screen name="NuriLogin" component={Login} initialParams={{ onSignIn }} />
      <Stack.Screen name="LSLogin" component={LSLogin} initialParams={{ onSignIn }} />
    </Stack.Navigator>
  );
}
