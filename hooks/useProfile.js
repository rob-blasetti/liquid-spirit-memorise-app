import { useReducer, useEffect, useState } from 'react';
import {
  loadProfile,
  loadGuestProfile,
  saveProfile as persistProfile,
  deleteGuestProfile,
  clearProfile,
} from '../services/profileService';

const initialState = {
  profile: null,       // active profile
  guestProfile: null,
};

// We keep separate registeredProfile to preserve original non-guest user

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
  const [registeredProfile, setRegisteredProfile] = useState(null);

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
      if (prof) {
        setRegisteredProfile(prof);
        dispatch({ type: 'setProfile', payload: prof });
      }
      const guest = await loadGuestProfile();
      if (guest) dispatch({ type: 'setGuestProfile', payload: guest });
    };
    fetchProfiles();
  }, []);

  const saveProfile = async (p) => {
    // Normalize grade: numeric grades to Number, preserve '2b'
    const prof = { ...p };
    if (prof.grade !== '2b') {
      prof.grade = Number(prof.grade);
    }
    // If this is a registered user, update registeredProfile storage
    if (!prof.guest) {
      setRegisteredProfile(prof);
    }
    // Set active profile
    dispatch({ type: 'setProfile', payload: prof });
    // Persist to appropriate storage
    await persistProfile(prof);
    if (prof.guest) {
      // Also update in-memory guestProfile
      dispatch({ type: 'setGuestProfile', payload: prof });
    }
  };

  const wipeProfile = async () => {
    await clearProfile();
    dispatch({ type: 'setProfile', payload: null });
  };

  return {
    showSplash,
    // active user profile
    profile: state.profile,
    // the non-guest registered profile
    registeredProfile,
    // guest profile
    guestProfile: state.guestProfile,
    setProfile: (p) => dispatch({ type: 'setProfile', payload: p }),
    setGuestProfile: (p) => dispatch({ type: 'setGuestProfile', payload: p }),
    saveProfile,
    wipeProfile,
    deleteGuestAccount: async () => {
      await deleteGuestProfile();
      dispatch({ type: 'setGuestProfile', payload: null });
      // If active was guest, switch back to registered
      if (state.profile && state.profile.guest && registeredProfile) {
        dispatch({ type: 'setProfile', payload: registeredProfile });
      }
    },
  };
}
