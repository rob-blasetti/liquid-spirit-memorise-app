import { getContentFor } from './contentSelector';
import { sanitizeQuoteText } from './quoteSanitizer';

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
    const rawQuote = getContentFor(profile, setNumber, lessonNumber, { type: 'prayer' });
    const sanitizedQuote = sanitizeQuoteText(rawQuote);
    goTo('practice', { quote: sanitizedQuote, rawQuote, sanitizedQuote, setNumber, lessonNumber });
  };

  const playSelectedGame = (gameId) => {
    const progress = getCurrentProgress();
    const { setNumber, lessonNumber } = progress;
    const rawQuote = getContentFor(profile, setNumber, lessonNumber, { type: 'quote' });
    const sanitizedQuote = sanitizeQuoteText(rawQuote);
    goTo(gameId, {
      quote: sanitizedQuote,
      rawQuote,
      sanitizedQuote,
      setNumber,
      lessonNumber,
      fromGames: true,
      lessonScreen: nav.screen,
    });
  };

  const launchStoryModeGame = () => {
    const progress = getCurrentProgress();
    const { setNumber, lessonNumber } = progress;
    const rawQuote = getContentFor(profile, setNumber, lessonNumber, { type: 'quote' });
    const sanitizedQuote = sanitizeQuoteText(rawQuote);
    goTo('tapGame', {
      quote: sanitizedQuote,
      rawQuote,
      sanitizedQuote,
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
