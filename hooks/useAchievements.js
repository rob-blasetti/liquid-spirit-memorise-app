import { useState } from 'react';
import { achievements as defaultAchievements } from '../data/achievements';

export default function useAchievements(profile, saveProfile) {
  const [achievements, setAchievements] = useState(defaultAchievements);
  const [notification, setNotification] = useState(null);

  const awardAchievement = (id) => {
    if (!profile) return;
    setAchievements(prev => {
      const ach = prev.find(a => a.id === id);
      if (!ach || ach.earned) return prev;
      const updated = prev.map(a => a.id === id ? { ...a, earned: true } : a);
      const newScore = updated.reduce((sum, a) => sum + (a.earned && a.points ? a.points : 0), 0);
      saveProfile({ ...profile, achievements: updated, score: newScore });
      setNotification({ id, title: ach.title });
      return updated;
    });
  };

  return {
    achievements,
    notification,
    setNotification,
    awardAchievement,
  };
}
