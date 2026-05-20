import alpha from "./../assets/audios/alarm/aplha.mp3";
import honey from "./../assets/audios/alarm/honey.mp3";
import primul from "./../assets/audios/alarm/primul.mp3";
import clock from "./../assets/audios/focus/Clock.mp3";
import interstellar from "./../assets/audios/focus/interstellar.mp3";

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

export type Tab = (typeof TABS)[keyof typeof TABS];

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
