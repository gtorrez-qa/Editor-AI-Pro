import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce } from "../lib/motion";
import { BODY_FONT } from "../theme/fonts";
import { unit } from "../theme/formats";
import type { Palette } from "../theme/palettes";

/**
 * Estilos de subtítulos:
 * - karaoke: la palabra actual cambia de color   - box: caja oscura, palabra actual resaltada
 * - minimal: palabras futuras atenuadas           - neon: brillo de neón en la palabra actual
 * - pop: una sola palabra gigante por vez         - outline: letras huecas que se rellenan
 * - gradient: palabra actual con degradado        - underline: barra que subraya la palabra actual
 */
export const captionLooks = ["karaoke", "box", "minimal", "neon", "pop", "outline", "gradient", "underline"] as const;
export type CaptionLook = (typeof captionLooks)[number];
export type CaptionPosition = "bottom" | "center" | "top";
export const captionPositions = ["bottom", "center", "top"] as const;

type Props = {
  captions: Caption[];
  palette: Palette;
  look?: CaptionLook;
  position?: CaptionPosition;
  /** Agrupa palabras que caen dentro de esta ventana en una misma "página" */
  groupMs?: number;
  uppercase?: boolean;
};

/** Subtítulos palabra por palabra sincronizados con el audio. */
export const Captions: React.FC<Props> = ({
  captions,
  palette,
  look = "karaoke",
  position = "bottom",
  groupMs = 1000,
  uppercase = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  const nowMs = (frame / fps) * 1000;

  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: groupMs }),
    [captions, groupMs],
  );

  const page = pages.find((p) => nowMs >= p.startMs && nowMs < p.startMs + p.durationMs);
  if (!page) return null;

  const pageFrame = frame - Math.round((page.startMs / 1000) * fps);
  const enter = bounce(pageFrame, fps);
  const justify = position === "top" ? "flex-start" : position === "center" ? "center" : "flex-end";
  const fontSize = Math.round(u * (look === "minimal" ? 5.2 : look === "pop" ? 11 : 6.4));

  // "pop": una sola palabra, grande, que salta en cada cambio
  if (look === "pop") {
    const token = page.tokens.find((t) => nowMs >= t.fromMs && nowMs < t.toMs) ?? page.tokens[0];
    const tokenFrame = frame - Math.round((token.fromMs / 1000) * fps);
    const hit = bounce(tokenFrame, fps);
    const idx = page.tokens.indexOf(token);
    return (
      <AbsoluteFill style={{ justifyContent: justify, alignItems: "center", padding: `${u * 14}px ${u * 7}px` }}>
        <div
          style={{
            fontFamily: BODY_FONT,
            fontWeight: 800,
            fontSize,
            textTransform: uppercase ? "uppercase" : "none",
            color: idx % 3 === 1 ? palette.accent : palette.ink,
            transform: `scale(${0.6 + 0.4 * hit}) rotate(${(idx % 2 === 0 ? -1 : 1) * 3 * (1 - hit)}deg)`,
            textShadow: `0 ${u * 0.6}px ${u * 2}px rgba(0,0,0,0.8), 0 0 ${u * 0.4}px rgba(0,0,0,0.9)`,
            whiteSpace: "pre",
          }}
        >
          {token.text.trim()}
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: justify,
        alignItems: "center",
        padding: `${u * 14}px ${u * 7}px`,
      }}
    >
      <div
        style={{
          fontFamily: BODY_FONT,
          fontWeight: 800,
          fontSize,
          lineHeight: 1.2,
          textAlign: "center",
          textTransform: uppercase ? "uppercase" : "none",
          transform: `scale(${0.85 + 0.15 * enter})`,
          opacity: Math.min(1, enter * 2),
          background: look === "box" ? `${palette.base}cc` : "transparent",
          padding: look === "box" ? `${u * 1.6}px ${u * 3}px` : 0,
          borderRadius: u * 2.5,
          maxWidth: "100%",
        }}
      >
        {page.tokens.map((t, i) => {
          const active = nowMs >= t.fromMs && nowMs < t.toMs;
          const past = nowMs >= t.toMs;
          const style: React.CSSProperties = {
            whiteSpace: "pre",
            display: "inline-block",
            color: palette.ink,
            textShadow:
              look === "box" ? "none" : `0 ${u * 0.4}px ${u * 1.6}px rgba(0,0,0,0.75), 0 0 ${u * 0.3}px rgba(0,0,0,0.9)`,
          };
          if (look === "karaoke") {
            style.color = active ? palette.accent : palette.ink;
            style.transform = active ? "scale(1.08)" : "none";
          } else if (look === "box") {
            if (active) {
              style.backgroundColor = palette.accent;
              style.color = palette.base;
              style.borderRadius = u;
            }
          } else if (look === "neon") {
            style.color = active ? "#ffffff" : `${palette.ink}cc`;
            style.textShadow = active
              ? `0 0 ${u * 0.6}px #fff, 0 0 ${u * 1.6}px ${palette.accent}, 0 0 ${u * 3.5}px ${palette.accent}, 0 0 ${u * 6}px ${palette.accent2}`
              : `0 0 ${u}px rgba(0,0,0,0.9)`;
          } else if (look === "outline") {
            style.color = active || past ? palette.ink : "transparent";
            style.WebkitTextStroke = `${u * 0.25}px ${palette.ink}`;
            if (active) style.color = palette.accent;
            style.textShadow = active || past ? style.textShadow : "none";
          } else if (look === "gradient") {
            if (active) {
              style.backgroundImage = `linear-gradient(135deg, ${palette.accent}, ${palette.accent2})`;
              style.WebkitBackgroundClip = "text";
              style.backgroundClip = "text";
              style.color = "transparent";
              style.textShadow = "none";
              style.filter = `drop-shadow(0 ${u * 0.3}px ${u * 0.8}px rgba(0,0,0,0.8))`;
              style.transform = "scale(1.06)";
            }
          } else if (look === "underline") {
            style.position = "relative";
            if (active) style.boxShadow = `inset 0 -${u * 0.9}px 0 ${palette.accent}`;
          } else {
            style.opacity = active || past ? 1 : 0.45;
          }
          // el espacio inicial va fuera del estilo, así cajas y subrayados cubren solo la palabra
          const lead = t.text.match(/^s*/)?.[0] ?? "";
          return (
            <React.Fragment key={i}>
              {lead && <span style={{ whiteSpace: "pre" }}>{lead}</span>}
              <span style={style}>{t.text.slice(lead.length)}</span>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
