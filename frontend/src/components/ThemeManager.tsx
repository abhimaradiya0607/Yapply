import { useEffect } from "react";

import { applyDocumentTheme, useThemeStore } from "../store/useThemeStore";

const ThemeManager = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    applyDocumentTheme(theme);
  }, [theme]);

  return null;
};

export default ThemeManager;
