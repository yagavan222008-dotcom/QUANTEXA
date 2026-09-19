"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined
  );

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>("light");

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("quantexa-theme") as
        | Theme
        | null;

    const initialTheme =
      savedTheme === "dark" ? "dark" : "light";

    setThemeState(initialTheme);

    document.documentElement.dataset.theme =
      initialTheme;
  }, []);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);

    localStorage.setItem(
      "quantexa-theme",
      nextTheme
    );

    document.documentElement.dataset.theme =
      nextTheme;
  }

  function toggleTheme() {
    setTheme(
      theme === "light" ? "dark" : "light"
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}