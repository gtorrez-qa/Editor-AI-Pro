import React, { useMemo } from "react";
import { Audio, interpolate, useVideoConfig } from "remotion";
import { z } from "zod";
import { CLAMP } from "../lib/motion";
import { resolveAsset } from "../lib/prepared";

/** Intervalo en el que alguien habla, en milisegundos del video final. */
export type SpeechWindow = { startMs: number; endMs: number };

type Props = {
  /** Archivo dentro de public/ (ej. "music/tema.mp3") o URL */
  src: string;
  /** Volumen normal de la música (0 a 1) */
  volume?: number;
  /** Volumen relativo mientras alguien habla (0.2 = baja al 20 %) */
  duckTo?: number;
  /** Momentos con voz; la música baja automáticamente durante ellos */
  speech?: SpeechWindow[];
  fadeInSec?: number;
  fadeOutSec?: number;
  /** Segundo de la canción desde el que empieza a sonar */
  startAtSec?: number;
};

/** Campos de música que comparten todas las plantillas. */
export const musicFields = {
  /** Archivo de música dentro de public/ (ej. "music/tema.mp3"). Vacío = sin música */
  music: z.string(),
  /** Volumen de la música, de 0 a 1 */
  musicVolume: z.number().min(0).max(1),
};

/** Une ventanas de voz cercanas para que la música no suba y baje entre palabras. */
export const mergeSpeech = (windows: SpeechWindow[], gapMs = 450): SpeechWindow[] => {
  const sorted = [...windows].sort((a, b) => a.startMs - b.startMs);
  const out: SpeechWindow[] = [];
  for (const w of sorted) {
    const last = out[out.length - 1];
    if (last && w.startMs - last.endMs <= gapMs) last.endMs = Math.max(last.endMs, w.endMs);
    else out.push({ ...w });
  }
  return out;
};

/** Música de fondo en loop, con fundido de entrada/salida y "ducking" bajo la voz. */
export const Soundtrack: React.FC<Props> = ({
  src,
  volume = 0.5,
  duckTo = 0.25,
  speech = [],
  fadeInSec = 1,
  fadeOutSec = 1.5,
  startAtSec = 0,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const windows = useMemo(() => mergeSpeech(speech), [speech]);
  if (!src) return null;

  const rampMs = 300;
  const duckAt = (ms: number) => {
    let level = 1;
    for (const w of windows) {
      if (ms < w.startMs - rampMs) break;
      if (ms > w.endMs + rampMs) continue;
      const inRamp = interpolate(ms, [w.startMs - rampMs, w.startMs, w.endMs, w.endMs + rampMs], [1, duckTo, duckTo, 1], CLAMP);
      level = Math.min(level, inRamp);
    }
    return level;
  };

  return (
    <Audio
      src={resolveAsset(src)}
      loop
      trimBefore={Math.round(startAtSec * fps)}
      volume={(f) => {
        const fade = Math.min(
          interpolate(f, [0, fadeInSec * fps], [0, 1], CLAMP),
          interpolate(f, [durationInFrames - fadeOutSec * fps, durationInFrames - 1], [1, 0], CLAMP),
        );
        return volume * fade * duckAt((f / fps) * 1000);
      }}
    />
  );
};
