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
