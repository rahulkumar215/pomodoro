import { useState, type ReactNode } from "react";
import { SettingsContext } from "./SettingsContext";
import { DEFAULT_SETTINGS, type Settings } from "@/consts/consts";

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const prevSettings = localStorage.getItem("settings");
  const [settings, setSettings] = useState<Settings>(
    prevSettings ? JSON.parse(prevSettings) : DEFAULT_SETTINGS,
  );

  function handleSaveSettings(settings: Settings) {
    setSettings(settings);
    localStorage.setItem("settings", JSON.stringify(settings));
  }

  return (
    <SettingsContext
      value={{
        settings,
        updateSettings: handleSaveSettings,
      }}
    >
      {children}
    </SettingsContext>
  );
}
