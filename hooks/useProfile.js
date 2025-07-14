import { useReducer, useEffect, useState } from 'react';
import {
  loadProfile,
  loadGuestProfile,
  saveProfile as persistProfile,
  deleteGuestProfile,
  clearProfile,
} from '../services/profileService';

const initialState = {
  profile: null,
  guestProfile: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'setProfile':
      return { ...state, profile: action.payload };
    case 'setGuestProfile':
      return { ...state, guestProfile: action.payload };
    default:
      return state;
  }
}

export default function useProfile() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setShowSplash(false);
      return;
    }
    const timeout = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      const prof = await loadProfile();
      if (prof) dispatch({ type: 'setProfile', payload: prof });
      const guest = await loadGuestProfile();
      if (guest) dispatch({ type: 'setGuestProfile', payload: guest });
    };
    fetchProfiles();
  }, []);

  const saveProfile = async (p) => {
    dispatch({ type: 'setProfile', payload: p });
    await persistProfile(p);
  };

  const wipeProfile = async () => {
    await clearProfile();
    dispatch({ type: 'setProfile', payload: null });
  };

  return {
    showSplash,
    profile: state.profile,
    guestProfile: state.guestProfile,
    setProfile: (p) => dispatch({ type: 'setProfile', payload: p }),
    setGuestProfile: (p) => dispatch({ type: 'setGuestProfile', payload: p }),
    saveProfile,
    wipeProfile,
    deleteGuestAccount: async () => {
      await deleteGuestProfile();
      dispatch({ type: 'setGuestProfile', payload: null });
    },
  };
}
