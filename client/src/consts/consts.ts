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
  pomodoro_time: z.coerce
    .number<number>()
    .min(1, "Pomodoro must be at least 1 minute."),
  short_break_time: z.coerce
    .number<number>()
    .min(1, "Short break must be at least 1 minute."),
  long_break_time: z.coerce
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
  hour_format: z.enum(["24hr", "12hr"]),
  dark_mode_when_running: z.boolean(),
  reminder_type: z.enum(["Every", "Last"]),
  reminder_time: z.coerce
    .number<number>()
    .min(0, "Reminder time must be 1 at least min."),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  pomodoro_time: TABS.Pomodoro.timer,
  short_break_time: TABS.Short_Break.timer,
  long_break_time: TABS.Long_Break.timer,
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
  hour_format: "24hr",
  dark_mode_when_running: false,
  reminder_type: "Every",
  reminder_time: 0,
};

export const TASK_CONSTRAINTS = {
  title: { min: 1, max: 120 },
  description: { max: 360 },
  estimatedPomodoros: { min: 1 },
  note: { max: 120 },
} as const;

// Tasks Schema
export const taskSchema = z.object({
  title: z
    .string()
    .min(TASK_CONSTRAINTS.title.min, "Title is required.")
    .max(TASK_CONSTRAINTS.title.max, "Title max length reached."),
  description: z
    .string()
    .max(TASK_CONSTRAINTS.description.max, "Description max length reached.")
    .default("")
    .optional(),
  estimatedPomodoros: z.coerce
    .number<number>()
    .min(
      TASK_CONSTRAINTS.estimatedPomodoros.min,
      "At least 1 pomodoro is required.",
    ),
  completedPomodoros: z.coerce.number<number>().min(0).default(0),
  isComplete: z.boolean().default(false),
  order: z.coerce.number<number>().default(0).optional(),
  projectId: z.string().nullable().default(null).optional(),
  note: z
    .string()
    .max(TASK_CONSTRAINTS.note.max, "Notes maximum length reached.")
    .default("")
    .optional(),
  createdAt: z.iso.datetime().default(new Date().toString()).optional(),
});

export const HIDDEN_FIELDS = [
  "completedPomodoros",
  "isComplete",
  "order",
  "projectId",
  "createdAt",
] as const;

export type Task = z.infer<typeof taskSchema>;
