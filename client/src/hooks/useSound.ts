import { useCallback, useEffect, useRef } from "react";

export function useSound(sound: string) {
  const audio = useRef(new Audio(sound));
  const isPlaying = !audio.current.paused;

  useEffect(() => {
    const audioCur = audio.current;
    return () => audioCur.pause();
  }, []);

  const changeSound = (sound: string) => {
    audio.current = new Audio(sound);
  };

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

  return { play, pause, changeSound, isPlaying };
}
