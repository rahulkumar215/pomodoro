import type { Settings, Tab } from "@/consts/consts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildDiff<T extends Record<string, unknown>>(
  original: T,
  edited: T,
): Partial<T> {
  const diff: Partial<T> = {};
  for (const key in edited) {
    if (edited[key] !== original[key]) {
      diff[key] = edited[key];
    }
  }
  return diff;
}

export function getTimer(activeTab: Tab, settings: Settings) {
  let timer: number;
  switch (activeTab.type) {
    case "Pomodoro": {
      timer = settings.pomodoro_duration;
      break;
    }
    case "Short Break": {
      timer = settings.short_break_duration;
      break;
    }
    case "Long Break": {
      timer = settings.long_break_duration;
      break;
    }
  }

  return timer * 60 * 1000;
}
