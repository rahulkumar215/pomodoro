import { COLOR_KEYS } from "@/consts/consts";
import z from "zod";

const projectShape = {
  name: z.string("Name is required").max(30, "Name max length reached."),
  color: z.enum(COLOR_KEYS, "Color is required."),
};

export const createProjectSchema = z.object(projectShape);
export const updateProjectSchema = z
  .object(projectShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update.",
  });

export const projectsResponseSchema = z.object(projectShape).extend({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectsResponses = z.infer<typeof projectsResponseSchema>;
