'use client';

import React, { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'app_theme';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

function readThemeFromDocument(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

// The store is the <html> element itself: app/layout.tsx paints the saved theme
// before hydration, and every consumer reads the same source of truth.
let currentTheme: Theme = 'light';
const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;

function syncThemeColor(t: Theme) {
  if (typeof document === 'undefined') return;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'dark' ? '#0d1117' : '#0f62c9');
}

function publish() {
  const next = readThemeFromDocument();
  if (next === currentTheme) return;
  currentTheme = next;
  syncThemeColor(next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!observer) {
    observer = new MutationObserver(publish);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
  }
  publish();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && observer) {
      observer.disconnect();
      observer = null;
    }
  };
}

const getSnapshot = () => currentTheme;
// Server markup is always rendered as light (see app/layout.tsx), so hydration
// matches and the real theme is applied right after.
const getServerSnapshot = () => 'light' as const;

function applyThemeToDocument(t: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove(t === 'dark' ? 'light' : 'dark');
  root.classList.add(t);
  root.setAttribute('data-theme', t);
  root.style.colorScheme = t;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {}
    applyThemeToDocument(newTheme);
    publish();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readThemeFromDocument() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
