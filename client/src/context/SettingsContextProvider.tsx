import { useState, type ReactNode } from "react";
import { DEFAULT_SETTINGS } from "@/consts/consts";
import { type Settings } from "@/consts/consts";
import { SettingsContext } from "./SettingsContext";
import { useUpdateSettings } from "@/hooks/useSettingsAPI";

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [settings] = useState<Settings>(() => {
    const saved = localStorage.getItem("settings");
    return saved !== null ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const mutate = useUpdateSettings();

  function handleSaveSettings(settings: Settings) {
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
