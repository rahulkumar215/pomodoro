import api from "@/lib/api";
import {
  tasksResponseSchema,
  type CreateTaskInput,
  type TasksResponse,
  type UpdateTaskInput,
} from "@/schemas/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

export const useFetchTasks = () => {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<TasksResponse[]> => {
      const response = await api.get("/tasks");
      return z.array(tasksResponseSchema).parse(response.data.data.tasks);
    },
    enabled: !!token,
  });
};

export const useCreateTask = () => {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const response = await api.post("/tasks", data);
      return tasksResponseSchema.parse(response.data.data.task);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  return create.mutate;
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  const patch = useMutation({
    mutationFn: async ({
      id,
      changes,
    }: {
      id: string;
      changes: Partial<UpdateTaskInput>;
    }) => {
      const response = await api.patch(`/tasks/${id}`, changes);
      return response;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  return patch.mutate;
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.delete(`/tasks/${taskId}`);
      return response;
    },
    onSuccess: async () => {
      toast.success("Successfully deleted task.");
      await qc.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  return deleteTask.mutate;
};
