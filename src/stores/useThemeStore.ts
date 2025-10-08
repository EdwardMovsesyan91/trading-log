import { create } from "zustand";

type Mode = "light" | "dark";

const initial = (() => {
  const saved = localStorage.getItem("ui-mode");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
})();

interface ThemeState {
  mode: Mode;
  toggle: () => void;
  set: (m: Mode) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initial,
  toggle: () => {
    const next = get().mode === "light" ? "dark" : "light";
    localStorage.setItem("ui-mode", next);
    set({ mode: next });
  },
  set: (m) => {
    localStorage.setItem("ui-mode", m);
    set({ mode: m });
  },
}));
