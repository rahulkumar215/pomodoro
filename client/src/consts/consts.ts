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
