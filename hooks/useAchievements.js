import { useState, useEffect, useCallback } from 'react';
import {
  initAchievements,
  fetchUserAchievements,
} from '../services/achievementsService';
import { grantAchievement, grantGameAchievement } from '../services/achievementGrantService';

export default function useAchievements(profile, saveProfile) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.debug('useAchievements profile:', profile);
  }

  const [achievements, setAchievements] = useState(
    initAchievements(profile)
  );

useEffect(() => {
  // don’t run until we have a real ID
  const userId = profile?._id || profile?.id || profile?.nuriUserId;
  if (!userId) return;

  let isMounted = true;
  const load = async () => {
    try {
      // 1) fetch whatever the user already has on the server
      const { achievements: serverAchievements = [], totalPoints } =
        await fetchUserAchievements(userId);

      // 2) if server has none yet, seed them locally
      const list = serverAchievements.length
        ? serverAchievements
        : initAchievements(profile);

      if (isMounted) {
        // Avoid redundant state updates if identical
        const sameAsState = JSON.stringify(list) === JSON.stringify(achievements);
        if (!sameAsState) {
          setAchievements(list);
        }

        // 3) write back only if it’s new (optional, but helps avoid extra renders)
        const haveSame = JSON.stringify(profile.achievements) === JSON.stringify(list);
        if (!haveSame) {
          saveProfile({ ...profile, achievements: list, totalPoints });
        }
      }
    } catch (e) {
      console.error('Failed to fetch achievements:', e);
      if (isMounted) {
        // fall back
        const list = initAchievements(profile);
        setAchievements(list);
      }
    }
  };

  load();
  return () => { isMounted = false; };
},
// ← effect only re-runs when the user ID changes
[ profile?._id || profile?.id || profile?.nuriUserId ]
);
  
  const [notification, setNotification] = useState(null);

  // Award an achievement by ID via service
  const awardAchievement = useCallback(async (id) => {
    await grantAchievement({
      id,
      profile,
      achievements,
      setAchievements,
      setNotification,
      saveProfile,
    });
  }, [profile, achievements, setAchievements, setNotification, saveProfile]);

  // Award achievement for a game win based on screen and level
  const awardGameAchievement = useCallback(async (screen, level) => {
    await grantGameAchievement({
      screen,
      level,
      profile,
      achievements,
      setAchievements,
      setNotification,
      saveProfile,
    });
  }, [profile, achievements, setAchievements, setNotification, saveProfile]);

  return {
    achievements,
    notification,
    setNotification,
    awardAchievement,
    awardGameAchievement,
  };
}
