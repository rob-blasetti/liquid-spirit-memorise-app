import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LEGACY_LEVEL_KEYS = ['1', '2', '3'];
const GLOBAL_GAME_KEY = '__global';
const MAX_DIFFICULTY_LEVEL = 3;

const normalizeLevelMap = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.keys(value).reduce((acc, key) => {
    const level = Number(key);
    if (Number.isFinite(level) && level > 0) {
      acc[level] = Boolean(value[key]);
    }
    return acc;
  }, {});
};

const computeHighestUnlocked = (completedMap = {}) => {
  let highest = 1;
  for (let lvl = 1; lvl <= MAX_DIFFICULTY_LEVEL; lvl += 1) {
    if (completedMap?.[lvl]) {
      highest = Math.min(lvl + 1, MAX_DIFFICULTY_LEVEL);
    } else {
      break;
    }
  }
  return highest;
};

const toProgressEntry = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { completed: {}, highestUnlocked: 1 };
  }

  const hasStructuredShape = Object.prototype.hasOwnProperty.call(raw, 'completed')
    || Object.prototype.hasOwnProperty.call(raw, 'highestUnlocked');

  if (hasStructuredShape) {
    const completed = normalizeLevelMap(raw.completed || {});
    const fallbackHighest = computeHighestUnlocked(completed);
    const numericHighest = Number(raw.highestUnlocked);
    const highestUnlocked = Number.isFinite(numericHighest)
      ? Math.min(Math.max(numericHighest, 1), MAX_DIFFICULTY_LEVEL)
      : fallbackHighest;
    return { completed, highestUnlocked };
  }

  const completed = normalizeLevelMap(raw);
  return {
    completed,
    highestUnlocked: computeHighestUnlocked(completed),
  };
};

const normalizeCompletedDifficulties = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const keys = Object.keys(raw);
  const isLegacyPayload = keys.every((key) => LEGACY_LEVEL_KEYS.includes(key));
  if (isLegacyPayload) {
    return { [GLOBAL_GAME_KEY]: toProgressEntry(raw) };
  }
  return keys.reduce((acc, key) => {
    const progressEntry = toProgressEntry(raw[key]);
    acc[key] = progressEntry;
    return acc;
  }, {});
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);          // current active user
  const [users, setUsers] = useState([]);          // all available user profiles
  const [family, setFamily] = useState(null);
  const [userChildren, setUserChildren] = useState([]);
  const [classes, setClasses] = useState([]);
  // Track which difficulty levels the user has completed (unlocks next level)
  const [completedDifficulties, setCompletedDifficulties] = useState({});
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
        // Load auth token
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) setToken(storedToken);
        // Load all user profiles
        const storedUsers = await AsyncStorage.getItem('users');
        if (storedUsers) setUsers(JSON.parse(storedUsers));
        if (storedCompleted) {
          try {
            const parsed = JSON.parse(storedCompleted);
            setCompletedDifficulties(normalizeCompletedDifficulties(parsed));
          } catch (parseError) {
            console.error('Failed to parse completedDifficulties from storage:', parseError);
            setCompletedDifficulties({});
          }
        }
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
  // Mark a difficulty level as completed and persist
  const markDifficultyComplete = async (gameId, level) => {
    const numericLevel = Number(level);
    if (!Number.isFinite(numericLevel) || numericLevel <= 0) {
      return;
    }
    setCompletedDifficulties((prev) => {
      const targetGame = gameId || GLOBAL_GAME_KEY;
      const currentEntry = toProgressEntry(prev[targetGame]);
      const nextCompleted = { ...currentEntry.completed, [numericLevel]: true };
      const unlockedCandidate = Math.min(numericLevel + 1, MAX_DIFFICULTY_LEVEL);
      const nextHighest = Math.max(currentEntry.highestUnlocked || 1, unlockedCandidate);
      const nextEntry = {
        completed: nextCompleted,
        highestUnlocked: nextHighest,
      };
      const next = { ...prev, [targetGame]: nextEntry };
      AsyncStorage.setItem('completedDifficulties', JSON.stringify(next)).catch((e) =>
        console.error('Error saving completedDifficulties:', e),
      );
      return next;
    });
  };

  const getCompletedLevelsForGame = useCallback(
    (gameId) => {
      const fallback = completedDifficulties[GLOBAL_GAME_KEY];
      if (!gameId) {
        return fallback || { completed: {}, highestUnlocked: 1 };
      }
      if (completedDifficulties[gameId]) {
        return completedDifficulties[gameId];
      }
      return fallback || { completed: {}, highestUnlocked: 1 };
    },
    [completedDifficulties],
  );

  const clearUserData = async () => {
    setToken(null);
    setUser(null);
    setUsers([]);
    setFamily(null);
    setUserChildren([]);
    setClasses([]);
    setCompletedDifficulties({});
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
        completedDifficulties,
        setUser: updateUser,
        setFamily: updateFamily,
        setChildren: updateChildren,
        setClasses: updateClasses,
        markDifficultyComplete,
        getCompletedLevelsForGame,
        clearUserData,
        storageLoaded,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
