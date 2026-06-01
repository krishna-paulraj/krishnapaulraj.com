"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { playSound, type SoundPlayback } from "@/lib/sound-engine";
import type {
  PlayFunction,
  SoundAsset,
  UseSoundOptions,
  UseSoundReturn,
} from "@/lib/sound-types";

/**
 * Plays a {@link SoundAsset} via the Web Audio sound engine.
 * Mirrors the `useSound` API used across the soundcn components.
 */
export function useSound(
  sound: SoundAsset,
  options: UseSoundOptions = {},
): UseSoundReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackRef = useRef<SoundPlayback | null>(null);

  // Keep the latest options/sound without re-creating callbacks on each render.
  const optionsRef = useRef(options);
  const soundRef = useRef(sound);
  useEffect(() => {
    optionsRef.current = options;
    soundRef.current = sound;
  });

  const stop = useCallback(() => {
    playbackRef.current?.stop();
    playbackRef.current = null;
    setIsPlaying(false);
    optionsRef.current.onStop?.();
  }, []);

  const play = useCallback<PlayFunction>((overrides) => {
    const o = optionsRef.current;
    if (o.soundEnabled === false) return;
    if (o.interrupt) playbackRef.current?.stop();

    o.onPlay?.();
    setIsPlaying(true);

    void playSound(soundRef.current.dataUri, {
      volume: overrides?.volume ?? o.volume ?? 1,
      playbackRate: overrides?.playbackRate ?? o.playbackRate ?? 1,
      onEnd: () => {
        setIsPlaying(false);
        optionsRef.current.onEnd?.();
      },
    }).then((playback) => {
      playbackRef.current = playback;
    });
  }, []);

  // Stop any in-flight playback on unmount.
  useEffect(() => () => playbackRef.current?.stop(), []);

  return [
    play,
    {
      stop,
      pause: stop,
      isPlaying,
      duration: sound.duration,
      sound,
    },
  ] as const;
}
