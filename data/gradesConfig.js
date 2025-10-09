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
    lessonNumbers: DEFAULT_LESSON_NUMBERS,
    getLessonContent: (setNumber, lessonNumber) =>
      grade2QuoteMap[`${setNumber}-${lessonNumber}`] || {},
    fallbackQuote: (setNumber, lessonNumber) =>
      `This is a dummy quote for Lesson ${lessonNumber} of Set ${setNumber}.`,
  },
  '2b': {
    grade: '2b',
    title: 'Grade 2 - Book 3-2',
    sets: [4, 5, 6, 7],
    lessonNumbers: DEFAULT_LESSON_NUMBERS,
    getLessonContent: (setNumber, lessonNumber) =>
      grade2bQuoteMap[`${setNumber}-${lessonNumber}`] || {},
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

