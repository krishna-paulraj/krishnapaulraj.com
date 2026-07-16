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

  // Incremented by stop()/unmount to invalidate playbacks that are still
  // decoding, so a playSound that resolves after stop() doesn't keep playing.
  const generationRef = useRef(0);

  // Keep the latest options/sound without re-creating callbacks on each render.
  const optionsRef = useRef(options);
  const soundRef = useRef(sound);
  useEffect(() => {
    optionsRef.current = options;
    soundRef.current = sound;
  });

  const stop = useCallback(() => {
    generationRef.current += 1;
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

    const generation = generationRef.current;

    playSound(soundRef.current.dataUri, {
      volume: overrides?.volume ?? o.volume ?? 1,
      playbackRate: overrides?.playbackRate ?? o.playbackRate ?? 1,
      onEnd: () => {
        if (generation !== generationRef.current) return;
        setIsPlaying(false);
        optionsRef.current.onEnd?.();
      },
    })
      .then((playback) => {
        if (generation !== generationRef.current) {
          // stop() was called while the sound was decoding — kill it now.
          playback.stop();
          return;
        }
        playbackRef.current = playback;
      })
      .catch(() => {
        // Decode/autoplay failure — don't leave `isPlaying` stuck true.
        if (generation !== generationRef.current) return;
        setIsPlaying(false);
      });
  }, []);

  // Stop any in-flight playback on unmount.
  useEffect(
    () => () => {
      generationRef.current += 1;
      playbackRef.current?.stop();
    },
    [],
  );

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
