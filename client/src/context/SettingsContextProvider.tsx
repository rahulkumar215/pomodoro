import { useState, type ReactNode } from "react";
import { SettingsContext } from "./SettingsContext";
import { DEFAULT_SETTINGS, type Settings } from "@/consts/consts";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { handleError } from "@/lib/handleError";

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const prevSettings = localStorage.getItem("settings");
  const [settings, setSettings] = useState<Settings>(
    prevSettings ? JSON.parse(prevSettings) : DEFAULT_SETTINGS,
  );

  const mutate = useMutation({
    mutationFn: async (data: Settings): Promise<Settings> => {
      const response = await api.patch("/settings", data);
      return response.data.settings;
    },
    onSuccess: (data) => {
      setSettings(data);
      localStorage.setItem("settings", JSON.stringify(data));
    },
    onError: (error) => {
      console.log(error);
      handleError(error);
    },
  });

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
