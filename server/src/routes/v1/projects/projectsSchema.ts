import z from "zod";

// Colors Object
export const colors = {
  brickRed: "#af4949",
  tealGreen: "#297479",
  steelBlue: "#2f6a95",
  burntOrange: "#a6622a",
  mutedPurple: "#6c4d89",
  orchidPink: "#9f4387",
  forestGreen: "#4a7950",
  slateBlue: "#4a6879",
} as const;

export type ColorKey = keyof typeof colors;
export const COLOR_KEYS = Object.keys(colors) as [ColorKey, ...ColorKey[]];
export type ColorValue = (typeof colors)[ColorKey];

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
