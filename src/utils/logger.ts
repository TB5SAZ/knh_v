/**
 * Centralized Application Logger
 * Prevents raw errors and stack traces from leaking to the console in production environments.
 * Integrates with Expo's local __DEV__ flag.
 */

class Logger {
  info(message: string, ...optionalParams: any[]) {
    if (__DEV__) {
      console.log(`[INFO] ${message}`, ...optionalParams);
    }
  }

  warn(message: string, ...optionalParams: any[]) {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, ...optionalParams);
    }
  }

  error(message: string, error?: any) {
    if (__DEV__) {
      // Safely print in development
      console.error(`[ERROR] ${message}`, error);
    } else {
      // In production, we don't dump the raw error to prevent data leakage.
      // E.g., Sentry.captureException(error) or expo-error-reporter can be configured here.
      // For now, we drop it silently or only log a generic identifier.
      console.log(`[ERROR] An error occurred: ${message}`);
    }
  }
}

export const logger = new Logger();
