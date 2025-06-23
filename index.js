/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import React from 'react';
import { UserProvider } from './contexts/UserContext';
// Wrap App in UserProvider to share user data across screens
const Root = () => (
  <UserProvider>
    <App />
  </UserProvider>
);
AppRegistry.registerComponent(appName, () => Root);
