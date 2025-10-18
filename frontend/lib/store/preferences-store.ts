import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Locale, Currency } from '@/lib/schemas';

export interface PreferencesState {
  locale: Locale;
  currency: Currency;
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: Currency) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: 'en',
      currency: 'MYR',

      setLocale: (locale) => {
        set({ locale });
      },

      setCurrency: (currency) => {
        set({ currency });
        // 同步到 cookie
        document.cookie = `currency=${currency}; path=/; max-age=31536000`;
      },
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
