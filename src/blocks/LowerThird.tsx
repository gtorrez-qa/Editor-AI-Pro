import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, ease } from "../lib/motion";
import { BODY_FONT, DISPLAY_FONT } from "../theme/fonts";
import { unit } from "../theme/formats";
import type { Palette } from "../theme/palettes";

type Props = {
  name: string;
  role?: string;
  palette: Palette;
  /** Cuadro en el que entra */
  from?: number;
  /** Cuántos cuadros queda en pantalla antes de salir */
  holdFrames?: number;
  side?: "left" | "right";
};

/** Cartel con nombre y cargo que entra deslizando y sale solo. */
export const LowerThird: React.FC<Props> = ({ name, role, palette, from = 0, holdFrames = 120, side = "left" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  const local = frame - from;
  if (local < 0 || local > holdFrames + 20) return null;

  const bar = ease(local, fps, 0, 14);
  const text = ease(local, fps, 6, 16);
  const out = interpolate(local, [holdFrames, holdFrames + 15], [0, 1], CLAMP);
  const dir = side === "left" ? -1 : 1;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: side === "left" ? "flex-start" : "flex-end",
        padding: `${u * 16}px ${u * 6}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: u * 1.6,
          transform: `translateX(${dir * out * u * 60}px)`,
          opacity: 1 - out,
          flexDirection: side === "left" ? "row" : "row-reverse",
        }}
      >
        <div
          style={{
            width: u * 0.9,
            borderRadius: u,
            background: `linear-gradient(180deg, ${palette.accent}, ${palette.accent2})`,
            transform: `scaleY(${bar})`,
            transformOrigin: "bottom",
          }}
        />
        <div
          style={{
            background: `${palette.base}d9`,
            padding: `${u * 1.6}px ${u * 3}px`,
            borderRadius: u * 1.2,
            clipPath: `inset(0 ${(1 - text) * 100}% 0 0)`,
            textAlign: side === "left" ? "left" : "right",
          }}
        >
          <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: u * 4.4, color: palette.ink }}>{name}</div>
          {role && (
            <div style={{ fontFamily: BODY_FONT, fontWeight: 600, fontSize: u * 2.8, color: palette.accent, marginTop: u * 0.4 }}>
              {role}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
