import z from "zod";

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
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionsResponse = z.infer<typeof sessionResponseSchema>;
