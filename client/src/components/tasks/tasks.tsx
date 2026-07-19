import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { Button } from "../ui/button";
import {
 
  FolderCodeIcon,
  PlusCircleIcon,
} from "lucide-react";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HIDDEN_FIELDS } from "@/consts/consts";
import { useState } from "react";

import { toast } from "sonner";
import { ItemGroup } from "../ui/item";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useSettings } from "@/context/SettingsContext";
import {
  createTaskSchema,
  type CreateTaskInput,
  type TasksResponse,
} from "@/schemas/tasks";
import { useTasks } from "@/context/TaskContext";

import { useProjects } from "@/hooks/useProjects";
import { buildDiff } from "@/lib/utils";
import TaskItemComp from "./task-item";
import TaskForm from "./task-form";
import { useAuth } from "@/context/AuthContext";
import { usePlanDialog } from "@/context/PlamDialogContext";
import {
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
} from "@/hooks/useTasksAPI";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

const Tasks = () => {
  const [addNotes, setAddNotes] = useState(false);
  const [addProject, setAddProject] = useState(false);
  const [open, setOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [originalTask, setOriginalTask] = useState<TasksResponse | null>(null);
  const { user, isPremium } = useAuth();
  const { setOpenPlanDialog } = usePlanDialog();

  const { settings } = useSettings();
  const { tasks, setTasks, setDragging, activeTask, setActiveTask } =
    useTasks();

  const createTask = useCreateTask();
  const patchTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: projects = [] } = useProjects();

  const totalEstimatedPomodoros = tasks
    ? tasks
        .filter((task) => task.isComplete === false)
        .reduce((acc, cur) => {
          return acc + cur.estimatedPomodoros;
        }, 0)
    : 0;

  const totalCompletedPomodoros = tasks
    ? tasks
        .filter((task) => task.isComplete === false)
        .reduce((acc, cur) => {
          return acc + cur.completedPomodoros;
        }, 0)
    : 0;

  const getCompletionTime = () => {
    const pomodoroLeft = totalEstimatedPomodoros - totalCompletedPomodoros;
    const longBreakCount =
      pomodoroLeft === 0
        ? 0
        : (pomodoroLeft - 1) / settings.long_break_interval;
    const shortBreakCount =
      pomodoroLeft === 0 ? 0 : pomodoroLeft - 1 - longBreakCount;

    const longBreakMins = longBreakCount * settings.long_break_duration;
    const shortBreakMins = shortBreakCount * settings.short_break_duration;
    const pomodoroMins = pomodoroLeft * settings.pomodoro_duration;

    const totalTime = pomodoroMins + shortBreakMins + longBreakMins;

    const now = new Date().getTime();

    return `${new Date(now + totalTime * 60 * 1000).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: settings.hour_format === "h12",
      },
    )} (${(totalTime / 60).toFixed(1)}h)`;
  };

  const time = getCompletionTime();

  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: "",
      estimatedPomodoros: 1,
    },
  });

  const [task_note] = useWatch({
    control: form.control,
    name: ["note"],
  });

  function onSubmit(data: CreateTaskInput) {
    createTask(data);
    setOpen(false);
    setAddNotes(false);
    form.reset();
  }

  function onError(errors: typeof form.formState.errors) {
    console.log(errors);
    HIDDEN_FIELDS.forEach((field) => {
      if (errors[field]) {
        toast.error(errors[field].message);
      }
    });
  }

  const handleEditTask = (taskId: string) => {
    const task = tasks?.find((task) => task.id === taskId);
    if (!task) {
      toast.error("Not task found");
      return;
    }

    setEditTaskId(taskId);
    setOriginalTask(task);
    setOpen(true);
    if (task.note) {
      setAddNotes(true);
    }
    if (task.projectId) {
      setAddProject(true);
    }
    form.setValues({ ...task });
  };

  const onEdit = (formState: CreateTaskInput) => {
    if (originalTask === null) {
      toast.error("No task present.");
      return;
    }

    const changes = buildDiff(originalTask, formState);

    if (Object.keys(changes).length === 0) {
      console.log("No changes made, not calling backend");
      setOpen(false);
      setAddNotes(false);
      setAddProject(false);
      form.reset();

      return;
    }

    patchTask({ id: originalTask.id, changes });
    toast.success("Successfully updated task.");
    setOpen(false);
    setAddNotes(false);
    setAddProject(false);
    form.reset();
  };

  const handleAddProject = () => {
    if (!isPremium) {
      alert("This feature is limited to premium users only.");
      setOpenPlanDialog(true);
      return;
    }
    setAddProject(true);
  };

  const handleAddTask = () => {
    if (!user) {
      alert("Please signin to create a task.");
      return;
    }
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {tasks && tasks.length > 0 ? (
          <>
            <DragDropProvider
              onDragStart={() => {
                setDragging(true);
              }}
              onDragEnd={(event) => {
                setDragging(false);

                if (event.canceled) {
                  setTasks(tasks ?? []);
                  return;
                }

                const { source } = event.operation;

                if (isSortable(source)) {
                  console.log(source);
                  const { initialIndex, index } = source;
                  console.log(initialIndex, index);

                  if (initialIndex !== index) {
                    const newTasks = [...tasks];
                    const [removed] = newTasks.splice(initialIndex, 1);
                    newTasks.splice(index, 0, removed);
                    setTasks(newTasks);

                    const prevTask = newTasks[index - 1];
                    const nextTask = newTasks[index + 1];

                    let newOrder: number;
                    if (!prevTask && !nextTask) {
                      newOrder = 1000;
                    } else if (!prevTask) {
                      newOrder = nextTask.order / 2;
                    } else if (!nextTask) {
                      newOrder = prevTask.order + 1000;
                    } else {
                      newOrder = (prevTask.order + nextTask.order) / 2;
                    }

                    patchTask({
                      id: removed.id,
                      changes: {
                        order: newOrder,
                      },
                    });
                  }
                }
              }}
            >
              <ItemGroup>
                {tasks.map((task: TasksResponse, index) => (
                  <TaskItemComp
                    key={task.id}
                    index={index}
                    task={task}
                    onEditTask={handleEditTask}
                    onDeleteTask={(taskId) => {
                      if (activeTask !== null && activeTask.id === taskId)
                        setActiveTask(null);
                      deleteTask(taskId);
                    }}
                    onPatchTask={(taskId, changes) =>
                      patchTask({ id: taskId, changes })
                    }
                    onClick={setActiveTask}
                  />
                ))}
              </ItemGroup>
            </DragDropProvider>

            <div className="my-4 border p-2 rounded-md grid grid-cols-2 gap-2 items-center justify-center">
              <div>
                <p>
                  Pomos: {totalCompletedPomodoros}/{totalEstimatedPomodoros}
                </p>
              </div>
              <div>
                <p>Finish At: {time}</p>
              </div>
            </div>
          </>
        ) : (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderCodeIcon />
              </EmptyMedia>
              <EmptyTitle>No Task Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any task yet. Get started by creating
                your first task.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button onClick={handleAddTask}>
                <PlusCircleIcon />
                Create Task
              </Button>
            </EmptyContent>
          </Empty>
        )}

        <TaskForm
          tasks={tasks}
          open={open}
          setOpen={setOpen}
          form={form}
          editTaskId={editTaskId}
          onEdit={onEdit}
          onSubmit={onSubmit}
          onError={onError}
          addNotes={addNotes}
          setAddNotes={setAddNotes}
          addProject={addProject}
          setAddProject={setAddProject}
          projects={projects}
          task_note={task_note}
          isPremium={isPremium}
          handleAddProject={handleAddProject}
          handleAddTask={handleAddTask}
        />
      </CardContent>
    </Card>
  );
};

export default Tasks;
