import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Backdrop } from "../blocks/Backdrop";
import { Headline } from "../blocks/Headline";
import { Stars } from "../blocks/Media";
import { Signature } from "../blocks/Overlays";
import { musicFields, Soundtrack } from "../blocks/Soundtrack";
import { bounce, ease } from "../lib/motion";
import { resolveAsset } from "../lib/prepared";
import { BODY_FONT, DISPLAY_FONT } from "../theme/fonts";
import { unit } from "../theme/formats";
import { PALETTES, paletteIds } from "../theme/palettes";

export const testimonialSchema = z.object({
  /** *Palabras* entre asteriscos se resaltan */
  quote: z.string(),
  author: z.string(),
  role: z.string(),
  /** Foto de la persona dentro de public/ (vacío = iniciales) */
  avatar: z.string(),
  /** 0 a 5 (0 = sin estrellas) */
  rating: z.number().min(0).max(5),
  palette: z.enum(paletteIds),
  backdrop: z.enum(["aurora", "grid", "solid"]),
  handle: z.string(),
  ...musicFields,
});
export type TestimonialProps = z.infer<typeof testimonialSchema>;

/** Testimonio de un cliente: cita grande, estrellas y foto con nombre. */
export const Testimonial: React.FC<TestimonialProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const palette = PALETTES[p.palette];
  const u = unit(width, height);
  const mark = bounce(frame, fps, 0);
  const words = p.quote.split(/\s+/).length;
  const authorDelay = 10 + words * 2;
  const authorIn = ease(frame, fps, authorDelay, 18);
  const initials = p.author
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avatarSize = u * 14;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.base }}>
      <Backdrop palette={palette} variant={p.backdrop} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: `${u * 10}px ${u * 9}px`, gap: u * 5 }}>
        <div
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: u * 30,
            lineHeight: 0.6,
            height: u * 12,
            color: palette.accent,
            transform: `scale(${mark}) rotate(${(1 - mark) * -20}deg)`,
          }}
        >
          “
        </div>
        {p.rating > 0 && <Stars rating={p.rating} color={palette.accent2} size={u * 6} delay={6} />}
        <Headline text={p.quote} motion="blur" delay={10} size={u * 6.4} color={palette.ink} accent={palette.accent} weight={500} />
        <div style={{ display: "flex", alignItems: "center", gap: u * 3, opacity: authorIn, transform: `translateY(${(1 - authorIn) * u * 4}px)` }}>
          <div
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: "50%",
              overflow: "hidden",
              border: `${u * 0.5}px solid ${palette.accent}`,
              background: `linear-gradient(135deg, ${palette.accent}, ${palette.accent2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: avatarSize * 0.38,
              color: palette.base,
              flexShrink: 0,
            }}
          >
            {p.avatar ? <Img src={resolveAsset(p.avatar)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
          </div>
          <div>
            <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: u * 4.6, color: palette.ink }}>{p.author}</div>
            <div style={{ fontFamily: BODY_FONT, fontSize: u * 3.2, color: palette.inkSoft }}>{p.role}</div>
          </div>
        </div>
      </AbsoluteFill>
      <Signature handle={p.handle} palette={palette} />
      <Soundtrack src={p.music} volume={p.musicVolume} />
    </AbsoluteFill>
  );
};
