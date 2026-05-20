import { useCallback, useEffect, useRef } from "react";
import sound from "../assets/audios/alarm_sound.mp3";

export function useSound() {
  const audio = useRef(new Audio(sound));

  useEffect(() => {
    const audioCur = audio.current;
    return () => audioCur.pause();
  }, []);

  const pause = useCallback(() => {
    audio.current.pause();
  }, []);

  const play = useCallback(() => {
    audio.current.currentTime = 0;
    audio.current.play();

    setTimeout(() => {
      pause();
    }, 1000 * 5);
  }, [pause]);

  return { play, pause };
}
