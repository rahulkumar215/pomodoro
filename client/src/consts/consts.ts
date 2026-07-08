import alpha from "./../assets/audios/alarm/aplha.mp3";
import honey from "./../assets/audios/alarm/honey.mp3";
import primul from "./../assets/audios/alarm/primul.mp3";
import clock from "./../assets/audios/focus/Clock.mp3";
import interstellar from "./../assets/audios/focus/interstellar.mp3";
import * as z from "zod";

// Tabs Schema
export const TABS = {
  Pomodoro: { type: "Pomodoro", timer: 25, message: "Time to Focus" },
  Short_Break: {
    type: "Short Break",
    timer: 5,
    message: "Time for Short Break",
  },
  Long_Break: {
    type: "Long Break",
    timer: 15,
    message: "Time for Long Break",
  },
} as const;

// Exporting Tab Schema
export type Tab = (typeof TABS)[keyof typeof TABS];

// Sounds Schema
export const Sounds = {
  alarm: {
    alpha: {
      key: "Alpha",
      sound: alpha,
    },
    honey: {
      key: "Honey",
      sound: honey,
    },
    primul: {
      key: "Primul",
      sound: primul,
    },
    interstellar: {
      key: "Interstellar",
      sound: interstellar,
    },
  },
  focus: {
    clock: {
      key: "Clock",
      sound: clock,
    },
    interstellar: {
      key: "Interstellar",
      sound: interstellar,
    },
  },
} as const;

export type AlarmSoundKey = keyof typeof Sounds.alarm;
export type FocusSoundKey = keyof typeof Sounds.focus;

export const ALARM_SOUND_KEYS = Object.keys(Sounds.alarm) as [
  AlarmSoundKey,
  ...AlarmSoundKey[],
];
export const FOCUS_SOUND_KEYS = Object.keys(Sounds.focus) as [
  FocusSoundKey,
  ...FocusSoundKey[],
];

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

// Settings Schema
export const settingsSchema = z.object({
  pomodoro_duration: z.coerce
    .number<number>()
    .min(1, "Pomodoro must be at least 1 minute."),
  short_break_duration: z.coerce
    .number<number>()
    .min(1, "Short break must be at least 1 minute."),
  long_break_duration: z.coerce
    .number<number>()
    .min(1, "Long break must be at least 1 minute."),
  auto_start_breaks: z.boolean(),
  auto_start_pomodoros: z.boolean(),
  long_break_interval: z.coerce
    .number<number>()
    .min(1, "Interval must be at least 1 cycle."),
  auto_check_tasks: z.boolean(),
  check_to_bottom: z.boolean(),
  alarm_sound: z.enum(ALARM_SOUND_KEYS),
  alarm_sound_volume: z.coerce.number<number>().min(0).max(100),
  alarm_sound_repeat: z.coerce
    .number<number>()
    .min(1, "Alarm sound must be played al least 1 time."),
  focus_sound: z.enum(FOCUS_SOUND_KEYS),
  focus_sound_volume: z.coerce.number<number>().min(0).max(100),
  pomodoro_theme: z.enum(COLOR_KEYS),
  short_break_theme: z.enum(COLOR_KEYS),
  long_break_theme: z.enum(COLOR_KEYS),
  hour_format: z.enum(["h24", "h12"]),
  dark_mode_when_running: z.boolean(),
  reminder_type: z.enum(["every", "last"]),
  reminder_time: z.coerce
    .number<number>()
    .min(0, "Reminder time must be 1 at least min."),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  pomodoro_duration: TABS.Pomodoro.timer,
  short_break_duration: TABS.Short_Break.timer,
  long_break_duration: TABS.Long_Break.timer,
  auto_start_breaks: false,
  auto_start_pomodoros: false,
  long_break_interval: 4,
  auto_check_tasks: false,
  check_to_bottom: false,
  alarm_sound: "alpha",
  alarm_sound_volume: 0,
  alarm_sound_repeat: 3,
  focus_sound: "clock",
  focus_sound_volume: 0,
  pomodoro_theme: "brickRed",
  short_break_theme: "tealGreen",
  long_break_theme: "slateBlue",
  hour_format: "h24",
  dark_mode_when_running: false,
  reminder_type: "every",
  reminder_time: 0,
};

export const TASK_CONSTRAINTS = {
  name: { min: 1, max: 60 },
  estimatedPomodoros: { min: 1 },
  completedPomodoros: { min: 0 },
  note: { max: 120 },
} as const;

// Tasks Schema
// export const taskSchema = z.object({
//   name: z
//     .string()
//     .min(TASK_CONSTRAINTS.name.min, "Name is required.")
//     .max(TASK_CONSTRAINTS.name.max, "Name max length reached."),
//   estimatedPomodoros: z.coerce.number<number>()
//     .min(
//       TASK_CONSTRAINTS.estimatedPomodoros.min,
//       "At least 1 pomodoro is required.",
//     ),
//   completedPomodoros: z.coerce.number<number>().min(0).default(0),
//   isComplete: z.boolean().default(false),
//   order: z.coerce.number<number>().default(0).optional(),
//   projectId: z.string().nullable().default(null).optional(),
//   note: z
//     .string()
//     .max(TASK_CONSTRAINTS.note.max, "Notes maximum length reached.")
//     .default("")
//     .optional(),
// });

export const HIDDEN_FIELDS = [
  "completedPomodoros",
  "isComplete",
  "order",
  "projectId",
] as const;

// export type Task = z.infer<typeof taskSchema>;

// export const tasksResponseSchema = taskSchema.extend({
//   id: z.uuid(),
//   createdAt: z.iso.datetime(),
//   updatedAt: z.iso.datetime(),
// });

// export type TasksResponse = z.infer<typeof tasksResponseSchema>;

export const signupSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(32, "Password cannot exceed 32 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password cannot exceed 32 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

export type SigninFormData = z.infer<typeof signinSchema>;

export interface User {
  name: string;
  avatarUrl: string;
  email: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const SessionTypes = {
  pomodoro: "pomodoro",
  short_break: "short_break",
  long_break: "long_break",
} as const;

export type SessionTypesType = (typeof SessionTypes)[keyof typeof SessionTypes];
