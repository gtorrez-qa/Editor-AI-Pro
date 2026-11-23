import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce, CLAMP, ease } from "../lib/motion";
import { BODY_FONT, DISPLAY_FONT } from "../theme/fonts";
import { unit } from "../theme/formats";
import type { Palette } from "../theme/palettes";

/** Cuenta regresiva grande (3, 2, 1…) con un anillo que se vacía cada segundo. */
export const Countdown: React.FC<{ from?: number; palette: Palette; size?: number; finalWord?: string }> = ({
  from = 3,
  palette,
  size,
  finalWord,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  const d = size ?? u * 50;
  const second = Math.floor(frame / fps);
  const local = frame - second * fps;
  const value = from - second;
  const label = value > 0 ? String(value) : finalWord ?? "";
  if (!label) return null;
  const p = bounce(local, fps);
  const ring = value > 0 ? 1 - local / fps : 0;
  const r = d * 0.45;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: d, height: d, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={d} height={d} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={d / 2} cy={d / 2} r={r} stroke={`${palette.ink}22`} strokeWidth={d * 0.03} fill="none" />
        <circle
          cx={d / 2}
          cy={d / 2}
          r={r}
          stroke={palette.accent}
          strokeWidth={d * 0.03}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ring)}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: value > 0 ? d * 0.5 : d * 0.2,
          color: palette.ink,
          transform: `scale(${p})`,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Número que sube desde 0 hasta el valor final, con prefijo/sufijo y etiqueta. */
export const StatCounter: React.FC<{
  value: number;
  label: string;
  palette: Palette;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
  durationInFrames?: number;
  scale?: number;
}> = ({ value, label, palette, prefix = "", suffix = "", decimals = 0, delay = 0, durationInFrames = 45, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height) * scale;
  const progress = interpolate(frame - delay, [0, durationInFrames], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const shown = (value * progress).toLocaleString("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const appear = ease(frame, fps, delay, 15);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: appear, transform: `translateY(${(1 - appear) * u * 4}px)` }}>
      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: u * 14,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          background: `linear-gradient(135deg, ${palette.accent}, ${palette.accent2})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        {prefix}
        {shown}
        {suffix}
      </div>
      <div style={{ fontFamily: BODY_FONT, fontWeight: 600, fontSize: u * 3.4, color: palette.inkSoft, marginTop: u * 1.5, textAlign: "center" }}>
        {label}
      </div>
    </div>
  );
};

/** Subrayado tipo marcador que se dibuja debajo de un texto. */
export const Marker: React.FC<{ children: React.ReactNode; color: string; delay?: number }> = ({ children, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = ease(frame, fps, delay, 18);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          left: "-4%",
          right: "-4%",
          bottom: "8%",
          height: "38%",
          background: color,
          opacity: 0.55,
          borderRadius: 6,
          transform: `scaleX(${p}) skewX(-8deg)`,
          transformOrigin: "left",
          zIndex: 0,
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};
