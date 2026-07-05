import z from "zod";

export const TASK_CONSTRAINTS = {
  name: { min: 1, max: 120 },
  estimatedPomodoros: { min: 1 },
  note: { max: 120 },
} as const;

// Tasks Schema
const taskShape = {
  name: z
    .string()
    .min(TASK_CONSTRAINTS.name.min, "Name is required.")
    .max(TASK_CONSTRAINTS.name.max, "Name max length reached."),
  estimatedPomodoros: z.coerce
    .number()
    .min(
      TASK_CONSTRAINTS.estimatedPomodoros.min,
      "At least 1 pomodoro is required.",
    ),
  isComplete: z.boolean(),
  order: z.coerce.number(),
  projectId: z.string().nullable(),
  note: z
    .string()
    .max(TASK_CONSTRAINTS.note.max, "Notes maximum length reached."),
};
export const createTaskSchema = z.object({
  name: taskShape.name,
  estimatedPomodoros: taskShape.estimatedPomodoros.default(1),
  isComplete: taskShape.isComplete.default(false),
  order: taskShape.order.default(0).optional(),
  projectId: taskShape.projectId.default(null).optional(),
  note: taskShape.note.default("").optional(),
});

export const updateTaskSchema = z
  .object(taskShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update.",
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
