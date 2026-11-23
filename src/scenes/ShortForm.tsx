import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Backdrop } from "../blocks/Backdrop";
import { Headline, headlineMotions } from "../blocks/Headline";
import { ActionChip, ProgressLine, Signature } from "../blocks/Overlays";
import { ease } from "../lib/motion";
import { DISPLAY_FONT, BODY_FONT } from "../theme/fonts";
import { FPS, unit } from "../theme/formats";
import { PALETTES, paletteIds, type Palette } from "../theme/palettes";

export const shortFormSchema = z.object({
  palette: z.enum(paletteIds),
  backdrop: z.enum(["aurora", "grid", "solid"]),
  motion: z.enum(headlineMotions),
  /** Frase gancho de los primeros segundos. *Palabras* entre asteriscos van en color de acento. */
  hook: z.string(),
  /** Ideas principales, una por pantalla */
  points: z.array(z.string()).min(1).max(8),
  cta: z.string(),
  ctaLabel: z.string(),
  handle: z.string(),
  hookSeconds: z.number().min(1).max(10),
  secondsPerPoint: z.number().min(1).max(12),
  ctaSeconds: z.number().min(1).max(10),
  showProgress: z.boolean(),
});

export type ShortFormProps = z.infer<typeof shortFormSchema>;

const TRANSITION = 14;

const segments = (p: ShortFormProps) => [
  Math.round(p.hookSeconds * FPS),
  ...p.points.map(() => Math.round(p.secondsPerPoint * FPS)),
  Math.round(p.ctaSeconds * FPS),
];

export const shortFormMetadata: CalculateMetadataFunction<ShortFormProps> = ({ props }) => {
  const segs = segments(props);
  return { durationInFrames: segs.reduce((a, b) => a + b, 0) - TRANSITION * (segs.length - 1) };
};

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  const u = unit(width, height);
  const vertical = height > width;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: vertical ? `${u * 22}px ${u * 8}px` : `${u * 8}px ${u * 14}px`,
        gap: u * 5,
        flexDirection: "column",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const HookScreen: React.FC<{ p: ShortFormProps; palette: Palette }> = ({ p, palette }) => {
  const { width, height } = useVideoConfig();
  const u = unit(width, height);
  return (
    <Frame>
      <Headline text={p.hook} motion={p.motion} size={u * 11} color={palette.ink} accent={palette.accent} />
    </Frame>
  );
};

const PointScreen: React.FC<{ text: string; index: number; total: number; p: ShortFormProps; palette: Palette }> = ({
  text,
  index,
  total,
  p,
  palette,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  const n = ease(frame, fps, 0, 20);
  return (
    <Frame>
      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: u * 20,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: `${u * 0.35}px ${palette.accent}`,
          opacity: n,
          transform: `translateY(${(1 - n) * u * 6}px)`,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      <Headline text={text} motion={p.motion} delay={6} size={u * 8.2} color={palette.ink} accent={palette.accent} />
      <div style={{ fontFamily: BODY_FONT, fontSize: u * 2.8, color: palette.inkSoft, opacity: n }}>
        {index + 1} / {total}
      </div>
    </Frame>
  );
};

const CtaScreen: React.FC<{ p: ShortFormProps; palette: Palette }> = ({ p, palette }) => {
  const { width, height } = useVideoConfig();
  const u = unit(width, height);
  return (
    <Frame>
      <Headline text={p.cta} motion={p.motion} size={u * 8.5} color={palette.ink} accent={palette.accent} />
      <ActionChip text={p.ctaLabel} palette={palette} delay={14} />
    </Frame>
  );
};

/** Video corto: gancho → ideas → llamada a la acción. Se adapta a vertical, cuadrado u horizontal. */
export const ShortForm: React.FC<ShortFormProps> = (p) => {
  const palette = PALETTES[p.palette];
  const segs = segments(p);
  const timing = linearTiming({ durationInFrames: TRANSITION });
  const transitionAt = (i: number) => {
    const key = `t-${i}`;
    switch (i % 4) {
      case 0:
        return <TransitionSeries.Transition key={key} timing={timing} presentation={slide({ direction: "from-bottom" })} />;
      case 1:
        return <TransitionSeries.Transition key={key} timing={timing} presentation={fade()} />;
      case 2:
        return <TransitionSeries.Transition key={key} timing={timing} presentation={wipe({ direction: "from-left" })} />;
      default:
        return <TransitionSeries.Transition key={key} timing={timing} presentation={slide({ direction: "from-right" })} />;
    }
  };

  const screens: React.ReactNode[] = [
    <HookScreen key="hook" p={p} palette={palette} />,
    ...p.points.map((text, i) => (
      <PointScreen key={`pt-${i}`} text={text} index={i} total={p.points.length} p={p} palette={palette} />
    )),
    <CtaScreen key="cta" p={p} palette={palette} />,
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: palette.base }}>
      <Backdrop palette={palette} variant={p.backdrop} />
      <TransitionSeries>
        {screens.flatMap((screen, i) => {
          const items = [
            <TransitionSeries.Sequence key={`s-${i}`} durationInFrames={segs[i]}>
              {screen}
            </TransitionSeries.Sequence>,
          ];
          if (i < screens.length - 1) {
            items.push(transitionAt(i));
          }
          return items;
        })}
      </TransitionSeries>
      {p.showProgress && <ProgressLine palette={palette} />}
      <Signature handle={p.handle} palette={palette} />
    </AbsoluteFill>
  );
};
