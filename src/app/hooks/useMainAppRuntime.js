import { useEffect, useRef } from 'react';
import { normalizeChildEntries, resolveProfileId } from '../../services/profileUtils';
import { dedupeProfiles } from '../mainAppHelpers';
import {
  markAppInteractive,
  markNavigationComplete,
} from '../../services/performanceService';

export default function useMainAppRuntime({
  transitionState,
  displayNav,
  showSplash,
  storageLoaded,
  profile,
  registeredProfile,
  guestProfile,
  children,
  user,
  token,
  setUsers,
  refreshFromServer,
}) {
  const previousScreenRef = useRef(null);
  const pendingTransitionRef = useRef(null);
  const appInteractiveReportedRef = useRef(false);
  const setUsersRef = useRef(setUsers);
  const achievementsFetchRef = useRef(null);

  useEffect(() => {
    setUsersRef.current = setUsers;
  }, [setUsers]);

  useEffect(() => {
    if (transitionState) {
      pendingTransitionRef.current = transitionState;
    }
  }, [transitionState]);

  useEffect(() => {
    const screen = displayNav?.screen;
    if (!screen || showSplash) return;

    const pendingTransition = pendingTransitionRef.current;
    const fromScreen = pendingTransition?.from?.screen ?? previousScreenRef.current ?? null;
    const wasAnimated = Boolean(pendingTransition);

    markNavigationComplete(screen, {
      from: fromScreen,
      animated: wasAnimated,
    });

    pendingTransitionRef.current = null;
    previousScreenRef.current = screen;
  }, [displayNav?.screen, showSplash]);

  useEffect(() => {
    if (showSplash || !storageLoaded) return;
    const screen = displayNav?.screen;
    if (!screen || appInteractiveReportedRef.current) return;

    appInteractiveReportedRef.current = true;
    markAppInteractive({
      initialScreen: screen,
      hasProfile: Boolean(profile),
      hasToken: Boolean(token),
    });
  }, [showSplash, storageLoaded, displayNav?.screen, profile, token]);

  useEffect(() => {
    if (!profile && !registeredProfile) return;
    const childEntries = Array.isArray(children) ? children : [];
    const normalizedChildList = normalizeChildEntries(childEntries, { authType: 'ls-login' });
    const dedupedProfiles = dedupeProfiles([
      registeredProfile,
      profile,
      ...normalizedChildList,
      guestProfile,
    ]);

    if (dedupedProfiles.length > 0) {
      setUsersRef.current(dedupedProfiles);
    }
  }, [profile, registeredProfile, guestProfile, children]);

  useEffect(() => {
    if (!storageLoaded) return;
    if (!profile) {
      achievementsFetchRef.current = null;
      return;
    }
    const isGuestProfile = Boolean(profile?.guest || profile?.type === 'guest');
    if (isGuestProfile) {
      achievementsFetchRef.current = null;
      return;
    }
    const profileId = resolveProfileId(profile);
    if (!profileId) return;
    const activeUserId = resolveProfileId(user);
    if (!activeUserId) return;
    if (achievementsFetchRef.current === profileId) return;
    achievementsFetchRef.current = profileId;
    refreshFromServer();
  }, [storageLoaded, profile, user, refreshFromServer]);
}
