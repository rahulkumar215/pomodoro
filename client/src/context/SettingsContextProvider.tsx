import { useState, type ReactNode } from "react";
import { SettingsContext } from "./SettingsContext";
import { DEFAULT_SETTINGS, type Settings } from "@/consts/consts";

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  return (
    <SettingsContext
      value={{
        settings,
        updateSettings: setSettings,
      }}
    >
      {children}
    </SettingsContext>
  );
}
