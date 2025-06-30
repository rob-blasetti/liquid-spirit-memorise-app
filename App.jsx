import React from 'react';
import { UserProvider } from './contexts/UserContext';
import MainApp from './components/MainApp';

const App = () => (
  <UserProvider>
    <MainApp />
  </UserProvider>
);

export default App;
