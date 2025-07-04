import React from 'react';
import { UserProvider } from './contexts/UserContext';
import { DifficultyProvider } from './contexts/DifficultyContext';
import MainApp from './components/MainApp';

const App = () => (
  <UserProvider>
    <DifficultyProvider>
      <MainApp />
    </DifficultyProvider>
  </UserProvider>
);

export default App;
