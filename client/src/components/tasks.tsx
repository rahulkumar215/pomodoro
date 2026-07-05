import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleCheckBigIcon,
  CirclePlusIcon,
  EditIcon,
  EllipsisVerticalIcon,
  EyeOffIcon,
  FilesIcon,
  LockIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HIDDEN_FIELDS, TASK_CONSTRAINTS } from "@/consts/consts";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "./ui/input-group";
import { toast } from "sonner";
import { renderTextLeft } from "@/lib/renderTextLeft";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemFooter,
  ItemGroup,
  ItemTitle,
} from "./ui/item";
import { cx } from "class-variance-authority";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { useSettings } from "@/context/SettingsContext";
import { Label } from "./ui/label";
import {
  createTaskSchema,
  type CreateTaskInput,
  type TasksResponse,
  type UpdateTaskInput,
} from "@/schemas/task";
import { useTasks } from "@/context/TaskContext";

function buildDiff<T extends Record<string, unknown>>(
  original: T,
  edited: T,
): Partial<T> {
  const diff: Partial<T> = {};
  for (const key in edited) {
    if (edited[key] !== original[key]) {
      diff[key] = edited[key];
    }
  }
  return diff;
}

const ItemComp = ({
  task,
  onEditTask,
  onDeleteTask,
  onPatchTask,
}: {
  task: TasksResponse;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onPatchTask: (taskId: string, changes: Partial<UpdateTaskInput>) => void;
}) => {
  const {
    id,
    order,
    name,
    estimatedPomodoros,
    completedPomodoros,
    isComplete,
    note,
  } = task;
  const [element, setElement] = useState<Element | null>(null);
  useSortable({ id, index: order || 0, element });

  return (
    <Item ref={setElement} key={id} variant="outline">
      <ItemActions>
        <Button
          onClick={() =>
            onPatchTask(task.id, {
              isComplete: !isComplete,
            })
          }
          variant={isComplete ? "default" : "ghost"}
          className="rounded-full"
        >
          <CircleCheckBigIcon />
        </Button>
      </ItemActions>
      <ItemContent>
        <ItemTitle className={cx("flex-1", isComplete && "line-through")}>
          {name}
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <span>
          {completedPomodoros}/{estimatedPomodoros}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="py-1 px-2 h-fit">
              <EllipsisVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="flex gap-1 min-w-fit ">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Button variant="outline" onClick={() => onEditTask(task.id)}>
                <EditIcon />
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer"
              variant="destructive"
            >
              <Button
                variant="destructive"
                onClick={() => onDeleteTask(task.id)}
              >
                <Trash2Icon />
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
      {note && (
        <ItemFooter className="text-left p-2  border rounded-md bg-yellow-300 text-black">
          {note}
        </ItemFooter>
      )}
    </Item>
  );
};

const Tasks = () => {
  const [addNotes, setAddNotes] = useState(false);
  const [open, setOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [originalTask, setOriginalTask] = useState<TasksResponse | null>(null);

  const { settings } = useSettings();
  const { tasks, createTask, patchTask, deleteTask } = useTasks();

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
        hour12: true,
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
      form.reset();

      return;
    }

    patchTask({ id: originalTask.id, changes });
    toast.success("Successfully updated task.");
    setOpen(false);
    setAddNotes(false);
    form.reset();
  };

  return (
    <Card className="w-md">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Tasks</CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit">
              <DropdownMenuItem asChild>
                <Button>
                  <Trash2Icon />
                  Clear Finished Tasks
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FilesIcon />
                Use Template
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckIcon />
                Clear act pomodoros
              </DropdownMenuItem>
              <DropdownMenuItem>
                <EyeOffIcon />
                Hide Tasks
                <LockIcon />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash2Icon />
                Clear all tasks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4">
        {tasks && tasks.length > 0 && (
          <>
            <DragDropProvider
              onDragEnd={(event) => {
                if (event.canceled) return;

                const { source } = event.operation;

                if (isSortable(source)) {
                  const { initialIndex, index } = source;

                  if (initialIndex !== index) {
                    const newTasks = [...tasks];
                    const [removed] = newTasks.splice(initialIndex, 1);
                    newTasks.splice(index, 0, removed);
                    // setTasks(newTasks);
                  }
                }
              }}
            >
              <ItemGroup>
                {tasks.map((task: TasksResponse) => (
                  <ItemComp
                    key={task.id}
                    task={task}
                    onEditTask={handleEditTask}
                    onDeleteTask={(taskId) => deleteTask(taskId)}
                    onPatchTask={(taskId, changes) =>
                      patchTask({ id: taskId, changes })
                    }
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
        )}

        <Dialog
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              form.reset();
              setAddNotes(false);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-dashed h-12"
              onClick={() => setOpen(true)}
            >
              <CirclePlusIcon />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form
              onSubmit={form.handleSubmit(
                editTaskId ? onEdit : onSubmit,
                onError,
              )}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {editTaskId ? (
                    <>
                      <EditIcon /> Edit Task
                    </>
                  ) : (
                    <>
                      <CirclePlusIcon />
                      Add Task
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Pomodoro is more fun with tasks to track
                </DialogDescription>
              </DialogHeader>
              <div className="-mx-4 no-scrollbar max-h-[70vh] overflow-y-auto px-4 pb-4">
                <FieldGroup>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input
                          {...field}
                          id="name"
                          placeholder="What are you working on?"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <div className="flex flex-col gap-2">
                    <Label>
                      {editTaskId ? "Act. / Est Pomodoros" : "Est Pomodoros"}
                    </Label>
                    <div className="flex items-center gap-1">
                      {editTaskId && (
                        <>
                          <Controller
                            name="completedPomodoros"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field className="w-24">
                                <Input
                                  {...field}
                                  type="number"
                                  aria-invalid={fieldState.invalid}
                                  id="completedPomodoros"
                                  min={TASK_CONSTRAINTS.completedPomodoros.min}
                                />
                              </Field>
                            )}
                          />
                          /
                        </>
                      )}
                      <Controller
                        name="estimatedPomodoros"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field className="w-48">
                            <div className="flex items-center justify-start gap-2">
                              <Input
                                {...field}
                                type="number"
                                aria-invalid={fieldState.invalid}
                                id="estimatedPomodoros"
                                min={TASK_CONSTRAINTS.estimatedPomodoros.min}
                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() =>
                                  field.onChange(Number(field.value) + 1)
                                }
                              >
                                <ChevronUpIcon />
                              </Button>
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() =>
                                  field.onChange(Number(field.value) - 1)
                                }
                                disabled={
                                  Number(field.value) <=
                                  TASK_CONSTRAINTS.estimatedPomodoros.min
                                }
                              >
                                <ChevronDownIcon />
                              </Button>
                            </div>
                          </Field>
                        )}
                      />
                    </div>
                  </div>

                  {addNotes ? (
                    <Controller
                      name="note"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="note">Add Note</FieldLabel>
                          <InputGroup>
                            <InputGroupTextarea
                              {...field}
                              id="note"
                              placeholder="Some notes..."
                              aria-invalid={fieldState.invalid}
                            />
                            <InputGroupAddon align="block-end">
                              <InputGroupText className="text-xs text-muted-foreground">
                                {renderTextLeft(
                                  TASK_CONSTRAINTS.note.max,
                                  task_note?.length || 0,
                                )}
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  ) : (
                    <Button
                      variant="link"
                      className="w-fit p-0"
                      onClick={() => setAddNotes(true)}
                    >
                      <PlusIcon /> Add Note
                    </Button>
                  )}
                </FieldGroup>
              </div>

              <DialogFooter className="flex-col">
                <Button type="submit">Submit</Button>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default Tasks;
