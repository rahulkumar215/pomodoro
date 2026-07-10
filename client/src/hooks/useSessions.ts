import api from "@/lib/api";
import type { SessionsListResponse } from "@/schemas/sessions";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useSessions = (pagination: any) => {
  return useQuery({
    queryKey: ["sessions", pagination],
    queryFn: async (): Promise<SessionsListResponse> => {
      const response = await api.get(
        `/sessions?page=${pagination.pageIndex}&take=${pagination.pageSize}`,
      );
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};
