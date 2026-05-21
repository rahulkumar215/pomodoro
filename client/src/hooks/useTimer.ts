import { TABS, type Tab } from "@/consts/consts";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNotification } from "./useNotification";
import { useSound } from "./useSound";
import { Sounds } from "@/consts/consts";

export default function useTimer() {
  const [activeTab, setActiveTab] = useState<Tab>(TABS.Pomodoro);
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState<number>(activeTab.timer * 60 * 1000);
  const { showNotification } = useNotification();
  const { play } = useSound(Sounds.alarm.alpha.sound);
  const workerRef = useRef<Worker | null>(null);

  const handleStartTimer = useCallback(() => {
    if (!started && workerRef.current) {
      setStarted(true);
      workerRef.current.postMessage({ id: new Date(), timer });
    } else {
      setStarted(false);
      workerRef.current?.terminate();
    }
  }, [started, timer]);

  const handleChangeTab = useCallback((value: Tab) => {
    setActiveTab(value);
    setTimer(value.timer * 60 * 1000);
    setStarted(false);
    workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./../worker/timerWorker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    workerRef.current.onmessage = (e: MessageEvent) => {
      //   const formattedTime = formattedTimer(e.data.timeLeft);
      //   document.title = `${formattedTime} - ${activeTab.type}`;
      setTimer(e.data.timeLeft);

      if (e.data.timeLeft <= 0) {
        // reset started
        setStarted(false);

        // play notification sound
        play("userTimer");

        // show notification
        showNotification("Time is up!");

        // terminate the worker
        workerRef.current?.terminate();
      }
    };

    return () => workerRef.current?.terminate();
  }, [activeTab.type, play, showNotification]);

  return {
    timer,
    setTimer,
    started,
    setStarted,
    activeTab,
    setActiveTab,
    handleStartTimer,
    handleChangeTab,
  };
}
