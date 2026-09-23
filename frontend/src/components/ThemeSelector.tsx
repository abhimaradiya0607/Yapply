import { useState, type MouseEvent } from "react";
import { Check, ChevronDown, Palette } from "lucide-react";

import { DEFAULT_THEME, THEMES, type Theme } from "../constants/themes";
import { useThemeStore } from "../store/useThemeStore";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

const ColorDots = ({ colors }: { colors: readonly string[] }) => (
  <span className="flex items-center gap-1" aria-hidden="true">
    {colors.map((color, index) => (
      <span
        key={`${color}-${index}`}
        className="size-2.5 rounded-full border border-black/10"
        style={{ backgroundColor: color }}
      />
    ))}
  </span>
);

const ThemeSelector = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme =
    THEMES.find((option) => option.name === theme) ??
    THEMES.find((option) => option.name === DEFAULT_THEME) ??
    THEMES[0];

  const selectTheme = (nextTheme: Theme, event: MouseEvent<HTMLButtonElement>) => {
    setIsOpen(false);
    if (nextTheme === theme) return;

    const rect = event.currentTarget.getBoundingClientRect();
    document.documentElement.style.setProperty(
      "--theme-x",
      `${rect.left + rect.width / 2}px`,
    );
    document.documentElement.style.setProperty(
      "--theme-y",
      `${rect.top + rect.height / 2}px`,
    );

    const viewTransitionDocument = document as ViewTransitionDocument;

    if (!viewTransitionDocument.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    try {
      viewTransitionDocument.startViewTransition(() => {
        setTheme(nextTheme);
      });
    } catch {
      setTheme(nextTheme);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Select theme"
        aria-expanded={isOpen}
        className="flex h-10 items-center gap-2 rounded-lg px-2 text-base-content/70 transition-colors hover:bg-base-content/10 hover:text-base-content sm:px-3"
      >
        <Palette className="size-5 shrink-0" aria-hidden="true" />
        <span className="hidden text-sm font-medium md:inline">{currentTheme.label}</span>
        <span className="hidden lg:flex">
          <ColorDots colors={currentTheme.colors} />
        </span>
        <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="theme-menu absolute right-0 top-full z-50 mt-2 max-h-[min(420px,calc(100vh-5rem))] w-64 overflow-y-auto rounded-xl border border-base-content/10 bg-base-100 p-1.5 text-base-content shadow-xl sm:w-72">
            {THEMES.map((option) => {
              const isActive = option.name === theme;

              return (
                <button
                  key={option.name}
                  type="button"
                  onClick={(event) => selectTheme(option.name, event)}
                  className={[
                    "flex h-11 w-full items-center justify-between gap-3 rounded-lg px-3 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-base-content/80 hover:bg-base-content/10 hover:text-base-content",
                  ].join(" ")}
                >
                  <span className="truncate font-medium">{option.label}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <ColorDots colors={option.colors} />
                    {isActive && (
                      <Check className="size-4" aria-hidden="true" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector;
