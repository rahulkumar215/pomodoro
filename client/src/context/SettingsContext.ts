import { type Settings } from "@/consts/consts";
import { createContext } from "react";

type SettingsContextType = {
  settings: Settings;
  updateSettings: (next: Settings) => void;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);
