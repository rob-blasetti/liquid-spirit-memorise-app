import { getContentFor } from './contentSelector';

export const createAppActions = ({
  profile,
  goTo,
  nav,
  getCurrentProgress,
  awardAchievement,
}) => {
  const handleDailyChallenge = () => {
    if (awardAchievement) {
      awardAchievement('daily');
    }
    const progress = getCurrentProgress();
    const { setNumber, lessonNumber } = progress;
    const quote = getContentFor(profile, setNumber, lessonNumber, { type: 'prayer' });
    goTo('practice', { quote, setNumber, lessonNumber });
  };

  const playSelectedGame = (gameId) => {
    const progress = getCurrentProgress();
    const { setNumber, lessonNumber } = progress;
    const quote = getContentFor(profile, setNumber, lessonNumber, { type: 'quote' });
    goTo(gameId, {
      quote,
      setNumber,
      lessonNumber,
      fromGames: true,
      lessonScreen: nav.screen,
    });
  };

  const getHomeProgress = () => {
    const progress = getCurrentProgress();
    const { setNumber, lessonNumber } = progress;
    return { setNumber, lessonNumber };
  };

  return {
    handleDailyChallenge,
    playSelectedGame,
    getHomeProgress,
  };
};
