import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TaskContext } from "./TaskContext";
import { type TasksResponse } from "@/schemas/tasks";
import { useFetchTasks } from "@/hooks/useTasksAPI";

function TaskContextProvider({ children }: { children: ReactNode }) {
  const [activeTask, setActiveTask] = useState<TasksResponse | null>(null);
  const isDragging = useRef(false);
  const { data: fetchedTasks } = useFetchTasks();
  const [tasks, setTasks] = useState<TasksResponse[]>(fetchedTasks ?? []);

  useEffect(() => {
    if (fetchedTasks && !isDragging.current) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  const setDragging = (val: boolean) => {
    isDragging.current = val;
  };

  const values = useMemo(
    () => ({
      tasks: tasks.sort((a, b) => a.order - b.order),
      setTasks,
      setDragging,
      activeTask,
      setActiveTask,
    }),
    [tasks, setTasks, activeTask, setActiveTask],
  );

  return <TaskContext value={values}>{children}</TaskContext>;
}

export default TaskContextProvider;
