import { type ReactNode } from "react";
import { DEFAULT_SETTINGS } from "@/consts/consts";
import { type Settings } from "@/consts/consts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { handleError } from "@/lib/handleError";
import { SettingsContext } from "./SettingsContext";

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  // const prevSettings = localStorage.getItem("settings");
  // const [settings, setSettings] = useState<Settings>(
  //   prevSettings ? JSON.parse(prevSettings) : DEFAULT_SETTINGS,
  // );

  const qc = useQueryClient();

  const { data: settings = DEFAULT_SETTINGS } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await api.get("/settings");
      return response.data.data.settings;
    },
  });

  const mutate = useMutation({
    mutationFn: async (data: Settings): Promise<Settings> => {
      const response = await api.patch("/settings", data);
      return response.data.settings;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["settings"],
      });
    },
    onError: (error) => {
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
