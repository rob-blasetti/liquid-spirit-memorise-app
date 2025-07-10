/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { readQuote } from './services/speechService';
import { name as appName } from './app.json';

// Override console.log to also read logs via TTS
const originalConsoleLog = console.log;
console.log = (...args) => {
  originalConsoleLog(...args);
  try {
    const message = args
      .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');
    readQuote(message);
  } catch (ttsError) {
    originalConsoleLog('Failed to speak log:', ttsError);
  }
};
AppRegistry.registerComponent(appName, () => App);
