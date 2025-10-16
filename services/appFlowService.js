import { getContentFor } from './contentSelector';

export const createAppActions = ({
  profile,
  goTo,
  nav,
  getCurrentProgress,
  awardAchievement,
  recordDailyChallenge,
}) => {
  const handleDailyChallenge = () => {
    if (awardAchievement) {
      awardAchievement('daily');
    }
    if (recordDailyChallenge) {
      recordDailyChallenge();
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

  const launchStoryModeGame = () => {
    const progress = getCurrentProgress();
    const { setNumber, lessonNumber } = progress;
    const quote = getContentFor(profile, setNumber, lessonNumber, { type: 'quote' });
    goTo('tapGame', {
      quote,
      setNumber,
      lessonNumber,
      fromStoryMode: true,
      lessonScreen: 'storyMode',
    });
  };

  const getHomeProgress = () => {
    const progress = getCurrentProgress();
    const { setNumber, lessonNumber } = progress;
    return { setNumber, lessonNumber };
  };

  const getQuoteOfTheWeek = () => {
    const progress = getCurrentProgress();
    const { setNumber, lessonNumber } = progress;
    return {
      quote: getContentFor(profile, setNumber, lessonNumber, { type: 'quote' }),
      setNumber,
      lessonNumber,
    };
  };

  return {
    handleDailyChallenge,
    playSelectedGame,
    getHomeProgress,
    launchStoryModeGame,
    getQuoteOfTheWeek,
  };
};
