import {
  normalizeChildEntries,
  resolveProfileId,
} from './profileUtils';
import { dedupeProfiles } from '../app/mainAppHelpers';

export const buildSelectableProfiles = ({
  profile,
  registeredProfile,
  guestProfile,
  children,
  authType = 'ls-login',
}) => {
  const childEntries = Array.isArray(children) ? children : [];
  const normalizedChildren = normalizeChildEntries(childEntries, { authType });

  return dedupeProfiles([
    registeredProfile,
    profile,
    ...normalizedChildren,
    guestProfile,
  ]);
};

export const canSwitchProfiles = ({
  profile,
  registeredProfile,
  guestProfile,
  children,
  authType = 'ls-login',
}) => {
  if (!profile) return false;

  const activeProfileId = resolveProfileId(profile);
  const selectableProfiles = buildSelectableProfiles({
    profile,
    registeredProfile,
    guestProfile,
    children,
    authType,
  });

  return selectableProfiles.some(candidate => {
    if (!candidate) return false;
    if (candidate.guest && !profile?.guest) return true;
    const candidateId = resolveProfileId(candidate);
    return Boolean(candidateId && candidateId !== activeProfileId);
  });
};
