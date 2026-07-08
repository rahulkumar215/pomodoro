import { TASK_CONSTRAINTS } from "@/consts/consts";
import z from "zod";
import { projectsResponseSchema } from "./projects";
// Tasks Schema
const taskShape = {
  name: z
    .string()
    .min(TASK_CONSTRAINTS.name.min, "Name is required.")
    .max(TASK_CONSTRAINTS.name.max, "Name max length reached."),
  estimatedPomodoros: z.coerce
    .number<number>()
    .min(
      TASK_CONSTRAINTS.estimatedPomodoros.min,
      "At least 1 pomodoro is required.",
    ),
  completedPomodoros: z.coerce
    .number<number>()
    .min(TASK_CONSTRAINTS.completedPomodoros.min),
  isComplete: z.boolean(),
  order: z.coerce.number<number>(),
  projectId: z.string().nullable(),
  note: z
    .string()
    .max(TASK_CONSTRAINTS.note.max, "Notes maximum length reached."),
};
export const createTaskSchema = z.object({
  name: taskShape.name,
  estimatedPomodoros: taskShape.estimatedPomodoros.default(1),
  completedPomodoros: taskShape.completedPomodoros.default(0),
  isComplete: taskShape.isComplete.default(false),
  order: taskShape.order.default(0),
  projectId: taskShape.projectId.default(null),
  note: taskShape.note.default(""),
});

export const updateTaskSchema = z
  .object(taskShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update.",
  });

export const tasksResponseSchema = z.object(taskShape).extend({
  id: z.uuid(),
  project: projectsResponseSchema.nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TasksResponse = z.infer<typeof tasksResponseSchema>;
