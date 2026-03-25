import { quoteMap as grade2QuoteMap } from './grade2';
import { quoteMap as grade2bQuoteMap } from './grade2b';

const DEFAULT_LESSON_NUMBERS = [1, 2, 3];

export const GRADE_CARD_DATA = [
  { grade: 1, title: 'Grade 1', book: 'Book 3', ages: 'Ages 5-7' },
  { grade: 2, title: 'Grade 2', book: 'Book 3-1', ages: 'Ages 7-8' },
  { grade: 3, title: 'Grade 3', book: 'Book 3-2', ages: 'Ages 7-8' },
  { grade: 4, title: 'Grade 4', book: 'Book 3-3', ages: 'Ages 8-9' },
  { grade: 5, title: 'Grade 5', book: 'Book 3-4', ages: 'Ages 9-10' },
];

export const GRADE_SCREEN_CONFIG = {
  2: {
    grade: 2,
    title: 'Grade 2',
    sets: [1, 2, 3],
    setTitles: {
      1: 'Turning to God in Prayer',
      2: 'Adhering to the Laws of God',
      3: 'Seeking Knowledge',
    },
    lessonNumbers: DEFAULT_LESSON_NUMBERS,
    getLessonContent: (setNumber, lessonNumber) =>
      grade2QuoteMap[`${setNumber}-${lessonNumber}`] || {},
    fallbackQuote: (setNumber, lessonNumber) =>
      `This is a dummy quote for Lesson ${lessonNumber} of Set ${setNumber}.`,
  },
  '2b': {
    grade: '2b',
    title: 'Grade 2',
    sets: [4, 5, 6, 7],
    setTitles: {
      4: 'Living in Harmony with Others',
      5: 'Respecting the Dignity of Every Human Being',
      6: 'Being A Good Friend',
      7: "Devoting One's Life to Service",
    },
    lessonNumbers: DEFAULT_LESSON_NUMBERS,
    getLessonContent: (setNumber, lessonNumber) => {
      const lessonEntry = grade2bQuoteMap[`${setNumber}-${lessonNumber}`] || {};
      const setPrayer = grade2bQuoteMap[`${setNumber}-1`]?.prayer;
      return {
        ...lessonEntry,
        prayer: lessonEntry.prayer || setPrayer,
      };
    },
    fallbackQuote: (setNumber, lessonNumber) =>
      `This is a dummy quote for Lesson ${lessonNumber} of Set ${setNumber}.`,
  },
  3: {
    grade: 3,
    title: 'Grade 3',
    message: 'Content coming soon',
  },
  4: {
    grade: 4,
    title: 'Grade 4',
    message: 'Content coming soon',
  },
};
