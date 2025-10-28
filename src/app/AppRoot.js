import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from './contexts/UserContext';
import { DifficultyProvider } from './contexts/DifficultyContext';
import MainApp from './MainApp';

const AppRoot = () => (
  <SafeAreaProvider>
    <UserProvider>
      <DifficultyProvider>
        <MainApp />
      </DifficultyProvider>
    </UserProvider>
  </SafeAreaProvider>
);

export default AppRoot;
