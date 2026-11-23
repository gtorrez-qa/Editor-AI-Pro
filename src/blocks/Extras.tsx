import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce, CLAMP, drift, ease } from "../lib/motion";
import { resolveAsset } from "../lib/prepared";
import { BODY_FONT, DISPLAY_FONT } from "../theme/fonts";
import { unit } from "../theme/formats";
import type { Palette } from "../theme/palettes";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Marca de agua visible: logo (imagen) o texto, en una esquina y semitransparente. */
export const Watermark: React.FC<{
  palette: Palette;
  text?: string;
  /** Imagen del logo dentro de public/ (PNG con transparencia) */
  logo?: string;
  corner?: Corner;
  opacity?: number;
}> = ({ palette, text = "", logo = "", corner = "top-right", opacity = 0.55 }) => {
  const { width, height } = useVideoConfig();
  const u = unit(width, height);
  if (!text && !logo) return null;
  return (
    <AbsoluteFill
      style={{
        justifyContent: corner.startsWith("top") ? "flex-start" : "flex-end",
        alignItems: corner.endsWith("left") ? "flex-start" : "flex-end",
        padding: u * 4,
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: u * 1.2, opacity }}>
        {logo && <Img src={resolveAsset(logo)} style={{ height: u * 6, width: "auto" }} />}
        {text && (
          <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: u * 3, color: palette.ink, letterSpacing: "0.04em", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            {text}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};

/** Marco de celular para mostrar una app, un video vertical o una captura. */
export const PhoneFrame: React.FC<{
  children: React.ReactNode;
  palette: Palette;
  /** Alto del teléfono como fracción del alto del cuadro */
  size?: number;
  tilt?: number;
  delay?: number;
}> = ({ children, palette, size = 0.78, tilt = 0, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const h = Math.min(height * size, (width * 0.9 * 19.5) / 9);
  const w = (h * 9) / 19.5;
  const p = ease(frame, fps, delay, 24);
  const float = drift(frame, 150, h * 0.008);
  const bezel = w * 0.035;
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: w * 0.14,
        padding: bezel,
        background: `linear-gradient(145deg, #2a2a33, #0c0c10)`,
        boxShadow: `0 ${h * 0.04}px ${h * 0.1}px rgba(0,0,0,0.55), 0 0 0 ${w * 0.008}px #3c3c48, 0 0 ${h * 0.12}px ${palette.accent}33`,
        transform: `translateY(${(1 - p) * h * 0.25 + float}px) rotate(${tilt * p}deg)`,
        opacity: p,
        position: "relative",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.11, overflow: "hidden", background: palette.base }}>
        <AbsoluteFill>{children}</AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: w * 0.03,
            left: "50%",
            width: w * 0.3,
            height: w * 0.085,
            marginLeft: -w * 0.15,
            borderRadius: 999,
            background: "#000",
          }}
        />
      </div>
    </div>
  );
};

/** Etiqueta con flecha que apunta a un lugar del cuadro (coordenadas en % del cuadro). */
export const Callout: React.FC<{
  text: string;
  palette: Palette;
  /** Punto señalado, en porcentaje del ancho y alto */
  x: number;
  y: number;
  /** Dónde va la etiqueta respecto del punto ("auto" = hacia el lado con más espacio) */
  side?: "auto" | "left" | "right" | "top" | "bottom";
  delay?: number;
}> = ({ text, palette, x, y, side: sideProp = "auto", delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  const dot = bounce(frame, fps, delay);
  const line = ease(frame, fps, delay + 6, 16);
  const label = bounce(frame, fps, delay + 16);
  const side = sideProp === "auto" ? (x > 50 ? "left" : "right") : sideProp;
  const len = u * 14;
  const px = (x / 100) * width;
  const py = (y / 100) * height;
  const dx = side === "left" ? -1 : side === "right" ? 1 : 0;
  const dy = side === "top" ? -1 : side === "bottom" ? 1 : 0;
  const ex = px + dx * len * line;
  const ey = py + dy * len * line;
  const pulse = 1 + 0.25 * Math.max(0, Math.sin((frame - delay) / 6));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <circle cx={px} cy={py} r={u * 2.2 * pulse * dot} fill={`${palette.accent}44`} />
        <circle cx={px} cy={py} r={u * 1.1 * dot} fill={palette.accent} />
        <line x1={px} y1={py} x2={ex} y2={ey} stroke={palette.accent} strokeWidth={u * 0.5} strokeLinecap="round" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: px + dx * (len + u * 1.5),
          top: py + dy * (len + u * 1.5),
          transform: `translate(${dx < 0 ? "-100%" : dx > 0 ? "0" : "-50%"}, ${dy < 0 ? "-100%" : dy > 0 ? "0" : "-50%"}) scale(${label})`,
          transformOrigin: dx < 0 ? "right center" : dx > 0 ? "left center" : "center",
          background: palette.ink,
          color: palette.base,
          fontFamily: BODY_FONT,
          fontWeight: 800,
          fontSize: u * 3.4,
          padding: `${u * 1.2}px ${u * 2.4}px`,
          borderRadius: u * 1.4,
          whiteSpace: "nowrap",
          boxShadow: `0 ${u * 0.6}px ${u * 3}px rgba(0,0,0,0.35)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

/** Sticker que aparece con rebote y se balancea: emoji, texto corto o imagen. */
export const Sticker: React.FC<{
  palette: Palette;
  /** Emoji o texto corto ("🔥", "NUEVO", "-50%") */
  content?: string;
  /** Imagen dentro de public/ (reemplaza a content) */
  image?: string;
  /** Posición del centro en % del cuadro */
  x: number;
  y: number;
  size?: number;
  rotate?: number;
  delay?: number;
}> = ({ palette, content = "", image = "", x, y, size = 16, rotate = -8, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  const p = bounce(frame, fps, delay);
  const wiggle = drift(frame - delay, 45, 4);
  const d = u * size;
  const isText = !image && !/\p{Extended_Pictographic}/u.test(content);
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: d,
        height: d,
        marginLeft: -d / 2,
        marginTop: -d / 2,
        transform: `scale(${p}) rotate(${rotate + wiggle}deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: isText ? "50%" : 0,
        background: isText ? `linear-gradient(135deg, ${palette.accent}, ${palette.accent2})` : "transparent",
        boxShadow: isText ? `0 ${u * 0.8}px ${u * 3}px rgba(0,0,0,0.35), inset 0 0 0 ${u * 0.6}px ${palette.ink}55` : "none",
        fontFamily: DISPLAY_FONT,
        fontWeight: 700,
        fontSize: isText ? d * (content.length > 4 ? 0.22 : 0.3) : d * 0.8,
        color: palette.base,
        textAlign: "center",
        lineHeight: 1,
      }}
    >
      {image ? <Img src={resolveAsset(image)} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : content}
    </div>
  );
};

/** Cinta de texto que corre de lado a lado (ofertas, titulares, palabras clave). */
export const Ticker: React.FC<{
  items: string[];
  palette: Palette;
  /** Posición vertical en % del cuadro */
  y?: number;
  /** Píxeles por cuadro */
  speed?: number;
  angle?: number;
}> = ({ items, palette, y = 85, speed = 4, angle = -3 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const u = unit(width, height);
  const appear = interpolate(frame, [0, 12], [0, 1], CLAMP);
  const text = items.join("   ✦   ") + "   ✦   ";
  const charW = u * 2.6;
  const loop = text.length * charW;
  const offset = -((frame * speed) % loop);
  return (
    <div
      style={{
        position: "absolute",
        left: -width * 0.1,
        right: -width * 0.1,
        top: `${y}%`,
        transform: `translateY(-50%) rotate(${angle}deg) scaleY(${appear})`,
        background: palette.accent,
        padding: `${u * 1.4}px 0`,
        overflow: "hidden",
        whiteSpace: "nowrap",
        boxShadow: `0 ${u * 0.6}px ${u * 3}px rgba(0,0,0,0.3)`,
      }}
    >
      <div
        style={{
          display: "inline-block",
          transform: `translateX(${offset}px)`,
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: u * 4,
          color: palette.base,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {text.repeat(Math.ceil((width * 1.4) / loop) + 2)}
      </div>
    </div>
  );
};
