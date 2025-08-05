import { useState, useEffect } from 'react';
import {
  initAchievements,
  awardAchievementData,
  getTotalPoints,
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

  const awardAchievement = (id) => {
    if (!profile) return;
    setAchievements(prev => {
      const { achievementsList, notification: note, totalPoints } =
        awardAchievementData(prev, id);
      if (!note) return prev;
      // persist updated profile with new achievements and score
      saveProfile({
        ...profile,
        achievements: achievementsList,
        score: totalPoints,
      });
      setNotification(note);
      return achievementsList;
    });
  };

  return {
    achievements,
    notification,
    setNotification,
    awardAchievement,
  };
}
