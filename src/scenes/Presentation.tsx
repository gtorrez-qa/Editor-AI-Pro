import { TransitionSeries } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Backdrop } from "../blocks/Backdrop";
import { Headline } from "../blocks/Headline";
import { Footage } from "../blocks/Media";
import { ProgressLine, Signature } from "../blocks/Overlays";
import { musicFields, Soundtrack } from "../blocks/Soundtrack";
import { makeTransition, rotatingTransition, transitionNames } from "../blocks/Transitions";
import { ease } from "../lib/motion";
import { BODY_FONT, DISPLAY_FONT } from "../theme/fonts";
import { FPS, unit } from "../theme/formats";
import { PALETTES, paletteIds, type Palette } from "../theme/palettes";

const slideSchema = z.object({
  title: z.string(),
  body: z.string(),
  bullets: z.array(z.string()),
  /** Imagen o video opcional dentro de public/ */
  media: z.string(),
});

export const presentationSchema = z.object({
  /** La primera diapositiva se muestra como portada */
  slides: z.array(slideSchema).min(1).max(20),
  palette: z.enum(paletteIds),
  backdrop: z.enum(["aurora", "grid", "solid"]),
  transitions: z.array(z.enum(transitionNames)).min(1),
  secondsPerSlide: z.number().min(2).max(30),
  handle: z.string(),
  showProgress: z.boolean(),
  ...musicFields,
});
export type PresentationProps = z.infer<typeof presentationSchema>;

const T = 18;
export const presentationMetadata: CalculateMetadataFunction<PresentationProps> = ({ props }) => {
  const each = Math.round(props.secondsPerSlide * FPS);
  return { durationInFrames: each * props.slides.length - T * (props.slides.length - 1) };
};

const Cover: React.FC<{ s: PresentationProps["slides"][number]; palette: Palette }> = ({ s, palette }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  const line = ease(frame, fps, 10, 20);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: u * 10, gap: u * 4 }}>
      <Headline text={s.title} motion="blur" size={u * 11} color={palette.ink} accent={palette.accent} />
      <div style={{ width: u * 20 * line, height: u * 0.6, borderRadius: u, background: palette.accent }} />
      {s.body && (
        <div style={{ fontFamily: BODY_FONT, fontSize: u * 4, color: palette.inkSoft, opacity: line, textAlign: "center" }}>{s.body}</div>
      )}
    </AbsoluteFill>
  );
};

const Slide: React.FC<{ s: PresentationProps["slides"][number]; index: number; total: number; palette: Palette }> = ({
  s,
  index,
  total,
  palette,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  const vertical = height > width;
  const hasMedia = Boolean(s.media);
  const mediaIn = ease(frame, fps, 8, 20);
  return (
    <AbsoluteFill
      style={{
        flexDirection: vertical ? "column" : "row",
        alignItems: "center",
        padding: vertical ? `${u * 14}px ${u * 7}px` : `${u * 8}px ${u * 10}px`,
        gap: u * 6,
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: u * 3, alignItems: "flex-start" }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: u * 3, color: palette.accent, letterSpacing: "0.1em" }}>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
        <Headline text={s.title} motion="rise" size={u * 7.5} color={palette.ink} accent={palette.accent} align="left" />
        {s.body && (
          <div style={{ fontFamily: BODY_FONT, fontSize: u * 3.6, lineHeight: 1.45, color: palette.inkSoft, opacity: ease(frame, fps, 12) }}>
            {s.body}
          </div>
        )}
        {s.bullets.map((b, i) => {
          const p = ease(frame, fps, 18 + i * 8, 16);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: u * 2,
                alignItems: "baseline",
                fontFamily: BODY_FONT,
                fontSize: u * 3.8,
                color: palette.ink,
                opacity: p,
                transform: `translateX(${(1 - p) * u * 5}px)`,
              }}
            >
              <span style={{ width: u * 1.4, height: u * 1.4, borderRadius: "50%", background: palette.accent, flexShrink: 0, transform: "translateY(-0.1em)" }} />
              {b}
            </div>
          );
        })}
      </div>
      {hasMedia && (
        <div
          style={{
            flex: 1,
            alignSelf: "stretch",
            borderRadius: u * 3,
            overflow: "hidden",
            position: "relative",
            boxShadow: `0 ${u * 2}px ${u * 8}px rgba(0,0,0,0.35)`,
            opacity: mediaIn,
            transform: `scale(${0.94 + 0.06 * mediaIn})`,
          }}
        >
          <AbsoluteFill>
            <Footage src={s.media} muted />
          </AbsoluteFill>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Presentación tipo diapositivas: portada + diapositivas con viñetas e imágenes. */
export const Presentation: React.FC<PresentationProps> = (p) => {
  const { width, height } = useVideoConfig();
  const palette = PALETTES[p.palette];
  const each = Math.round(p.secondsPerSlide * FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: palette.base }}>
      <Backdrop palette={palette} variant={p.backdrop} />
      <TransitionSeries>
        {p.slides.flatMap((s, i) => {
          const items = [
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={each}>
              {i === 0 ? <Cover s={s} palette={palette} /> : <Slide s={s} index={i - 1} total={p.slides.length - 1} palette={palette} />}
            </TransitionSeries.Sequence>,
          ];
          if (i < p.slides.length - 1) {
            items.push(makeTransition({ key: `t${i}`, name: rotatingTransition(p.transitions, i), width, height, durationInFrames: T }));
          }
          return items;
        })}
      </TransitionSeries>
      {p.showProgress && <ProgressLine palette={palette} position="bottom" />}
      <Signature handle={p.handle} palette={palette} />
      <Soundtrack src={p.music} volume={p.musicVolume} />
    </AbsoluteFill>
  );
};
