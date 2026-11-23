import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../lib/motion";
import type { Palette } from "../theme/palettes";

export type ParticleMode = "polvo" | "chispas" | "confeti" | "burbujas";
export const particleModes = ["polvo", "chispas", "confeti", "burbujas"] as const;

type Props = {
  palette: Palette;
  mode?: ParticleMode;
  count?: number;
  /** Semilla: cambiala para obtener otra distribución */
  seed?: string;
  /** Para "confeti": cuadro en el que explota */
  burstAt?: number;
};

/** Partículas deterministas (se ven igual en cada render). */
export const Particles: React.FC<Props> = ({ palette, mode = "polvo", count = 60, seed = "editor-ai-pro", burstAt = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const colors = [palette.accent, palette.accent2, palette.ink];

  const items = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        return {
          x: r("x"),
          y: r("y"),
          size: r("s"),
          speed: 0.3 + r("v") * 0.7,
          angle: r("a") * Math.PI * 2,
          spin: (r("r") - 0.5) * 20,
          color: colors[Math.floor(r("c") * colors.length)],
          phase: r("p") * Math.PI * 2,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, seed, palette],
  );

  const base = Math.min(width, height);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {items.map((p, i) => {
        let x = p.x * width;
        let y = p.y * height;
        let size = base * (0.004 + p.size * 0.01);
        let opacity = 0.6;
        let rotate = 0;
        let radius = "50%";
        let glow = 0;

        if (mode === "polvo") {
          y = ((p.y * height - frame * p.speed * 1.2) % height + height) % height;
          x += Math.sin(frame / 50 + p.phase) * base * 0.02;
          opacity = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 20 + p.phase));
        } else if (mode === "chispas") {
          y = ((p.y * height - frame * p.speed * 4) % height + height) % height;
          size *= 0.7;
          glow = size * 3;
          opacity = 0.5 + 0.5 * Math.sin(frame / 6 + p.phase);
        } else if (mode === "burbujas") {
          y = ((p.y * height - frame * p.speed * 2) % (height * 1.2) + height * 1.2) % (height * 1.2);
          size *= 4;
          opacity = 0.18;
        } else {
          // confeti: explosión desde el centro con gravedad
          const t = Math.max(0, frame - burstAt) / fps;
          if (frame < burstAt) return null;
          const v = base * (0.6 + p.speed);
          x = width / 2 + Math.cos(p.angle) * v * t;
          y = height * 0.45 + Math.sin(p.angle) * v * t + 0.5 * base * 1.8 * t * t;
          size = base * (0.012 + p.size * 0.012);
          rotate = p.spin * t * 30;
          radius = `${base * 0.002}px`;
          opacity = interpolate(t, [0, 2.2, 3], [1, 1, 0], CLAMP);
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: mode === "confeti" ? size * 0.5 : size,
              borderRadius: radius,
              background: mode === "burbujas" ? "transparent" : p.color,
              border: mode === "burbujas" ? `${base * 0.002}px solid ${p.color}` : undefined,
              opacity,
              transform: `rotate(${rotate}deg)`,
              boxShadow: glow ? `0 0 ${glow}px ${p.color}` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
