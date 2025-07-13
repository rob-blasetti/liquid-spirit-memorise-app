import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [family, setFamily] = useState(null);
  const [user, setUser] = useState(null);
  const [userChildren, setUserChildren] = useState([]);
  const [classes, setClasses] = useState([]);
  // Track which difficulty levels the user has completed (unlocks next level)
  const [completedDifficulties, setCompletedDifficulties] = useState({ 1: false, 2: false, 3: false });
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const allData = await AsyncStorage.multiGet(allKeys);

        const storedUser = await AsyncStorage.getItem('user');
        const storedFamily = await AsyncStorage.getItem('family');
        const storedChildren = await AsyncStorage.getItem('children');
        const storedClasses = await AsyncStorage.getItem('classes');

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedFamily) setFamily(JSON.parse(storedFamily));
        if (storedChildren) setUserChildren(JSON.parse(storedChildren));
        if (storedClasses) setClasses(JSON.parse(storedClasses));
        const storedCompleted = await AsyncStorage.getItem('completedDifficulties');
        if (storedCompleted) setCompletedDifficulties(JSON.parse(storedCompleted));
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setStorageLoaded(true);
      }
    };

    loadUserData();
  }, []);

  // Setters with AsyncStorage
  const updateUser = async (newUser) => {
    setUser(newUser);
    try {
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (e) {
      console.error('Error saving user:', e);
    }
  };
  const updateFamily = async (newFamily) => {
    setFamily(newFamily);
    try {
      // Avoid setting undefined/null values; remove key instead
      if (newFamily === undefined || newFamily === null) {
        await AsyncStorage.removeItem('family');
      } else {
        await AsyncStorage.setItem('family', JSON.stringify(newFamily));
      }
    } catch (e) {
      console.error('Error saving family:', e);
    }
  };

  const updateChildren = async (newChildren) => {
    setUserChildren(newChildren);
    try {
      await AsyncStorage.setItem('children', JSON.stringify(newChildren));
    } catch (e) {
      console.error('Error saving children:', e);
    }
  };

  const updateClasses = async (newClasses) => {
    setClasses(newClasses);
    try {
      await AsyncStorage.setItem('classes', JSON.stringify(newClasses));
    } catch (e) {
      console.error('Error saving classes:', e);
    }
  };
  // Mark a difficulty level as completed and persist
  const markDifficultyComplete = async (level) => {
    setCompletedDifficulties(prev => {
      const next = { ...prev, [level]: true };
      AsyncStorage.setItem('completedDifficulties', JSON.stringify(next)).catch(e => console.error('Error saving completedDifficulties:', e));
      return next;
    });
  };

  const clearUserData = async () => {
    setUser(null);
    setFamily(null);
    setUserChildren([]);
    setClasses([]);
    setCompletedDifficulties({ 1: false, 2: false, 3: false });
    try {
      await AsyncStorage.multiRemove(['user', 'family', 'children', 'classes', 'completedDifficulties']);
    } catch (e) {
      console.error('Error clearing user data:', e);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        family,
        children: userChildren,
        classes,
        completedDifficulties,
        setUser: updateUser,
        setFamily: updateFamily,
        setChildren: updateChildren,
        setClasses: updateClasses,
        markDifficultyComplete,
        clearUserData,
        storageLoaded,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
