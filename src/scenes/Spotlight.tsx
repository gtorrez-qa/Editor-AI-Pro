import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Backdrop } from "../blocks/Backdrop";
import { Headline } from "../blocks/Headline";
import { ActionChip, Signature } from "../blocks/Overlays";
import { bounce, drift, ease } from "../lib/motion";
import { resolveAsset } from "../lib/prepared";
import { BODY_FONT, DISPLAY_FONT } from "../theme/fonts";
import { unit } from "../theme/formats";
import { PALETTES, paletteIds, type Palette } from "../theme/palettes";

export const spotlightSchema = z.object({
  /** PNG sin fondo dentro de public/ (ej. "cutouts/zapatilla.png"), generado con `npm run remove-bg` */
  image: z.string(),
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  /** Precio o dato destacado (vacío = no se muestra) */
  badge: z.string(),
  ctaLabel: z.string(),
  palette: z.enum(paletteIds),
  backdrop: z.enum(["aurora", "grid", "solid"]),
  handle: z.string(),
});

export type SpotlightProps = z.infer<typeof spotlightSchema>;

const ProductArt: React.FC<{ image: string; palette: Palette; size: number }> = ({ image, palette, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = bounce(frame, fps, 4);
  const float = drift(frame, 90, size * 0.025);
  const tilt = drift(frame, 150, 2.5);
  return (
    <div style={{ position: "relative", width: size, height: size, transform: `scale(${enter})` }}>
      <div
        style={{
          position: "absolute",
          inset: "12%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${palette.accent}aa, ${palette.accent2}00 70%)`,
          filter: `blur(${size * 0.06}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "22%",
          right: "22%",
          bottom: "4%",
          height: size * 0.05,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.45)",
          filter: `blur(${size * 0.02}px)`,
          transform: `scaleX(${1 - float / (size * 0.1)})`,
        }}
      />
      {image ? (
        <Img
          src={resolveAsset(image)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: `translateY(${float}px) rotate(${tilt}deg)`,
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: "20%",
            borderRadius: size * 0.08,
            background: `linear-gradient(145deg, ${palette.accent}, ${palette.accent2})`,
            transform: `translateY(${float}px) rotate(${tilt + 8}deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: size * 0.07,
            color: palette.base,
          }}
        >
          tu producto
        </div>
      )}
    </div>
  );
};

/** Vitrina de producto: imagen sin fondo + título + precio + llamada a la acción. */
export const Spotlight: React.FC<SpotlightProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const palette = PALETTES[p.palette];
  const u = unit(width, height);
  const vertical = height >= width;
  const artSize = vertical ? width * 0.82 : height * 0.82;
  const eyebrowIn = ease(frame, fps, 10);
  const badgeIn = bounce(frame, fps, 40);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.base }}>
      <Backdrop palette={palette} variant={p.backdrop} />
      <AbsoluteFill
        style={{
          flexDirection: vertical ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          padding: vertical ? `${u * 12}px ${u * 7}px` : `${u * 6}px ${u * 10}px`,
          gap: vertical ? u * 2 : u * 6,
        }}
      >
        <ProductArt image={p.image} palette={palette} size={artSize} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: vertical ? "center" : "flex-start",
            gap: u * 3,
            maxWidth: vertical ? "100%" : "50%",
          }}
        >
          {p.eyebrow && (
            <div
              style={{
                fontFamily: BODY_FONT,
                fontWeight: 600,
                fontSize: u * 3,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: palette.accent,
                opacity: eyebrowIn,
              }}
            >
              {p.eyebrow}
            </div>
          )}
          <Headline
            text={p.title}
            motion="rise"
            delay={14}
            size={u * 9}
            color={palette.ink}
            accent={palette.accent}
            align={vertical ? "center" : "left"}
          />
          {p.subtitle && (
            <div
              style={{
                fontFamily: BODY_FONT,
                fontSize: u * 3.6,
                color: palette.inkSoft,
                textAlign: vertical ? "center" : "left",
                opacity: ease(frame, fps, 30),
              }}
            >
              {p.subtitle}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: u * 3, marginTop: u * 2 }}>
            {p.badge && (
              <div
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: u * 6.5,
                  color: palette.ink,
                  transform: `scale(${badgeIn}) rotate(-4deg)`,
                }}
              >
                {p.badge}
              </div>
            )}
            {p.ctaLabel && <ActionChip text={p.ctaLabel} palette={palette} delay={55} scale={0.85} />}
          </div>
        </div>
      </AbsoluteFill>
      <Signature handle={p.handle} palette={palette} />
    </AbsoluteFill>
  );
};
