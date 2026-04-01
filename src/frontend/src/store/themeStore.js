import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      mode: 'dark', // 'light' or 'dark'
      toggleTheme: () => set((state) => {
        const newMode = state.mode === 'light' ? 'dark' : 'light';
        if (newMode === 'dark') {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
        return { mode: newMode };
      }),
      setTheme: (mode) => {
        if (mode === 'dark') {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
        set({ mode });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
