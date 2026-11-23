import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Backdrop } from "../blocks/Backdrop";
import type { Caption } from "@remotion/captions";
import { Captions, captionLooks } from "../blocks/Captions";
import { Marker } from "../blocks/Counters";
import { Callout, PhoneFrame, Sticker, Ticker, Watermark } from "../blocks/Extras";
import { Headline, headlineMotions } from "../blocks/Headline";
import { PictureInPicture, SafeArea, SplitScreen } from "../blocks/Layouts";
import { LowerThird } from "../blocks/LowerThird";
import { PlaceholderPanel } from "../blocks/Media";
import { Particles } from "../blocks/Particles";
import { DISPLAY_FONT } from "../theme/fonts";
import { FPS, unit } from "../theme/formats";
import { PALETTES } from "../theme/palettes";

const SECTION = 3 * FPS;
export const GALLERY_DURATION = SECTION * 5;

const Label: React.FC<{ text: string }> = ({ text }) => {
  const { width, height } = useVideoConfig();
  const u = unit(width, height);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: u * 4 }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: u * 3.4, color: "#fff", background: "#000a", padding: `${u}px ${u * 3}px`, borderRadius: 999 }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

/** Muestra los bloques de layout para elegir cuál usar en un video nuevo. */
export const Gallery: React.FC = () => {
  const palette = PALETTES.brasa;
  const { width, height } = useVideoConfig();
  const u = unit(width, height);
  return (
    <AbsoluteFill style={{ backgroundColor: palette.base }}>
      <Sequence durationInFrames={SECTION}>
        <SplitScreen palette={palette} first={<PlaceholderPanel palette={palette} label="Panel A" />} second={<PlaceholderPanel palette={palette} label="Panel B" variant={1} />} />
        <Label text="SplitScreen" />
      </Sequence>
      <Sequence from={SECTION} durationInFrames={SECTION}>
        <PictureInPicture palette={palette} round main={<PlaceholderPanel palette={palette} label="Principal" />} inset={<PlaceholderPanel palette={palette} label="Cámara" variant={1} />} delay={8} />
        <Label text="PictureInPicture + LowerThird" />
        <LowerThird name="Guillermo Torrez" role="Fundador" palette={palette} from={12} holdFrames={60} />
      </Sequence>
      <Sequence from={SECTION * 2} durationInFrames={SECTION}>
        <Backdrop palette={palette} variant="grid" />
        <SafeArea debug>
          <AbsoluteFill style={{ border: `${u * 0.4}px dashed ${palette.accent}`, justifyContent: "center", alignItems: "center" }}>
            <Headline text="Contenido dentro de la *zona segura*" size={u * 6} color={palette.ink} accent={palette.accent} />
          </AbsoluteFill>
        </SafeArea>
        <Label text="SafeArea (debug)" />
      </Sequence>
      <Sequence from={SECTION * 3} durationInFrames={SECTION}>
        <Backdrop palette={palette} variant="aurora" />
        <Particles palette={palette} mode="burbujas" count={30} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: u * 8, color: palette.ink, textAlign: "center", padding: u * 8 }}>
          <div>
            Resaltá lo <Marker color={palette.accent} delay={10}>importante</Marker>
          </div>
        </AbsoluteFill>
        <Label text="Marker + Particles" />
      </Sequence>
      <Sequence from={SECTION * 4} durationInFrames={SECTION}>
        <Backdrop palette={PALETTES.uva} variant="aurora" />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <PhoneFrame palette={PALETTES.uva} size={0.62} tilt={-4}>
            <PlaceholderPanel palette={PALETTES.uva} label="Tu app" />
          </PhoneFrame>
        </AbsoluteFill>
        <Callout text="Nuevo botón" palette={PALETTES.uva} x={62} y={52} delay={18} />
        <Sticker palette={PALETTES.uva} content="-50%" x={24} y={28} delay={10} />
        <Sticker palette={PALETTES.uva} content="🔥" x={78} y={70} size={12} delay={22} rotate={10} />
        <Ticker items={["Oferta", "Solo hoy", "Envío gratis"]} palette={PALETTES.uva} y={88} />
        <Watermark palette={PALETTES.uva} text="Editor AI Pro" corner="bottom-left" />
        <Label text="PhoneFrame + Callout + Sticker + Ticker + Watermark" />
      </Sequence>
    </AbsoluteFill>
  );
};

const STYLE_SECONDS = 2.4;
export const TITLE_STYLES_DURATION = Math.round(headlineMotions.length * STYLE_SECONDS * FPS);

/** Muestra los 10 estilos de títulos, uno tras otro. */
export const TitleStyles: React.FC = () => {
  const palette = PALETTES.noche;
  const { width, height } = useVideoConfig();
  const u = unit(width, height);
  const each = Math.round(STYLE_SECONDS * FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: palette.base }}>
      <Backdrop palette={palette} variant="solid" />
      {headlineMotions.map((m, i) => (
        <Sequence key={m} from={i * each} durationInFrames={each}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: u * 8 }}>
            <Headline text="Tu mensaje con *impacto*" motion={m} size={u * 10} color={palette.ink} accent={palette.accent} delay={4} />
          </AbsoluteFill>
          <Label text={`motion: "${m}"`} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const DEMO_WORDS = "Así se ven los subtítulos palabra por palabra en tu video".split(" ");
const demoCaptions = (offsetMs: number): Caption[] =>
  DEMO_WORDS.map((w, i) => ({
    text: (i === 0 ? "" : " ") + w,
    startMs: offsetMs + i * 230,
    endMs: offsetMs + i * 230 + 220,
    timestampMs: offsetMs + i * 230,
    confidence: 1,
  }));
const LOOK_MS = DEMO_WORDS.length * 230 + 500;
export const CAPTION_STYLES_DURATION = Math.round(((captionLooks.length * LOOK_MS) / 1000) * FPS);

/** Muestra los 8 estilos de subtítulos, uno tras otro. */
export const CaptionStyles: React.FC = () => {
  const palette = PALETTES.brasa;
  const eachFrames = Math.round((LOOK_MS / 1000) * FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: palette.base }}>
      <Backdrop palette={palette} variant="aurora" />
      {captionLooks.map((look, i) => (
        <Sequence key={look} from={i * eachFrames} durationInFrames={eachFrames}>
          <Captions captions={demoCaptions(0)} palette={palette} look={look} position="center" groupMs={1200} />
          <Label text={`captionLook: "${look}"`} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
