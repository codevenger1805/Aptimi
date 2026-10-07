import { useEffect } from "react";
import { AppRoutes } from "./routes";
import { useAppStore } from "../store/appStore";
import { applyTheme, readStoredTheme } from "../store/theme";

export function App() {
  const load = useAppStore((s) => s.load);
  const settings = useAppStore((s) => s.settings);

  useEffect(() => {
    applyTheme(readStoredTheme());
    void load();
  }, [load]);

  useEffect(() => {
    if (settings?.theme) applyTheme(settings.theme);
  }, [settings?.theme]);

  return <AppRoutes />;
}
