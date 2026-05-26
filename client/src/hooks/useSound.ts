import { useCallback, useRef } from "react";

export function useSound(src: string = "", volume: number = 0) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const setAudio = useCallback(
    (
      src: string,
      volume: number,
      changeSound: boolean,
      changeVolume: boolean,
    ) => {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.volume = volume / 100;
      }

      if (changeSound) {
        audioRef.current = new Audio(src);
        audioRef.current.currentTime = 0;
        audioRef.current.volume = volume / 100;
      }

      if (changeVolume) {
        audioRef.current.volume = volume / 100;
      }

      return audioRef.current;
    },
    [],
  );

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.volume = volume / 100;
    }
    return audioRef.current;
  }, [src, volume]);

  const play = useCallback(
    async ({
      maxPlays = 1,
      loop = false,
    }: {
      maxPlays?: number;
      loop?: boolean;
    }) => {
      let playCount = 0;
      try {
        const audio = getAudio();
        if (loop) audio.loop = true;
        if (audio.volume > 0) {
          const handleEnded = async () => {
            playCount++;
            if (playCount < maxPlays) {
              audio.currentTime = 0;
              await audio.play();
            } else {
              audio.removeEventListener("ended", handleEnded);
            }
          };

          audio.addEventListener("ended", handleEnded);

          await audio.play();
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          console.warn("Audio blocked: requires user interaction first.");
        } else {
          throw err;
        }
      }
    },
    [getAudio],
  );

  const stop = useCallback(() => {
    console.log("Stopped the song");
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, []);

  const changeSoundAndVolume = (
    sound: string,
    volume: number,
    changeSound: boolean,
    changeVolume: boolean,
  ) => {
    if (audioRef.current?.paused !== undefined && changeSound) stop();

    setAudio(sound, volume, changeSound, changeVolume);
    play({});
  };

  return { setAudio, play, stop, changeSoundAndVolume, audioRef };
}
