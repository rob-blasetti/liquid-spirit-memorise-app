import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null); // { type: 'guest' | 'auth', token, user, member, child }

  useEffect(() => {
    const loadSession = async () => {
      const stored = await AsyncStorage.getItem('session');
      if (stored) setSession(JSON.parse(stored));
    };
    loadSession();
  }, []);

  const saveSession = async (data) => {
    setSession(data);
    await AsyncStorage.setItem('session', JSON.stringify(data));
  };

  const clearSession = async () => {
    setSession(null);
    await AsyncStorage.removeItem('session');
  };

  return (
    <SessionContext.Provider value={{ session, saveSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
