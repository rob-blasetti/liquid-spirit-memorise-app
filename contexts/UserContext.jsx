import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);          // current active user
  const [users, setUsers] = useState([]);          // all available user profiles
  const [family, setFamily] = useState(null);
  const [userChildren, setUserChildren] = useState([]);
  const [classes, setClasses] = useState([]);
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
        // Load auth token
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) setToken(storedToken);
        // Load all user profiles
        const storedUsers = await AsyncStorage.getItem('users');
        if (storedUsers) setUsers(JSON.parse(storedUsers));
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
      if (newUser === undefined || newUser === null) {
        await AsyncStorage.removeItem('user');
      } else {
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
      }
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

  // Update auth token
  const updateToken = async (newToken) => {
    setToken(newToken);
    try {
      if (newToken == null) {
        await AsyncStorage.removeItem('token');
      } else {
        await AsyncStorage.setItem('token', newToken);
      }
    } catch (e) {
      console.error('Error saving token:', e);
    }
  };
  
  // Update list of all user profiles
  const updateUsers = async (newUsers) => {
    setUsers(newUsers);
    try {
      if (!newUsers) {
        await AsyncStorage.removeItem('users');
      } else {
        await AsyncStorage.setItem('users', JSON.stringify(newUsers));
      }
    } catch (e) {
      console.error('Error saving users list:', e);
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
  const clearUserData = async () => {
    setToken(null);
    setUser(null);
    setUsers([]);
    setFamily(null);
    setUserChildren([]);
    setClasses([]);
    try {
      await AsyncStorage.multiRemove(['token', 'user', 'users', 'family', 'children', 'classes', 'completedDifficulties']);
    } catch (e) {
      console.error('Error clearing user data:', e);
    }
  };

  return (
    <UserContext.Provider
      value={{
        token,
        setToken: updateToken,
        user,               // current active user
        users,              // all available user profiles
        setUsers: updateUsers,
        family,
        children: userChildren,
        classes,
        setUser: updateUser,
        setFamily: updateFamily,
        setChildren: updateChildren,
        setClasses: updateClasses,
        clearUserData,
        storageLoaded,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
