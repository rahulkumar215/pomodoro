import type { User } from "@/context/AuthContext";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useFetchUser = () => {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<User> => {
      const response = await api.get("/auth/me");
      return response.data.data.user;
    },
    enabled: !!token,
  });
};
