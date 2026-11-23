import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce } from "../lib/motion";
import { BODY_FONT } from "../theme/fonts";
import { unit } from "../theme/formats";
import type { Palette } from "../theme/palettes";

export type CaptionLook = "karaoke" | "box" | "minimal";
export const captionLooks = ["karaoke", "box", "minimal"] as const;
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
  const fontSize = Math.round(u * (look === "minimal" ? 5.2 : 6.4));

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
          } else {
            style.opacity = active || past ? 1 : 0.45;
          }
          return (
            <span key={i} style={style}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
