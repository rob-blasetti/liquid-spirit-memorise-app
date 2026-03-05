import {
  buildProfileFromUser,
  normalizeChildEntries,
  resolveProfileId,
} from '../services/profileUtils';
import { TEST_USER_EMAIL, getTestUserClassData } from '../utils/data/core/testUserClassData';

export const dedupeProfiles = (profiles = []) => {
  const seen = new Set();
  const dedupedProfiles = [];

  profiles.filter(Boolean).forEach((candidate, index) => {
    const id = resolveProfileId(candidate);
    const key = id != null ? `id:${id}` : `fallback:${candidate.accountType || 'profile'}:${index}`;
    if (seen.has(key)) return;
    seen.add(key);
    dedupedProfiles.push(candidate);
  });

  return dedupedProfiles;
};

export const deriveAuthUserBundle = ({ payload, rawUser, authType, authMetadata }) => {
  let childList = Array.isArray(authMetadata?.children) ? authMetadata.children : [];

  const candidateEmails = [rawUser?.email, payload?.email, payload?.user?.email]
    .map(value => (typeof value === 'string' ? value.trim().toLowerCase() : null))
    .filter(Boolean);

  const isTestClassUser = candidateEmails.includes(TEST_USER_EMAIL);
  const testUserData = isTestClassUser ? getTestUserClassData() : null;

  if (isTestClassUser && testUserData) {
    childList = testUserData.children;
  }

  const normalizedUser = buildProfileFromUser(rawUser, { authType, childList });
  const normalizedChildren = normalizedUser.linkedAccount
    ? normalizeChildEntries(childList, { authType })
    : [];

  if (isTestClassUser && testUserData) {
    const clonedClasses = (testUserData.classes || []).map(cls => ({
      ...cls,
      facilitators: (cls.facilitators || []).map(person => ({ ...person })),
      participants: (cls.participants || []).map(person => ({ ...person })),
    }));
    normalizedUser.classes = clonedClasses;
    normalizedUser.class = clonedClasses;
    normalizedUser.numberOfChildren = normalizedChildren.length;
  }

  const availableProfiles = normalizedUser.linkedAccount
    ? [normalizedUser, ...normalizedChildren]
    : [normalizedUser];

  return {
    childList,
    normalizedUser,
    normalizedChildren,
    availableProfiles,
  };
};
