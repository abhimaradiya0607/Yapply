import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_THEME, isTheme, type Theme } from "../constants/themes";

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const applyDocumentTheme = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      setTheme: (theme) => {
        set({ theme });
        // Apply immediately so a view transition can capture the new theme.
        applyDocumentTheme(theme);
      },
    }),
    {
      name: "yapply-theme",
      partialize: (state) => ({ theme: state.theme }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<ThemeState> | undefined;
        return {
          ...current,
          theme: isTheme(saved?.theme) ? saved.theme : current.theme,
        };
      },
    },
  ),
);
