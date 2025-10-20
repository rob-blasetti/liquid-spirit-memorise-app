import React from 'react';
import { UserProvider } from './contexts/UserContext';
import { DifficultyProvider } from './contexts/DifficultyContext';
import Main from './components/Main';

const App = () => (
  <UserProvider>
    <DifficultyProvider>
      <Main />
    </DifficultyProvider>
  </UserProvider>
);

export default App;
