import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction, useVideoConfig } from "remotion";
import { z } from "zod";
import { Backdrop } from "../blocks/Backdrop";
import { StatCounter } from "../blocks/Counters";
import { Headline } from "../blocks/Headline";
import { Signature } from "../blocks/Overlays";
import { Particles, particleModes } from "../blocks/Particles";
import { musicFields, Soundtrack } from "../blocks/Soundtrack";
import { FPS, unit } from "../theme/formats";
import { PALETTES, paletteIds } from "../theme/palettes";

const statSchema = z.object({
  value: z.number(),
  label: z.string(),
  prefix: z.string(),
  suffix: z.string(),
  decimals: z.number().int().min(0).max(3),
});

export const numbersSchema = z.object({
  title: z.string(),
  stats: z.array(statSchema).min(1).max(6),
  ambient: z.enum(particleModes),
  holdSeconds: z.number().min(1).max(20),
  palette: z.enum(paletteIds),
  backdrop: z.enum(["aurora", "grid", "solid"]),
  handle: z.string(),
  ...musicFields,
});
export type NumbersProps = z.infer<typeof numbersSchema>;

const STAGGER = 14;
export const numbersMetadata: CalculateMetadataFunction<NumbersProps> = ({ props }) => ({
  durationInFrames: 20 + props.stats.length * STAGGER + 45 + Math.round(props.holdSeconds * FPS),
});

/** Infografía de resultados: números que cuentan hacia arriba. */
export const Numbers: React.FC<NumbersProps> = (p) => {
  const { width, height } = useVideoConfig();
  const palette = PALETTES[p.palette];
  const u = unit(width, height);
  const vertical = height > width;
  const cols = vertical ? 1 : Math.min(p.stats.length, 3);
  const scale = vertical ? (p.stats.length > 3 ? 0.62 : 0.8) : p.stats.length > 3 ? 0.62 : 0.75;
  return (
    <AbsoluteFill style={{ backgroundColor: palette.base }}>
      <Backdrop palette={palette} variant={p.backdrop} />
      <Particles palette={palette} mode={p.ambient} count={40} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: u * 8, gap: u * 7 }}>
        {p.title && <Headline text={p.title} motion="rise" size={u * 7.5} color={palette.ink} accent={palette.accent} />}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${u * 6}px ${u * 8}px`, width: "100%" }}>
          {p.stats.map((s, i) => (
            <StatCounter key={i} {...s} palette={palette} delay={20 + i * STAGGER} scale={scale} />
          ))}
        </div>
      </AbsoluteFill>
      <Signature handle={p.handle} palette={palette} />
      <Soundtrack src={p.music} volume={p.musicVolume} />
    </AbsoluteFill>
  );
};
