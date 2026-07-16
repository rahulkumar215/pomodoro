import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CirclePlusIcon,
  EditIcon,
  LockIcon,
  PlusIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "../ui/input-group";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { renderTextLeft } from "@/lib/renderTextLeft";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Controller } from "react-hook-form";
import { colors, TASK_CONSTRAINTS } from "@/consts/consts";
import { cx } from "class-variance-authority";

function TaskForm({
  open,
  setOpen,
  form,
  editTaskId,
  onEdit,
  onSubmit,
  onError,
  addNotes,
  setAddNotes,
  addProject,
  setAddProject,
  projects,
  task_note,
  isPremium,
  handleAddProject,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          form.reset();
          setAddNotes(false);
          setAddProject(false);
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
          onSubmit={form.handleSubmit(editTaskId ? onEdit : onSubmit, onError)}
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

              <div
                className={cx(
                  "flex items-center gap-2",
                  (addProject || addNotes) && "flex-col items-start",
                )}
              >
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

                {addProject ? (
                  <Controller
                    name="projectId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="note">Add Project</FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value?.toString()}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value="null">No Project</SelectItem>
                            <SelectSeparator />
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                <span
                                  className="size-6 rounded-full"
                                  style={{
                                    background: colors[project.color],
                                  }}
                                ></span>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    onClick={handleAddProject}
                  >
                    <PlusIcon /> Add Project {!isPremium && <LockIcon />}
                  </Button>
                )}
              </div>
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
  );
}

export default TaskForm;
