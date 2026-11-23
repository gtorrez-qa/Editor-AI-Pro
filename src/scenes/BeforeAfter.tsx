import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Headline } from "../blocks/Headline";
import { BeforeAfterWipe, Footage, PlaceholderPanel } from "../blocks/Media";
import { Signature } from "../blocks/Overlays";
import { musicFields, Soundtrack } from "../blocks/Soundtrack";
import { fadeOutBefore } from "../lib/motion";
import { unit } from "../theme/formats";
import { PALETTES, paletteIds } from "../theme/palettes";

export const beforeAfterSchema = z.object({
  /** Imagen o video "antes" dentro de public/ */
  before: z.string(),
  /** Imagen o video "después" dentro de public/ */
  after: z.string(),
  title: z.string(),
  beforeLabel: z.string(),
  afterLabel: z.string(),
  palette: z.enum(paletteIds),
  handle: z.string(),
  ...musicFields,
});
export type BeforeAfterProps = z.infer<typeof beforeAfterSchema>;

/** Comparación antes/después con barrido animado. */
export const BeforeAfter: React.FC<BeforeAfterProps> = (p) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const palette = PALETTES[p.palette];
  const u = unit(width, height);
  const titleEnd = 3 * fps;
  return (
    <AbsoluteFill style={{ backgroundColor: palette.base }}>
      <BeforeAfterWipe
        palette={palette}
        beforeLabel={p.beforeLabel}
        afterLabel={p.afterLabel}
        delay={titleEnd - 20}
        before={p.before ? <Footage src={p.before} zoom="none" muted /> : <PlaceholderPanel palette={palette} label={p.beforeLabel} variant={1} />}
        after={p.after ? <Footage src={p.after} zoom="none" muted /> : <PlaceholderPanel palette={palette} label={p.afterLabel} />}
      />
      {p.title && frame < titleEnd && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: u * 8,
            background: `${palette.base}b3`,
            opacity: fadeOutBefore(frame, titleEnd, 15),
          }}
        >
          <Headline text={p.title} motion="pop" size={u * 9} color={palette.ink} accent={palette.accent} />
        </AbsoluteFill>
      )}
      <Signature handle={p.handle} palette={palette} />
      <Soundtrack src={p.music} volume={p.musicVolume} />
    </AbsoluteFill>
  );
};
