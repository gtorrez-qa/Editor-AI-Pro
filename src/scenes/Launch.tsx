import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Backdrop } from "../blocks/Backdrop";
import { Countdown } from "../blocks/Counters";
import { Headline } from "../blocks/Headline";
import { ActionChip, Signature } from "../blocks/Overlays";
import { Particles, particleModes } from "../blocks/Particles";
import { musicFields, Soundtrack } from "../blocks/Soundtrack";
import { bounce, ease } from "../lib/motion";
import { BODY_FONT } from "../theme/fonts";
import { FPS, unit } from "../theme/formats";
import { PALETTES, paletteIds } from "../theme/palettes";

export const launchSchema = z.object({
  /** Segundos de cuenta regresiva (0 = sin cuenta) */
  countdownFrom: z.number().int().min(0).max(10),
  eyebrow: z.string(),
  product: z.string(),
  tagline: z.string(),
  /** Fecha o dato destacado (ej. "Desde el 1 de diciembre") */
  date: z.string(),
  ctaLabel: z.string(),
  ambient: z.enum(particleModes),
  revealSeconds: z.number().min(2).max(20),
  palette: z.enum(paletteIds),
  backdrop: z.enum(["aurora", "grid", "solid"]),
  handle: z.string(),
  ...musicFields,
});
export type LaunchProps = z.infer<typeof launchSchema>;

export const launchMetadata: CalculateMetadataFunction<LaunchProps> = ({ props }) => ({
  durationInFrames: Math.round((props.countdownFrom + props.revealSeconds) * FPS),
});

const Reveal: React.FC<{ p: LaunchProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const palette = PALETTES[p.palette];
  const u = unit(width, height);
  const flash = Math.max(0, 1 - frame / 8);
  const chip = bounce(frame, fps, 30);
  return (
    <AbsoluteFill>
      <Particles palette={palette} mode="confeti" count={90} burstAt={0} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: u * 8, gap: u * 3.5 }}>
        {p.eyebrow && (
          <div
            style={{
              fontFamily: BODY_FONT,
              fontWeight: 800,
              fontSize: u * 3.2,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: palette.accent,
              opacity: ease(frame, fps, 4),
            }}
          >
            {p.eyebrow}
          </div>
        )}
        <Headline text={p.product} motion="pop" size={u * 14} color={palette.ink} accent={palette.accent} />
        <Headline text={p.tagline} motion="rise" delay={14} size={u * 5} color={palette.inkSoft} accent={palette.accent} weight={500} />
        {p.date && (
          <div
            style={{
              marginTop: u * 2,
              padding: `${u * 1.2}px ${u * 3}px`,
              borderRadius: 999,
              border: `${u * 0.3}px solid ${palette.accent}`,
              color: palette.ink,
              fontFamily: BODY_FONT,
              fontWeight: 600,
              fontSize: u * 3.4,
              transform: `scale(${chip})`,
            }}
          >
            {p.date}
          </div>
        )}
        {p.ctaLabel && (
          <div style={{ marginTop: u * 2 }}>
            <ActionChip text={p.ctaLabel} palette={palette} delay={45} />
          </div>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: palette.ink, opacity: flash * 0.8 }} />
    </AbsoluteFill>
  );
};

/** Lanzamiento o anuncio: cuenta regresiva → explosión de confeti → nombre del producto. */
export const Launch: React.FC<LaunchProps> = (p) => {
  const palette = PALETTES[p.palette];
  const countFrames = p.countdownFrom * FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: palette.base }}>
      <Backdrop palette={palette} variant={p.backdrop} />
      <Particles palette={palette} mode={p.ambient} count={50} />
      {countFrames > 0 && (
        <Sequence durationInFrames={countFrames}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <Countdown from={p.countdownFrom} palette={palette} />
          </AbsoluteFill>
        </Sequence>
      )}
      <Sequence from={countFrames}>
        <Reveal p={p} />
      </Sequence>
      <Signature handle={p.handle} palette={palette} />
      <Soundtrack src={p.music} volume={p.musicVolume} />
    </AbsoluteFill>
  );
};
