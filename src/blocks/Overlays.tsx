import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce, drift, ease } from "../lib/motion";
import { BODY_FONT } from "../theme/fonts";
import { unit } from "../theme/formats";
import type { Palette } from "../theme/palettes";

/** Botón de llamada a la acción con un pulso suave. */
export const ActionChip: React.FC<{ text: string; palette: Palette; delay?: number; scale?: number }> = ({
  text,
  palette,
  delay = 0,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height) * scale;
  const p = bounce(frame, fps, delay);
  const pulse = 1 + Math.max(0, drift(frame - delay, 40, 0.035));
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: u * 2,
        padding: `${u * 2.4}px ${u * 4.5}px`,
        borderRadius: 999,
        background: `linear-gradient(135deg, ${palette.accent}, ${palette.accent2})`,
        color: palette.base,
        fontFamily: BODY_FONT,
        fontWeight: 800,
        fontSize: u * 4.4,
        transform: `scale(${p * pulse})`,
        boxShadow: `0 ${u}px ${u * 6}px ${palette.accent}66`,
      }}
    >
      {text}
      <span style={{ fontSize: u * 4.8 }}>→</span>
    </div>
  );
};

/** Barra fina que muestra cuánto falta del video. */
export const ProgressLine: React.FC<{ palette: Palette; position?: "top" | "bottom" }> = ({
  palette,
  position = "top",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const u = unit(width, height);
  return (
    <AbsoluteFill style={{ justifyContent: position === "top" ? "flex-start" : "flex-end" }}>
      <div style={{ height: u * 0.7, background: `${palette.ink}22` }}>
        <div
          style={{
            height: "100%",
            width: `${(frame / Math.max(1, durationInFrames - 1)) * 100}%`,
            background: `linear-gradient(90deg, ${palette.accent}, ${palette.accent2})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Firma / usuario de redes en una esquina. */
export const Signature: React.FC<{ handle: string; palette: Palette }> = ({ handle, palette }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  if (!handle) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: u * 4.5 }}>
      <div
        style={{
          fontFamily: BODY_FONT,
          fontWeight: 600,
          fontSize: u * 2.8,
          color: palette.ink,
          opacity: 0.75 * ease(frame, fps, 10),
          padding: `${u * 0.8}px ${u * 2}px`,
          borderRadius: 999,
          background: `${palette.base}88`,
        }}
      >
        {handle}
      </div>
    </AbsoluteFill>
  );
};
