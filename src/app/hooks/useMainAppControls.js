import { useMemo, useState, useCallback } from 'react';
import { deleteNuriUser } from '../../services/authService';
import { clearCredentials } from '../../services/credentialService';

export default function useMainAppControls({
  profile,
  token,
  wipeProfile,
  clearUserData,
  deleteGuestAccount,
  saveProfile,
}) {
  const [profileSwitcherVisible, setProfileSwitcherVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [comingSoonGrade, setComingSoonGrade] = useState(null);

  const deleteRegisteredAccount = useCallback(async () => {
    if (!profile || profile.guest) {
      throw new Error('Only registered accounts can be deleted.');
    }

    const nuriUserId = profile.nuriUserId || profile._id || profile.id;
    const userId = profile._id || profile.id || profile.nuriUserId;
    const email = profile.email;
    const username = profile.username;
    if (!nuriUserId && !userId && !email && !username) {
      throw new Error('Unable to determine account identifier.');
    }

    if (!token) {
      throw new Error('Missing authentication token.');
    }

    await deleteNuriUser({
      token,
      nuriUserId,
      userId,
      email,
      username,
    });

    try {
      await clearCredentials();
    } catch (credentialError) {
      console.warn('Failed to clear saved credentials after account deletion', credentialError);
    }

    await wipeProfile({ clearRegistered: true });
    await clearUserData();
  }, [profile, token, wipeProfile, clearUserData]);

  const accountActions = useMemo(
    () => ({
      deleteGuestAccount,
      wipeProfile,
      saveProfile,
      deleteRegisteredAccount,
    }),
    [deleteGuestAccount, wipeProfile, saveProfile, deleteRegisteredAccount],
  );

  const modalHandlers = useMemo(
    () => ({
      setProfileModalVisible,
      setComingSoonGrade,
    }),
    [],
  );

  return {
    profileSwitcherVisible,
    setProfileSwitcherVisible,
    profileModalVisible,
    setProfileModalVisible,
    comingSoonGrade,
    setComingSoonGrade,
    accountActions,
    modalHandlers,
  };
}
