const normalizeGradeValue = (grade) => {
  if (typeof grade === 'string') {
    const trimmed = grade.trim();
    if (trimmed.length === 0) return 1;
    const lower = trimmed.toLowerCase();
    if (lower === '2b') return '2b';
    if (
      lower === 'preschool' ||
      lower === 'pre-school' ||
      lower === 'pre k' ||
      lower === 'pre-k' ||
      lower === 'prek' ||
      lower === 'prekindergarten' ||
      lower === 'pre-kindergarten'
    ) {
      return 'Preschool';
    }
    const gradeLetterMatch = trimmed.match(/^grade\s*(\d+)\s*([a-z])$/i);
    if (gradeLetterMatch) {
      const gradeNumber = Number(gradeLetterMatch[1]);
      const gradeSuffix = gradeLetterMatch[2].toLowerCase();
      if (gradeNumber === 2 && gradeSuffix === 'b') {
        return '2b';
      }
    } else {
      const gradeNumberMatch = trimmed.match(/^grade\s*(\d+)$/i);
      if (gradeNumberMatch) {
        const gradeNumber = Number(gradeNumberMatch[1]);
        if (Number.isFinite(gradeNumber) && gradeNumber > 0) {
          return gradeNumber;
        }
      }
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return trimmed;
  }
  if (grade === '2b') return '2b';
  const numeric = Number(grade);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
};

const coerceNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const deriveDisplayName = (user = {}) => {
  const first = typeof user.firstName === 'string' ? user.firstName.trim() : '';
  const last = typeof user.lastName === 'string' ? user.lastName.trim() : '';
  const combined = [first, last].filter(Boolean).join(' ');
  if (combined) return combined;
  if (typeof user.name === 'string' && user.name.trim()) return user.name.trim();
  if (typeof user.username === 'string' && user.username.trim()) return user.username.trim();
  return 'Learner';
};

const extractChildrenList = (user = {}, payload = {}) => {
  if (Array.isArray(user.children)) return user.children;
  if (Array.isArray(user.childrens)) return user.childrens;
  if (Array.isArray(payload.children)) return payload.children;
  if (Array.isArray(payload.childrens)) return payload.childrens;
  if (Array.isArray(payload.classes)) return payload.classes;
  return [];
};

const buildProfileFromUser = (user = {}, options = {}) => {
  const normalized = { ...user };
  normalized.guest = Boolean(user.guest);
  normalized.grade = normalizeGradeValue(user.grade ?? 1);

  const points =
    coerceNumber(user.totalPoints) ??
    coerceNumber(user.score) ??
    0;
  normalized.totalPoints = points;
  normalized.score = coerceNumber(user.score) ?? points;
  normalized.achievements = Array.isArray(user.achievements) ? user.achievements : [];

  const displayName = deriveDisplayName(user);
  normalized.name = displayName;
  if (!normalized.username && displayName) {
    normalized.username = displayName;
  }

  const avatarSource = user.profilePicture ?? user.avatar ?? null;
  normalized.profilePicture = avatarSource;
  if (user.avatar && !normalized.avatar) {
    normalized.avatar = user.avatar;
  }

  const rawClasses = Array.isArray(user.classes)
    ? user.classes
    : Array.isArray(user.class)
    ? user.class
    : [];
  if (Array.isArray(rawClasses)) {
    normalized.classes = rawClasses.map((cls) => ({ ...cls }));
  } else {
    normalized.classes = [];
  }
  if (Array.isArray(user.class) && !Array.isArray(user.classes)) {
    normalized.class = normalized.classes;
  }

  const authType = options.authType;
  const childList = options.childList;
  const profileKind = options.profileKind;
  const isChildProfile = profileKind === 'child';
  const linked =
    typeof user.linkedAccount === 'boolean'
      ? user.linkedAccount
      : authType === 'ls-login';
  normalized.linkedAccount = isChildProfile ? false : Boolean(linked);

  let numberOfChildren =
    coerceNumber(user.numberOfChildren) ??
    (Array.isArray(user.children) ? user.children.length : null) ??
    (Array.isArray(user.childrens) ? user.childrens.length : null);

  if (isChildProfile) {
    numberOfChildren = 0;
  } else if (normalized.linkedAccount) {
    if (numberOfChildren == null && Array.isArray(childList)) {
      numberOfChildren = childList.length;
    }
    if (numberOfChildren == null) {
      numberOfChildren = 0;
    }
  } else {
    numberOfChildren = null;
  }
  normalized.numberOfChildren = numberOfChildren;

  if (profileKind) {
    normalized.accountType = profileKind;
  } else if (normalized.guest) {
    normalized.accountType = 'guest';
  } else if (normalized.linkedAccount) {
    normalized.accountType = 'parent';
  } else {
    normalized.accountType = 'learner';
  }

  return normalized;
};

const resolveUserFromPayload = (payload = {}) => {
  if (payload.user && typeof payload.user === 'object') {
    return payload.user;
  }
  if (payload.profile && typeof payload.profile === 'object') {
    return payload.profile;
  }
  if (payload && typeof payload === 'object' && payload.guest) {
    return payload;
  }
  return null;
};

const deriveAuthMetadata = (payload = {}, user = {}) => {
  const childList = extractChildrenList(user, payload);
  return {
    children: childList,
    family: payload.family ?? null,
    token: payload.token ?? null,
  };
};

const resolveAuthType = (payload = {}, user = {}) => {
  if (typeof payload.authType === 'string' && payload.authType.length > 0) {
    return payload.authType;
  }
  if (user.guest) return 'guest-login';
  if (user.linkedAccount || user.type === 'linked') return 'ls-login';
  return 'nuri-login';
};

const normalizeChildEntries = (entries = [], options = {}) => {
  if (!Array.isArray(entries) || entries.length === 0) return [];

  const authType = options.authType || 'ls-login';

  const dedupeKey = (entity) => {
    if (!entity || typeof entity !== 'object') return null;
    const id =
      entity._id ??
      entity.id ??
      entity.nuriUserId ??
      entity.memberRef ??
      null;
    return id != null ? `id:${id}` : null;
  };

  const results = entries
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;

      const childData =
        entry.child && typeof entry.child === 'object'
          ? entry.child
          : entry;

      const derived = buildProfileFromUser(
        { ...childData, guest: false },
        { authType, childList: [], profileKind: 'child' },
      );
      const classSource = Array.isArray(childData.classes)
        ? childData.classes
        : Array.isArray(childData.class)
        ? childData.class
        : [];
      const classList = classSource.map((cls) => ({ ...cls }));

      const baseChild = {
        ...childData,
        ...derived,
        guest: false,
        accountType: 'child',
        classes: classList,
        class: classList,
        linkedAccount: false,
        numberOfChildren: 0,
      };

      if (entry.child && typeof entry.child === 'object') {
        const { child, ...rest } = entry;
        return {
          ...rest,
          ...baseChild,
          child: { ...baseChild },
        };
      }

      return { ...entry, ...baseChild };
    })
    .filter(Boolean);

  const seenKeys = new Set();
  const deduped = [];

  results.forEach((child, index) => {
    const key = dedupeKey(child) ?? `index:${index}`;
    if (seenKeys.has(key)) {
      return;
    }
    seenKeys.add(key);
    deduped.push(child);
  });

  return deduped;
};

export {
  normalizeGradeValue,
  coerceNumber,
  deriveDisplayName,
  extractChildrenList,
  buildProfileFromUser,
  resolveUserFromPayload,
  deriveAuthMetadata,
  resolveAuthType,
  normalizeChildEntries,
};
