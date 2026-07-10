import z from "zod";
import { tasksResponseSchema } from "./tasks";

const sessionShape = {
  type: z.enum(["pomodoro", "short_break", "long_break"]),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
  minutes: z.coerce.number<number>(),
  taskId: z.string().nullable(),
};

export const createSessionSchema = z.object({
  ...sessionShape,
  taskId: sessionShape.taskId.default(null),
});

export const updateSessionSchema = z
  .object(sessionShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update.",
  });

export const sessionResponseSchema = z.object(sessionShape).extend({
  id: z.uuid(),
  task: tasksResponseSchema.nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const sessionsListResponseSchema = z.object({
  results: z.number(),
  daysAccessed: z.number(),
  streakDays: z.number(),
  hoursFocused: z.number(),
  totalCount: z.number(),
  data: z.object({
    sessions: z.array(sessionResponseSchema),
  }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionsResponse = z.infer<typeof sessionResponseSchema>;
export type SessionsListResponse = z.infer<typeof sessionsListResponseSchema>;
