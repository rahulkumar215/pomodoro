import type { ReactNode } from "react";
import { TaskContext } from "./TaskContext";
import {
  tasksResponseSchema,
  type CreateTaskInput,
  type TasksResponse,
  type UpdateTaskInput,
} from "@/schemas/task";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import z from "zod";
import { toast } from "sonner";

function TaskContextProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<TasksResponse[]> => {
      console.log("fetcing tasks");
      const response = await api.get("/tasks");
      return z.array(tasksResponseSchema).parse(response.data.tasks);
    },
  });

  const create = useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const response = await api.post("/tasks", data);
      return response;
    },
    onSuccess: async () => {
      console.log("invalidating query");
      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  const update = useMutation({
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
      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  const delTask = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.delete(`/tasks/${taskId}`);
      return response;
    },
    onSuccess: async () => {
      toast.success("Successfully deleted task.");
      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  return (
    <TaskContext
      value={{
        tasks,
        createTask: (data: CreateTaskInput) => create.mutate(data),
        patchTask: ({
          id,
          changes,
        }: {
          id: string;
          changes: Partial<UpdateTaskInput>;
        }) => update.mutate({ id, changes }),
        deleteTask: (taskId: string) => delTask.mutate(taskId),
      }}
    >
      {children}
    </TaskContext>
  );
}

export default TaskContextProvider;
