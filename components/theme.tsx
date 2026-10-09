"use client";

import { useI18n } from "@/lib/i18n";
import { Moon, Sun } from "lucide-react";
import { useLayoutEffect } from "react";

export const THEME_KEY = "daodao-theme";

export function resolveTheme(): "light" | "dark" {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeBoot() {
  useLayoutEffect(() => {
    applyTheme(resolveTheme());
  }, []);
  return null;
}

export function ThemeToggle() {
  const { t } = useI18n();

  function toggle() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode can block storage; the class still switches for this visit */
    }
    window.dispatchEvent(new Event("daodao-theme"));
  }

  return (
    <button
      type="button"
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-card text-primary shadow-sm"
      aria-label={t.themeToggle}
      data-testid="theme-toggle"
      onClick={toggle}
    >
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </button>
  );
}
