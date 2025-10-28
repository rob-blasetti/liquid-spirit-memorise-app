import { useReducer, useEffect, useState } from 'react';
import {
  loadProfile,
  loadGuestProfile,
  saveProfile as persistProfile,
  deleteGuestProfile,
  clearProfile,
} from '../services/profileService';
import { normalizeGradeValue } from '../services/profileUtils';

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

  const normalizeProfileGrade = (incoming) => {
    if (!incoming || typeof incoming !== 'object') return incoming;
    if (Object.prototype.hasOwnProperty.call(incoming, 'grade')) {
      return { ...incoming, grade: normalizeGradeValue(incoming.grade) };
    }
    return incoming;
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setShowSplash(false);
      return;
    }
    const timeout = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  // On mount, load stored profile (registered or guest) and set active profile accordingly
  useEffect(() => {
    const fetchProfiles = async () => {
      // Try loading a registered profile
      const prof = await loadProfile();
      if (prof) {
        const normalizedProf = normalizeProfileGrade(prof);
        setRegisteredProfile(normalizedProf);
        dispatch({ type: 'setProfile', payload: normalizedProf });
      }
      // Try loading a guest profile
      const guest = await loadGuestProfile();
      if (__DEV__) {
        const prettyGuest =
          guest && typeof guest === 'object'
            ? {
                ...guest,
                profilePicture: summariseDataUri(guest.profilePicture),
                avatar: summariseDataUri(guest.avatar),
              }
            : guest;
        console.log('GUEST:', prettyGuest);
      }
      if (guest) {
        const normalizedGuest = normalizeProfileGrade(guest);
        // store guestProfile in state
        dispatch({ type: 'setGuestProfile', payload: normalizedGuest });
        // if no registered profile, make guest the active profile
        if (!prof) {
          dispatch({ type: 'setProfile', payload: normalizedGuest });
        }
      }
    };
    fetchProfiles();
  }, []);

  const getProfileId = (user = {}) => {
    if (!user || typeof user !== 'object') return null;
    const id = user._id ?? user.id ?? user.nuriUserId ?? null;
    return id != null ? String(id) : null;
  };

  const isParentProfile = (user = {}) => user?.accountType === 'parent';

  const saveProfile = async (p) => {
    // Normalize grade: numeric grades to Number, preserve '2b'
    const prof = { ...p };
    prof.grade = normalizeGradeValue(prof.grade);
    // If this is a registered user, update registeredProfile storage
    if (!prof.guest) {
      setRegisteredProfile((prev) => {
        if (!prev) return prof;
        const prevId = getProfileId(prev);
        const nextId = getProfileId(prof);
        if (prevId && nextId && prevId === nextId) {
          return prof;
        }
        const prevIsParent = isParentProfile(prev);
        const nextIsParent = isParentProfile(prof);
        if (prevIsParent && !nextIsParent) {
          return prev;
        }
        if (!prevIsParent && nextIsParent) {
          return prof;
        }
        if (!prevIsParent && !prevId) {
          return prof;
        }
        return nextIsParent ? prof : prev;
      });
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

  const wipeProfile = async ({ clearRegistered = false } = {}) => {
    await clearProfile();
    if (clearRegistered) {
      setRegisteredProfile(null);
    }
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
    setProfile: (p) => dispatch({ type: 'setProfile', payload: normalizeProfileGrade(p) }),
    setGuestProfile: (p) => dispatch({ type: 'setGuestProfile', payload: normalizeProfileGrade(p) }),
    saveProfile,
    wipeProfile,
    deleteGuestAccount: async () => {
      // Remove guest profile from storage and state
      await deleteGuestProfile();
      dispatch({ type: 'setGuestProfile', payload: null });
      // If the active profile was a guest, switch back to registered or clear
      if (state.profile && state.profile.guest) {
        if (registeredProfile) {
          dispatch({ type: 'setProfile', payload: registeredProfile });
        } else {
          dispatch({ type: 'setProfile', payload: null });
        }
      }
    },
  };
}
export { useProfile };

function summariseDataUri(value) {
  if (!value || typeof value !== 'string') return value;
  if (!value.startsWith('data:')) return value;
  const [meta, payload = ''] = value.split(',', 2);
  const payloadLength = payload.length;
  return `${meta},<encoded:${payloadLength} chars>`;
}
