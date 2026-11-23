import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce, ease } from "../lib/motion";
import { unit } from "../theme/formats";
import type { Palette } from "../theme/palettes";

/** Divide la pantalla en dos: lado a lado en horizontal, arriba/abajo en vertical. */
export const SplitScreen: React.FC<{
  first: React.ReactNode;
  second: React.ReactNode;
  palette: Palette;
  /** Proporción del primer panel (0.5 = mitad) */
  ratio?: number;
  /** Forzar orientación; por defecto se adapta al formato */
  direction?: "auto" | "row" | "column";
}> = ({ first, second, palette, ratio = 0.5, direction = "auto" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  const dir = direction === "auto" ? (height > width ? "column" : "row") : direction;
  const open = ease(frame, fps, 0, 20);
  const gap = u * 0.6;
  return (
    <AbsoluteFill style={{ flexDirection: dir, backgroundColor: palette.base, gap }}>
      <div style={{ flex: `${ratio * open + (1 - open)} 1 0`, position: "relative", overflow: "hidden" }}>
        <AbsoluteFill>{first}</AbsoluteFill>
      </div>
      <div style={{ flex: `${1 - ratio} 1 0`, position: "relative", overflow: "hidden", opacity: open }}>
        <AbsoluteFill>{second}</AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};

/** Video o imagen principal con un recuadro flotante en una esquina. */
export const PictureInPicture: React.FC<{
  main: React.ReactNode;
  inset: React.ReactNode;
  palette: Palette;
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Ancho del recuadro como fracción del cuadro */
  size?: number;
  round?: boolean;
  delay?: number;
}> = ({ main, inset, palette, corner = "bottom-right", size = 0.32, round = false, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  const p = bounce(frame, fps, delay);
  const w = width * size;
  const h = round ? w : w * (9 / 16);
  const pos: React.CSSProperties = {
    [corner.includes("top") ? "top" : "bottom"]: u * 5,
    [corner.includes("left") ? "left" : "right"]: u * 5,
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill>{main}</AbsoluteFill>
      <div
        style={{
          position: "absolute",
          ...pos,
          width: w,
          height: h,
          borderRadius: round ? "50%" : u * 2,
          overflow: "hidden",
          border: `${u * 0.5}px solid ${palette.accent}`,
          boxShadow: `0 ${u}px ${u * 5}px rgba(0,0,0,0.5)`,
          transform: `scale(${p})`,
          transformOrigin: corner.replace("-", " "),
        }}
      >
        <AbsoluteFill>{inset}</AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Margen seguro para que nada quede tapado por la interfaz de TikTok/Reels/Shorts.
 * Con `debug` muestra las zonas prohibidas para revisar el diseño.
 */
export const SafeArea: React.FC<{ children: React.ReactNode; debug?: boolean }> = ({ children, debug = false }) => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const top = vertical ? height * 0.1 : height * 0.05;
  const bottom = vertical ? height * 0.2 : height * 0.06;
  const side = vertical ? width * 0.06 : width * 0.05;
  const right = vertical ? width * 0.14 : side; // botones de "me gusta" / comentar
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top, bottom, left: side, right }}>{children}</div>
      {debug && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: top, background: "#ff000033" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: bottom, background: "#ff000033" }} />
          <div style={{ position: "absolute", top, bottom, right: 0, width: right, background: "#ff000022" }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
