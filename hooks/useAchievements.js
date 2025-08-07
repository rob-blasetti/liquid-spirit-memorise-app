import { useState, useEffect } from 'react';
import {
  initAchievements,
  awardAchievementData,
  getTotalPoints,
  updateAchievementOnServer,
  fetchUserAchievements,
} from '../services/achievementsService';

export default function useAchievements(profile, saveProfile) {
  console.log('useAchievements profile:', profile);

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
        setAchievements(list);

        // 3) write back only if it’s new (optional, but helps avoid extra renders)
        const haveSame =
          JSON.stringify(profile.achievements) === JSON.stringify(list);
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

  // Award an achievement: update local state, persist profile, and notify backend
  const awardAchievement = async (id) => {
    if (!profile) return;
    // Compute updated achievements list and total points
    const { achievementsList, notification: note, totalPoints } =
      awardAchievementData(achievements, id);
    if (!note) return;
    // Update local achievements and notification
    setAchievements(achievementsList);
    setNotification(note);
    // Build updated profile object with new achievements and totalPoints
    const updatedProfile = {
      ...profile,
      achievements: achievementsList,
      totalPoints,
    };
    // Persist updated profile via context
    saveProfile(updatedProfile);
    // Remote update: send achievement to server
    try {
      await updateAchievementOnServer(
        profile._id || profile.nuriUserId,
        id
      );
    } catch (e) {
      console.error('Failed to update achievement on server', e);
    }
  };

  return {
    achievements,
    notification,
    setNotification,
    awardAchievement,
  };
}
