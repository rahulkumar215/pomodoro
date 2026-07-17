import { useState, type ReactNode } from "react";
import { DEFAULT_SETTINGS } from "@/consts/consts";
import { type Settings } from "@/consts/consts";
import { SettingsContext } from "./SettingsContext";
import { useUpdateSettings } from "@/hooks/useSettingsAPI";

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("settings");
    return saved !== null ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const token = localStorage.getItem("token");

  const mutate = useUpdateSettings();

  function handleSaveSettings(settings: Settings) {
    if (!token) {
      setSettings(settings);
      localStorage.setItem("settings", JSON.stringify(settings));
      window.location.reload();
      return;
    }
    mutate.mutate(settings);
  }

  return (
    <SettingsContext
      value={{
        settings: settings,
        updateSettings: handleSaveSettings,
      }}
    >
      {children}
    </SettingsContext>
  );
}
