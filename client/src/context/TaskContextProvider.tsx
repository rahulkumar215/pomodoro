import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TaskContext } from "./TaskContext";
import {
  tasksResponseSchema,
  type CreateTaskInput,
  type TasksResponse,
  type UpdateTaskInput,
} from "@/schemas/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import z from "zod";
import { toast } from "sonner";

function TaskContextProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<TasksResponse | null>(null);
  const isDragging = useRef(false);

  const { data: fetchedTasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<TasksResponse[]> => {
      const response = await api.get("/tasks");
      return z.array(tasksResponseSchema).parse(response.data.tasks);
    },
  });

  const [tasks, setTasks] = useState<TasksResponse[]>(fetchedTasks ?? []);

  // useEffect(() => {
  //   if (fetchedTasks && !isDragging.current) {
  //     setTasks(fetchedTasks);
  //   }
  // }, [fetchedTasks]);

  const setDragging = (val: boolean) => {
    isDragging.current = val;
  };

  const create = useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const response = await api.post("/tasks", data);
      return tasksResponseSchema.parse(response.data.data.task);
    },
    onSuccess: async () => {
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

  const values = useMemo(
    () => ({
      tasks: tasks.sort((a, b) => a.order - b.order),
      setTasks,
      setDragging,
      createTask: create.mutate,
      patchTask: update.mutate,
      deleteTask: delTask.mutate,
      activeTask,
      setActiveTask,
    }),
    [
      tasks,
      setTasks,
      create.mutate,
      update.mutate,
      delTask.mutate,
      activeTask,
      setActiveTask,
    ],
  );

  return <TaskContext value={values}>{children}</TaskContext>;
}

export default TaskContextProvider;
