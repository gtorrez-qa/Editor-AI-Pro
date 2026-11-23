import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { drift } from "../lib/motion";
import type { Palette } from "../theme/palettes";

export type BackdropVariant = "aurora" | "grid" | "solid";

/** Fondo animado de cada escena. */
export const Backdrop: React.FC<{ palette: Palette; variant: BackdropVariant }> = ({ palette, variant }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const size = Math.max(width, height);

  if (variant === "solid") {
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 0%, ${palette.surface} 0%, ${palette.base} 70%)`,
        }}
      />
    );
  }

  if (variant === "grid") {
    const cell = Math.round(size / 18);
    const shift = (frame * 0.6) % cell;
    return (
      <AbsoluteFill style={{ backgroundColor: palette.base, overflow: "hidden" }}>
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${palette.inkSoft}22 1px, transparent 1px), linear-gradient(90deg, ${palette.inkSoft}22 1px, transparent 1px)`,
            backgroundSize: `${cell}px ${cell}px`,
            backgroundPosition: `${shift}px ${shift}px`,
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(40% 30% at 50% ${50 + drift(frame, 240, 8)}%, ${palette.accent}33, transparent 70%)`,
          }}
        />
      </AbsoluteFill>
    );
  }

  // aurora: manchas de color grandes y desenfocadas que se mueven lento
  const blobs = [
    { color: palette.accent, x: 20, y: 25, r: 0.75, period: 300, phase: 0 },
    { color: palette.accent2, x: 80, y: 70, r: 0.8, period: 360, phase: 2 },
    { color: palette.surface, x: 60, y: 20, r: 0.6, period: 420, phase: 4 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: palette.base, overflow: "hidden" }}>
      {blobs.map((b, i) => {
        const d = size * b.r;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: d,
              height: d,
              left: `calc(${b.x + drift(frame, b.period, 10, b.phase)}% - ${d / 2}px)`,
              top: `calc(${b.y + drift(frame, b.period * 1.3, 8, b.phase + 1)}% - ${d / 2}px)`,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${b.color}88 0%, ${b.color}00 65%)`,
              filter: `blur(${size / 30}px)`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 50%, ${palette.base}aa 100%)` }} />
    </AbsoluteFill>
  );
};
