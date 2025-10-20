import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from './contexts/UserContext';
import { DifficultyProvider } from './contexts/DifficultyContext';
import Main from './components/Main';

const App = () => (
  <SafeAreaProvider>
    <UserProvider>
      <DifficultyProvider>
        <Main />
      </DifficultyProvider>
    </UserProvider>
  </SafeAreaProvider>
);

export default App;
