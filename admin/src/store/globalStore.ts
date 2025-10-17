import { create } from 'zustand';

interface GlobalState {
  collapsed: boolean;
  language: string;
  theme: 'light' | 'dark';
}

interface GlobalActions {
  toggleCollapsed: () => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

type GlobalStore = GlobalState & GlobalActions;

export const useGlobalStore = create<GlobalStore>((set) => ({
  collapsed: false,
  language: 'en',
  theme: 'light',

  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),

  setLanguage: (language) => {
    localStorage.setItem('admin_language', language);
    set({ language });
  },

  setTheme: (theme) => {
    localStorage.setItem('admin_theme', theme);
    set({ theme });
  },
}));
