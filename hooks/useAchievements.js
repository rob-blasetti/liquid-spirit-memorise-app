import { useState, useEffect } from 'react';
import {
  initAchievements,
  awardAchievementData,
  getTotalPoints,
  updateAchievementOnServer,
} from '../services/achievementsService';

export default function useAchievements(profile, saveProfile) {
  const [achievements, setAchievements] = useState(
    initAchievements(profile)
  );
  // Re-initialize achievements list when profile data changes (e.g., on login)
  useEffect(() => {
    setAchievements(initAchievements(profile));
  }, [profile]);
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
