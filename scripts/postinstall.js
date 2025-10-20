#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-tts',
  'ios',
  'TextToSpeech',
  'TextToSpeech.m'
);

const replacements = [
  {
    search: 'RCT_EXPORT_METHOD(stop:(BOOL *)onWordBoundary',
    replace: 'RCT_EXPORT_METHOD(stop:(nullable NSNumber *)onWordBoundary',
  },
  {
    search: 'if(onWordBoundary != NULL && onWordBoundary)',
    replace: 'if(onWordBoundary != NULL && [onWordBoundary boolValue])',
  },
  {
    search: 'RCT_EXPORT_METHOD(pause:(BOOL *)onWordBoundary',
    replace: 'RCT_EXPORT_METHOD(pause:(nullable NSNumber *)onWordBoundary',
  },
  {
    search: 'if(onWordBoundary != NULL && onWordBoundary)',
    replace: 'if(onWordBoundary != NULL && [onWordBoundary boolValue])',
  },
];

const applyReplacements = (contents, replacementsList) => {
  let updated = contents;
  let changed = false;

  replacementsList.forEach(item => {
    const targetString = item.search;

    if (updated.includes(targetString)) {
      updated = updated.split(targetString).join(item.replace);
      changed = true;
    }
  });

  return { updated, changed };
};

try {
  if (!fs.existsSync(target)) {
    process.exit(0);
  }

  const original = fs.readFileSync(target, 'utf8');
  const { updated, changed } = applyReplacements(original, replacements);

  if (changed) {
    fs.writeFileSync(target, updated, 'utf8');
    console.log('Applied react-native-tts BOOL pointer safety patch');
  }
} catch (error) {
  console.warn('Unable to patch react-native-tts BOOL pointer issue:', error);
}
