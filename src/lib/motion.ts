import { interpolate, spring } from "remotion";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Entrada suave sin rebote (0 → 1). */
export const ease = (frame: number, fps: number, delay = 0, durationInFrames?: number) =>
  spring({ frame: frame - delay, fps, durationInFrames, config: { damping: 200 } });

/** Entrada con rebote, para elementos que "saltan" a escena. */
export const bounce = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });

/** 1 mientras se ve, baja a 0 en los últimos `length` cuadros antes de `end`. */
export const fadeOutBefore = (frame: number, end: number, length = 12) =>
  interpolate(frame, [end - length, end], [1, 0], CLAMP);

/** Oscilación lenta para que nada quede totalmente quieto. */
export const drift = (frame: number, periodFrames: number, amplitude: number, phase = 0) =>
  Math.sin((frame / periodFrames) * Math.PI * 2 + phase) * amplitude;
