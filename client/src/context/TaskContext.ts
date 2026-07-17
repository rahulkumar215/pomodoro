import { type TasksResponse } from "@/schemas/tasks";
import { createContext, useContext } from "react";

export type TasksContextType = {
  tasks: TasksResponse[];
  setDragging: (val: boolean) => void;
  setTasks: (tasks: TasksResponse[]) => void;
  activeTask: TasksResponse | null;
  setActiveTask: (task: TasksResponse | null) => void;
};

export const TaskContext = createContext<TasksContextType | null>(null);

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTask must be used inside TaskContextProvider");
  }
  return ctx;
};
