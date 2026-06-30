import { prisma } from "@/db";
import { NextFunction, Request, Response } from "express";

export const createSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    pomodoroDuration,
    shortBreakDurtaion,
    longBreakDuration,
    longBreakInterval,
    autoStartBreaks,
    autoStartPomodoros,
    autoCheckTasks,
    checkToBottom,
    alarmSound,
    alarmSoundRepeat,
    alarmVolumn,
    focusSound,
    focusVolume,
    pomodoroTheme,
    shortBreakTheme,
    longBreakTheme,
    hourFormat,
    darkModeWhenRunning,
    reminderType,
    reminderTime,
  } = req.body;

  const settings = prisma.settings.create({
    data: {
      user_id: req.user.id,
      pomodoro_duration: pomodoroDuration,
      short_break_duration: shortBreakDurtaion,
      long_break_duration: longBreakDuration,
      long_break_interval: longBreakInterval,
      auto_start_breaks: autoStartBreaks,
      auto_start_pomodoros: autoStartPomodoros,
      auto_check_tasks: autoCheckTasks,
      check_to_bottom: checkToBottom,
      alarm_sound: alarmSound,
      alarm_sound_repeat: alarmSoundRepeat,
      alarm_sound_volume: alarmVolumn,
      focus_sound: focusSound,
      focus_sound_volume: focusVolume,
      pomodoro_theme: pomodoroTheme,
      long_break_theme: longBreakTheme,
      hour_format: hourFormat,
      dark_mode_when_running: darkModeWhenRunning,
      reminder_type: reminderType,
      reminder_time: reminderTime,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      data: settings,
    },
  });
};
