import api from "@/lib/api";
import type {
  CreateSessionInput,
  SessionsListResponse,
} from "@/schemas/sessions";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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

const addSession = async (data: CreateSessionInput) => {
  return await api.post("/sessions", data);
};

export const useCreateSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addSession,
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["sessions"],
      });
    },
  });
};
