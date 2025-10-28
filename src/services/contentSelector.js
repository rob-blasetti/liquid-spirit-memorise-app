// services/contentSelector.js
// Centralizes content selection by grade and current progress

import { grade1Lessons } from '../utils/data/core/grade1';
import { quoteMap } from '../utils/data/core/grade2';
import { quoteMap as quoteMap2b } from '../utils/data/core/grade2b';

export function getContentFor(profile, setNumber, lessonNumber, options = {}) {
  const { type = 'quote' } = options; // 'quote' | 'prayer'
  if (!profile) return '';
  const grade = profile.grade;

  if (grade === 1 || grade === '1') {
    const lesson = grade1Lessons.find(l => l.lesson === lessonNumber);
    if (!lesson) return '';
    return type === 'prayer' ? (lesson.prayer || '') : (lesson.quote || '');
  }

  if (grade === 2 || grade === '2') {
    const key = `${setNumber}-${lessonNumber}`;
    const qObj = quoteMap[key];
    return qObj?.text || '';
  }

  if (grade === '2b') {
    const key = `${setNumber}-${lessonNumber}`;
    const qObj = quoteMap2b[key];
    return qObj?.text || '';
  }

  return '';
}

export function getCurrentContent(profile, getCurrentProgress, options = {}) {
  const { setNumber, lessonNumber } = getCurrentProgress();
  return getContentFor(profile, setNumber, lessonNumber, options);
}
