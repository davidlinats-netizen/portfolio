"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });
function subscribe(callback: () => void) {
  window.addEventListener("themechange", callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener("themechange", callback); window.removeEventListener("storage", callback); };
}
function snapshot(): Theme { return document.documentElement.dataset.theme === "light" ? "light" : "dark"; }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "dark" as Theme);
  function toggle() {
    const next = snapshot() === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("daviid-theme", next); } catch { /* Private browsing still supports the toggle. */ }
      window.dispatchEvent(new Event("themechange"));
    };
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) document.startViewTransition(apply);
    else apply();
  }
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
