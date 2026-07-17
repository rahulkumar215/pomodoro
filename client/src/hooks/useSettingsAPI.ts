import type { Settings } from "@/consts/consts";
import api from "@/lib/api";
import { handleError } from "@/lib/handleError";
import { useMutation } from "@tanstack/react-query";

export const useUpdateSettings = () => {
  return useMutation({
    mutationFn: async (data: Settings): Promise<Settings> => {
      const response = await api.patch("/settings", data);
      return response.data.data.settings;
    },
    onSuccess: (data) => {
      localStorage.setItem("settings", JSON.stringify(data));
    },
    onError: (error) => {
      handleError(error);
    },
    onSettled: () => {
      window.location.reload();
    },
  });
};
