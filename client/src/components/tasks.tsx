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
import {
  HIDDEN_FIELDS,
  TASK_CONSTRAINTS,
  taskSchema,
  type Task,
} from "@/consts/consts";
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
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemTitle,
} from "./ui/item";
import { cx } from "class-variance-authority";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { useSettings } from "@/context/SettingsContext";

const ItemComp = ({ task, index }: { task: Task; index: number }) => {
  const {
    createdAt,
    order,
    title,
    description,
    estimatedPomodoros,
    completedPomodoros,
    isComplete,
    note,
  } = task;
  const [element, setElement] = useState<Element | null>(null);
  useSortable({ id: createdAt || "", index, element });

  return (
    <Item ref={setElement} key={createdAt} variant="outline">
      <ItemActions>
        <Button variant="ghost" className="rounded-full">
          <CircleCheckBigIcon />
        </Button>
      </ItemActions>
      <ItemContent>
        <ItemTitle className={cx("flex-1", isComplete && "line-through")}>
          {title}
        </ItemTitle>

        {description && <ItemDescription>{description}</ItemDescription>}
      </ItemContent>
      <ItemActions>
        <span>
          {completedPomodoros}/{estimatedPomodoros}
        </span>
        <Button variant="ghost" className="py-1 px-2 h-fit">
          <EllipsisVerticalIcon />
        </Button>
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
  const [tasks, setTasks] = useState<Task[]>([
    {
      title: "This is for console log 1.",
      description: "",
      estimatedPomodoros: 5,
      completedPomodoros: 0,
      isComplete: false,
      order: 1,
      projectId: null,
      note: "",
      createdAt: "Mon Jun 01 2026 22:20:42 GMT+0530 (India Standard Time)",
    }
  ]);
  const { settings } = useSettings();
  const totalEstimatedPomodoros = tasks.reduce((acc, cur) => {
    return acc + cur.estimatedPomodoros;
  }, 0);
  const totalCompletedPomodoros = tasks.reduce((acc, cur) => {
    return acc + cur.completedPomodoros;
  }, 0);

  const getCompletionTime = () => {
    const pomodoroLeft = totalEstimatedPomodoros - totalCompletedPomodoros;
    const longBreakCount = (pomodoroLeft - 1) / settings.long_break_interval;
    const shortBreakCount = pomodoroLeft - 1 - longBreakCount;

    const longBreakMins = longBreakCount * settings.long_break_time;
    const shortBreakMins = shortBreakCount * settings.short_break_time;
    const pomodoroMins = pomodoroLeft * settings.pomodoro_time;

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
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      estimatedPomodoros: 1,
    },
  });

  const [task_note, task_description] = useWatch({
    control: form.control,
    name: ["note", "description"],
  });

  function onSubmit(data: Task) {
    console.log(data);
    toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    });
    setTasks((prev) => [...prev, data]);
    setOpen(false);
    setAddNotes(false);
    form.reset();

    setTimeout(() => {
      setOpen(true);
    }, 500);
  }

  function onError(errors: typeof form.formState.errors) {
    console.log(errors);
    HIDDEN_FIELDS.forEach((field) => {
      if (errors[field]) {
        toast.error(errors[field].message);
      }
    });
  }

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
        {tasks.length > 0 && (
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
                    setTasks(newTasks);
                  }
                }
              }}
            >
              <ItemGroup>
                {tasks.map((task: Task, index) => (
                  <ItemComp key={task.createdAt} task={task} index={index} />
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
            <form onSubmit={form.handleSubmit(onSubmit, onError)}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CirclePlusIcon />
                  Add Task
                </DialogTitle>
                <DialogDescription>
                  Pomodoro is more fun with tasks to track
                </DialogDescription>
              </DialogHeader>
              <div className="-mx-4 no-scrollbar max-h-[70vh] overflow-y-auto px-4 pb-4">
                <FieldGroup>
                  <Controller
                    name="title"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="title">Title</FieldLabel>
                        <Input
                          {...field}
                          id="title"
                          placeholder="What are you working on?"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="description">
                          Description
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupTextarea
                            {...field}
                            id="description"
                            aria-invalid={fieldState.invalid}
                            placeholder="A little bit more info..."
                          />
                          <InputGroupAddon align="block-end">
                            <InputGroupText className="text-xs text-muted-foreground">
                              {renderTextLeft(
                                TASK_CONSTRAINTS.description.max,
                                task_description?.length || 0,
                              )}
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                    )}
                  />

                  <Controller
                    name="estimatedPomodoros"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="w-48">
                        <FieldLabel htmlFor="estimatedPomodoros">
                          Est Pomodoros
                        </FieldLabel>
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
