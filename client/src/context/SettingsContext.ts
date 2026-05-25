import { type Settings } from "@/consts/consts";
import { createContext, useContext } from "react";

export type SettingsContextType = {
  settings: Settings;
  updateSettings: (next: Settings) => void;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used inside SettingsContextProvider");
  return ctx;
};
