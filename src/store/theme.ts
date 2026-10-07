const KEY = "aptimi-theme";

export function applyTheme(theme: "system" | "light" | "dark") {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  root.dataset.theme = dark ? "dark" : "light";
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore quota */
  }
}

export function readStoredTheme(): "system" | "light" | "dark" {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
}
