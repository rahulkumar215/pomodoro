import {
  type CreateTaskInput,
  type TasksResponse,
  type UpdateTaskInput,
} from "@/schemas/task";
import { createContext, useContext } from "react";

export type TasksContextType = {
  tasks: TasksResponse[];
  createTask: (task: CreateTaskInput) => void;
  patchTask: ({
    id,
    changes,
  }: {
    id: string;
    changes: Partial<UpdateTaskInput>;
  }) => void;
  deleteTask: (taskId: string) => void;
};

export const TaskContext = createContext<TasksContextType | null>(null);

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTask must be used inside TaskContextProvider");
  }
  return ctx;
};
