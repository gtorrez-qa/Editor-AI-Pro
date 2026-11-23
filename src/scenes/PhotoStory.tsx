import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Headline } from "../blocks/Headline";
import { PlaceholderPanel, Slideshow } from "../blocks/Media";
import { Signature } from "../blocks/Overlays";
import { musicFields, Soundtrack } from "../blocks/Soundtrack";
import { ease, fadeOutBefore } from "../lib/motion";
import { BODY_FONT } from "../theme/fonts";
import { FPS, unit } from "../theme/formats";
import { PALETTES, paletteIds } from "../theme/palettes";

export const photoStorySchema = z.object({
  /** Fotos o clips dentro de public/, en orden */
  photos: z.array(z.string()),
  /** Texto opcional para cada foto (mismo orden; vacío = sin texto) */
  captions: z.array(z.string()),
  title: z.string(),
  ending: z.string(),
  secondsEach: z.number().min(1).max(15),
  palette: z.enum(paletteIds),
  handle: z.string(),
  ...musicFields,
});
export type PhotoStoryProps = z.infer<typeof photoStorySchema>;

const OVERLAP = 12;
const ENDING = 3 * FPS;
const count = (p: PhotoStoryProps) => Math.max(1, p.photos.length || 4);

export const photoStoryMetadata: CalculateMetadataFunction<PhotoStoryProps> = ({ props }) => {
  const each = Math.round(props.secondsEach * FPS);
  const n = count(props);
  return { durationInFrames: n * (each - OVERLAP) + OVERLAP + (props.ending ? ENDING : 0) };
};

/** Historia con fotos: zoom suave, fundidos, textos por foto, música y cierre. */
export const PhotoStory: React.FC<PhotoStoryProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const palette = PALETTES[p.palette];
  const u = unit(width, height);
  const each = Math.round(p.secondsEach * fps);
  const n = count(p);
  const photosEnd = n * (each - OVERLAP) + OVERLAP;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {p.photos.length ? (
        <Slideshow items={p.photos} secondsEach={p.secondsEach} overlapFrames={OVERLAP} />
      ) : (
        new Array(n).fill(0).map((_, i) => (
          <Sequence key={i} from={i * (each - OVERLAP)} durationInFrames={each}>
            <PlaceholderPanel palette={palette} label={`Foto ${i + 1}`} variant={i} />
          </Sequence>
        ))
      )}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35), transparent 30%, transparent 60%, rgba(0,0,0,0.6))" }} />
      {p.captions.map((text, i) =>
        text ? (
          <Sequence key={i} from={i * (each - OVERLAP) + 8} durationInFrames={each - 16}>
            <PhotoCaption text={text} durationInFrames={each - 16} />
          </Sequence>
        ) : null,
      )}
      {p.title && frame < 3 * fps && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: u * 8, opacity: fadeOutBefore(frame, 3 * fps) }}>
          <Headline text={p.title} motion="blur" size={u * 10} color="#ffffff" accent={palette.accent} />
        </AbsoluteFill>
      )}
      {p.ending && (
        <Sequence from={photosEnd}>
          <AbsoluteFill style={{ backgroundColor: palette.base, justifyContent: "center", alignItems: "center", padding: u * 8 }}>
            <Headline text={p.ending} motion="rise" size={u * 8} color={palette.ink} accent={palette.accent} />
          </AbsoluteFill>
        </Sequence>
      )}
      <Signature handle={p.handle} palette={palette} />
      <Soundtrack src={p.music} volume={p.musicVolume} />
    </AbsoluteFill>
  );
};

const PhotoCaption: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = unit(width, height);
  const inP = ease(frame, fps, 0, 15);
  const out = fadeOutBefore(frame, durationInFrames, 10);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", padding: `${u * 16}px ${u * 7}px` }}>
      <div
        style={{
          fontFamily: BODY_FONT,
          fontWeight: 600,
          fontSize: u * 4.4,
          color: "#fff",
          textAlign: "center",
          textShadow: "0 2px 16px rgba(0,0,0,0.7)",
          opacity: inP * out,
          transform: `translateY(${(1 - inP) * u * 3}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
