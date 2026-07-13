import z from "zod";

export const Sounds = {
  alarm: {
    alpha: {
      key: "Alpha",
    },
    honey: {
      key: "Honey",
    },
    primul: {
      key: "Primul",
    },
    interstellar: {
      key: "Interstellar",
    },
  },
  focus: {
    clock: {
      key: "Clock",
    },
    interstellar: {
      key: "Interstellar",
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

const settingsShape = {
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
};

export const createSettingsSchema = z.object(settingsShape);
export const updateSettingsSchema = z
  .object(settingsShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update.",
  });
