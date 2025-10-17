/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  TOKEN: process.env.VITE_TOKEN_KEY || 'admin_token',
  USER: 'admin_user',
  LANGUAGE: 'admin_language',
  THEME: 'admin_theme',
} as const;

/**
 * Get item from localStorage
 */
export const getStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting storage key "${key}":`, error);
    return null;
  }
};

/**
 * Set item to localStorage
 */
export const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting storage key "${key}":`, error);
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing storage key "${key}":`, error);
  }
};

/**
 * Clear all storage
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

/**
 * Get token from storage
 */
export const getToken = (): string | null => {
  return getStorage<string>(STORAGE_KEYS.TOKEN);
};

/**
 * Set token to storage
 */
export const setToken = (token: string): void => {
  setStorage(STORAGE_KEYS.TOKEN, token);
};

/**
 * Remove token from storage
 */
export const removeToken = (): void => {
  removeStorage(STORAGE_KEYS.TOKEN);
};
