import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Evrensel güvenli depolama adaptörü (Universal Secure Storage Adapter).
 * Native platformlarda (iOS/Android) şifrelenmiş `expo-secure-store` kullanır.
 * Web ortamında `expo-secure-store` desteklenmediğinden `window.localStorage` üzerine düşer.
 */
export const secureStorage = {
  getItem: (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') {
        return Promise.resolve(null);
      }
      return Promise.resolve(window.localStorage.getItem(key));
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') {
        return Promise.resolve();
      }
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') {
        return Promise.resolve();
      }
      window.localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};
