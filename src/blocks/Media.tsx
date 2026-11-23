import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, ease } from "../lib/motion";
import { resolveAsset } from "../lib/prepared";
import { BODY_FONT } from "../theme/fonts";
import { unit } from "../theme/formats";
import type { Palette } from "../theme/palettes";

const isVideo = (src: string) => /\.(mp4|mov|webm|m4v|mkv)$/i.test(src);

/** Imagen o video que llena el cuadro. Las imágenes tienen zoom lento (efecto Ken Burns). */
export const Footage: React.FC<{
  src: string;
  /** Segundo del video desde el que arranca */
  startAtSec?: number;
  muted?: boolean;
  zoom?: "in" | "out" | "none";
  fit?: "cover" | "contain";
  /** Para alternar la dirección del paneo entre fotos */
  variant?: number;
}> = ({ src, startAtSec = 0, muted = false, zoom = "in", fit = "cover", variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  if (!src) return null;
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: fit };
  if (isVideo(src)) {
    return <OffthreadVideo src={resolveAsset(src)} trimBefore={Math.round(startAtSec * fps)} muted={muted} style={style} />;
  }
  const t = interpolate(frame, [0, durationInFrames], [0, 1], CLAMP);
  const s = zoom === "in" ? 1 + 0.12 * t : zoom === "out" ? 1.12 - 0.12 * t : 1;
  const panX = (variant % 2 === 0 ? 1 : -1) * 2 * t;
  const panY = (variant % 3 === 0 ? -1 : 1) * 1.5 * t;
  return (
    <Img src={resolveAsset(src)} style={{ ...style, transform: `scale(${s}) translate(${panX}%, ${panY}%)` }} />
  );
};

/** Muestra un antes/después con una línea divisoria que barre de lado a lado. */
export const BeforeAfterWipe: React.FC<{
  before: React.ReactNode;
  after: React.ReactNode;
  palette: Palette;
  beforeLabel?: string;
  afterLabel?: string;
  /** Cuadros que tarda cada barrido */
  sweepFrames?: number;
  delay?: number;
}> = ({ before, after, palette, beforeLabel = "Antes", afterLabel = "Después", sweepFrames = 60, delay = 15 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const u = unit(width, height);
  // va de 100 % (todo "antes") a 0 %, vuelve a la mitad y se queda
  const pos = interpolate(
    frame - delay,
    [0, sweepFrames, sweepFrames * 1.6, sweepFrames * 2.2],
    [100, 0, 60, 50],
    CLAMP,
  );
  const tag = (text: string, side: "left" | "right"): React.ReactNode => (
    <div
      style={{
        position: "absolute",
        top: u * 5,
        [side]: u * 4,
        padding: `${u * 1}px ${u * 2.4}px`,
        borderRadius: 999,
        background: side === "left" ? `${palette.base}cc` : palette.accent,
        color: side === "left" ? palette.ink : palette.base,
        fontFamily: BODY_FONT,
        fontWeight: 800,
        fontSize: u * 3,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill>{after}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>{before}</AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${pos}%`,
          width: u * 0.6,
          marginLeft: -u * 0.3,
          background: palette.ink,
          boxShadow: `0 0 ${u * 3}px ${palette.accent}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: u * 8,
            height: u * 8,
            marginLeft: -u * 4,
            marginTop: -u * 4,
            borderRadius: "50%",
            background: palette.ink,
            color: palette.base,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: u * 3.6,
            fontWeight: 800,
            fontFamily: BODY_FONT,
          }}
        >
          ⟷
        </div>
      </div>
      {pos > 8 && tag(beforeLabel, "left")}
      {pos < 92 && tag(afterLabel, "right")}
    </AbsoluteFill>
  );
};

/** Secuencia de fotos o clips, cada uno con zoom y fundido hacia el siguiente. */
export const Slideshow: React.FC<{ items: string[]; secondsEach: number; overlapFrames?: number }> = ({
  items,
  secondsEach,
  overlapFrames = 12,
}) => {
  const { fps } = useVideoConfig();
  const each = Math.round(secondsEach * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {items.map((src, i) => (
        <Sequence key={i} from={i * (each - overlapFrames)} durationInFrames={each} premountFor={fps}>
          <FadeIn frames={i === 0 ? 0 : overlapFrames}>
            <Footage src={src} zoom={i % 2 === 0 ? "in" : "out"} variant={i} muted />
          </FadeIn>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const FadeIn: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const frame = useCurrentFrame();
  const opacity = frames === 0 ? 1 : interpolate(frame, [0, frames], [0, 1], CLAMP);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/** Barras que se mueven con el audio (para podcasts y música). */
export const AudioBars: React.FC<{
  src: string;
  palette: Palette;
  bars?: number;
  height: number;
  width: number;
  style?: "barras" | "espejo";
}> = ({ src, palette, bars = 48, height, width, style = "espejo" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(resolveAsset(src));
  const appear = ease(frame, fps, 0, 20);
  if (!audioData) return <div style={{ width, height }} />;
  const spectrum = visualizeAudio({ fps, frame, audioData, numberOfSamples: 256, smoothing: true });
  // la voz y la música se concentran en los graves: se muestrean más bins bajos (escala ~logarítmica)
  // y se ubican en el centro, espejados hacia los costados
  const half = Math.ceil(bars / 2);
  const usable = spectrum.length / 2;
  const sideValues = new Array(half).fill(0).map((_, i) => {
    const idx = Math.min(usable - 1, Math.floor(Math.pow(i / half, 1.8) * usable));
    return spectrum[idx] * (1 + i / half);
  });
  const values = [...[...sideValues].reverse(), ...sideValues].slice(0, bars);
  const gap = width / bars;
  return (
    <div style={{ width, height, display: "flex", alignItems: style === "espejo" ? "center" : "flex-end", gap: gap * 0.35, opacity: appear }}>
      {values.map((v, i) => {
        const h = Math.max(height * 0.04, Math.min(1, Math.sqrt(v) * 1.6) * height);
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: h,
              borderRadius: gap,
              background: `linear-gradient(180deg, ${palette.accent2}, ${palette.accent})`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Panel de reemplazo cuando todavía no hay imagen o video cargado. */
export const PlaceholderPanel: React.FC<{ palette: Palette; label: string; variant?: number }> = ({ palette, label, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const u = unit(width, height);
  const angle = 135 + variant * 40 + frame * 0.3;
  const [a, b] = variant % 2 === 0 ? [palette.surface, palette.accent] : [palette.accent2, palette.surface];
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${a}, ${b})`,
        alignItems: "center",
        justifyContent: "center",
        color: palette.ink,
        fontFamily: BODY_FONT,
        fontWeight: 800,
        fontSize: u * 5,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        textShadow: "0 2px 12px rgba(0,0,0,0.4)",
      }}
    >
      {label}
    </AbsoluteFill>
  );
};

/** Estrellas de calificación que aparecen una por una. */
export const Stars: React.FC<{ rating: number; color: string; size: number; delay?: number }> = ({ rating, color, size, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", gap: size * 0.2 }}>
      {new Array(5).fill(0).map((_, i) => {
        const p = ease(frame, fps, delay + i * 5, 12);
        const filled = i < Math.round(rating);
        return (
          <span key={i} style={{ fontSize: size, color: filled ? color : `${color}33`, transform: `scale(${p})`, display: "inline-block" }}>
            ★
          </span>
        );
      })}
    </div>
  );
};
