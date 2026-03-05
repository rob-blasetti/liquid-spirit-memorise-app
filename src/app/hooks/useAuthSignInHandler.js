import { useCallback } from 'react';
import {
  deriveAuthMetadata,
  resolveAuthType,
  resolveUserFromPayload,
} from '../../services/profileUtils';
import { deriveAuthUserBundle } from '../mainAppHelpers';

export default function useAuthSignInHandler({
  setToken,
  setFamily,
  setChildren,
  setUsers,
  setUser,
  saveProfile,
  goTo,
}) {
  return useCallback(
    async (data) => {
      const payload = data || {};
      const rawUser = resolveUserFromPayload(payload);
      if (!rawUser) {
        console.warn('Auth payload did not include a user object');
        return;
      }

      const authType = resolveAuthType(payload, rawUser);
      const authMetadata = deriveAuthMetadata(payload, rawUser);
      const { family, token } = authMetadata;

      const { normalizedUser, normalizedChildren, availableProfiles } = deriveAuthUserBundle({
        payload,
        rawUser,
        authType,
        authMetadata,
      });

      await setToken(token ?? null);
      await setFamily(normalizedUser.guest ? null : (family ?? null));
      await setChildren(normalizedChildren);
      await setUsers(availableProfiles);
      await setUser(normalizedUser);
      await saveProfile(normalizedUser);
      goTo('home');
    },
    [setToken, setFamily, setChildren, setUsers, setUser, saveProfile, goTo],
  );
}
