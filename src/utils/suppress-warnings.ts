/**
 * Suppress known framework-level warnings from terminal and LogBox.
 * Must be imported BEFORE any other module to take effect early.
 */
import { LogBox } from 'react-native';

const SUPPRESSED_WARNINGS = [
  "Couldn't find a navigation context",
  "SafeAreaView has been deprecated",
  "is not a valid color or brush",
];

LogBox.ignoreLogs(SUPPRESSED_WARNINGS);

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  if (SUPPRESSED_WARNINGS.some(w => message.includes(w))) return;
  originalWarn(...args);
};
