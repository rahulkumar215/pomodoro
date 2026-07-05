import { SessionType, TABS, type Settings, type Tab } from "@/consts/consts";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNotification } from "./useNotification";
import { useSound } from "./useSound";
import { Sounds } from "@/consts/consts";
import { useSettings } from "@/context/SettingsContext";
import formattedTimer from "@/lib/formattedTimer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

function getTimer(activeTab: Tab, settings: Settings) {
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

type Counter = {
  focus: number;
  break: number;
};

export default function useTimer() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>(TABS.Pomodoro);
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState<number>(getTimer(activeTab, settings));
  const timerRef = useRef(timer);
  const { showNotification } = useNotification();
  const {
    play: playAlarm,
    setAudio: setAlarmAudio,
    stop: stopAlarm,
  } = useSound();
  const {
    play: playFocus,
    setAudio: setFocusAudio,
    stop: stopFocus,
  } = useSound();
  const workerRef = useRef<Worker | null>(null);
  const focusTabRef = useRef(activeTab.type === "Pomodoro");
  const startTimeRef = useRef<Date>(null);
  const handleStopTimerRef = useRef<() => void>(() => {});
  const [count, setCount] = useState<Counter>({
    focus: 1,
    break: 1,
  });
  const localPomodoroCount = useRef(0);
  const enteredViaAutoTransition = useRef(false);
  const queryClient = useQueryClient();

  const addSession = async (data: {
    type: SessionType;
    startTime: Date;
    endTime: Date;
  }): Promise<void> => {
    return await api.post("/sessions", data);
  };

  const mutation = useMutation({
    mutationFn: addSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["sessions"],
      });
    },
  });

  const createWorker = useCallback(() => {
    workerRef.current?.terminate();

    const worker = new Worker(
      new URL("./../worker/timerWorker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    worker.onmessage = (e: MessageEvent) => {
      const timeLeft = e.data.timeLeft;
      setTimer(timeLeft);
      timerRef.current = timeLeft;
      document.title = `${formattedTimer(timeLeft)} ${activeTab.message}}`;

      if (timeLeft > 0 && settings.reminder_time > 0) {
        if (
          settings.reminder_type === "every" &&
          timeLeft % (settings.reminder_time * 60 * 1000) === 0
        ) {
          // Every 1 min
          showNotification(`${timeLeft / 60 / 1000} min left!`);
        } else if (
          settings.reminder_type === "last" &&
          timeLeft === settings.reminder_time * 60 * 1000
        ) {
          // Last 1 min
          showNotification(`${settings.reminder_time} min left!`);
        }
      }

      if (timeLeft <= 0) {
        handleStopTimerRef.current();
      }
    };

    workerRef.current = worker;
  }, [
    settings.reminder_time,
    settings.reminder_type,
    showNotification,
    activeTab.message,
  ]);

  const startWorker = useCallback(() => {
    createWorker();
    if (!workerRef.current) return;
    setStarted(true);
    if (focusTabRef.current) {
      startTimeRef.current = new Date();
      playFocus({ loop: true });
    }
    workerRef.current.postMessage({
      id: new Date(),
      timer: timerRef.current,
    });
  }, [focusTabRef, playFocus, createWorker]);

  const handleStartTimer = useCallback(() => {
    if (!started && workerRef.current) {
      startWorker();
    } else {
      setStarted(false);
      if (focusTabRef.current) {
        stopFocus();
      }
      workerRef.current?.terminate();
    }
  }, [started, startWorker, focusTabRef, stopFocus]);
  const handleChangeTab = useCallback(
    (value: Tab, auto: boolean = false) => {
      setActiveTab(value);
      const newTimer = getTimer(value, settings);
      setTimer(newTimer);
      timerRef.current = newTimer;
      setStarted(false);
      focusTabRef.current = value.type === "Pomodoro";
      workerRef.current?.terminate();
      if (!auto) {
        enteredViaAutoTransition.current = false;
        stopFocus();
        stopAlarm();
      }
    },
    [settings, stopAlarm, stopFocus],
  );

  const handleStopTimer = useCallback(() => {
    //stop focus
    if (focusTabRef.current) {
      mutation.mutate({
        type: "pomodoro",
        startTime: startTimeRef.current!,
        endTime: new Date(),
      });
      stopFocus();
    }
    setStarted(false);
    playAlarm({ maxPlays: settings.alarm_sound_repeat });
    showNotification("Time is up!");
    workerRef.current?.terminate();

    if (activeTab.type === "Pomodoro") {
      setCount((prev) => ({
        ...prev,
        focus: prev.focus + 1,
      }));
      enteredViaAutoTransition.current = true;
      localPomodoroCount.current++;
      if (localPomodoroCount.current === settings.long_break_interval) {
        localPomodoroCount.current = 0;
        handleChangeTab(TABS.Long_Break, true);
      } else {
        handleChangeTab(TABS.Short_Break, true);
        focusTabRef.current = false;
      }
      if (settings.auto_start_breaks) {
        startWorker();
      }
    } else if (
      activeTab.type === "Short Break" ||
      activeTab.type === "Long Break"
    ) {
      if (enteredViaAutoTransition.current) {
        setCount((prev) => ({
          ...prev,
          break: prev.break + 1,
        }));
      }
      enteredViaAutoTransition.current = true;
      handleChangeTab(TABS.Pomodoro);

      if (settings.auto_start_pomodoros) {
        startWorker();
      }
    }
  }, [
    activeTab.type,
    focusTabRef,
    handleChangeTab,
    playAlarm,
    settings.alarm_sound_repeat,
    settings.auto_start_breaks,
    settings.auto_start_pomodoros,
    settings.long_break_interval,
    showNotification,
    stopFocus,
    startWorker,
    mutation,
  ]);

  useEffect(() => {
    handleStopTimerRef.current = handleStopTimer;
  }, [handleStopTimer]);

  useEffect(() => {
    setAlarmAudio(
      Sounds.alarm[settings.alarm_sound].sound,
      settings.alarm_sound_volume,
      false,
      false,
    );
  }, [settings.alarm_sound, settings.alarm_sound_volume, setAlarmAudio]);

  useEffect(() => {
    setFocusAudio(
      Sounds.focus[settings.focus_sound].sound,
      settings.focus_sound_volume,
      false,
      false,
    );
  }, [settings.focus_sound, settings.focus_sound_volume, setFocusAudio]);

  useEffect(() => {
    createWorker();
    return () => workerRef.current?.terminate();
  }, [createWorker]);

  return {
    timer,
    setTimer,
    started,
    setStarted,
    activeTab,
    setActiveTab,
    handleStartTimer,
    handleChangeTab,
    count,
  };
}
