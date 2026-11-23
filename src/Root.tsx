import React from "react";
import { Composition, Folder } from "remotion";
import { CaptionedClip, captionedClipMetadata, captionedClipSchema } from "./scenes/CaptionedClip";
import { ShortForm, shortFormMetadata, shortFormSchema, type ShortFormProps } from "./scenes/ShortForm";
import { Spotlight, spotlightSchema, type SpotlightProps } from "./scenes/Spotlight";
import { BRAND } from "./theme/brand";
import { FORMATS, FPS } from "./theme/formats";
import { MyVideos } from "./videos";

const shortDefaults: ShortFormProps = {
  palette: "brasa",
  backdrop: "aurora",
  motion: "rise",
  hook: "Editá videos *hablando* con la IA",
  points: [
    "Describí el video que querés en una frase",
    "Claude arma las escenas, textos y *transiciones*",
    "Renderizás en formato TikTok, Reels o YouTube",
  ],
  cta: "Probalo con tu próximo *video*",
  ctaLabel: "Empezar",
  handle: BRAND.defaultHandle,
  hookSeconds: 3,
  secondsPerPoint: 3,
  ctaSeconds: 3.5,
  showProgress: true,
};

const spotlightDefaults: SpotlightProps = {
  image: "",
  eyebrow: "Nuevo",
  title: "Tu producto en *primer plano*",
  subtitle: "Quitá el fondo de cualquier foto y presentalo en segundos.",
  badge: "$49",
  ctaLabel: "Comprar",
  palette: "noche",
  backdrop: "aurora",
  handle: BRAND.defaultHandle,
};

export const Root: React.FC = () => (
  <>
    <Folder name="Desde-cero">
      <Composition
        id="Short"
        component={ShortForm}
        schema={shortFormSchema}
        defaultProps={shortDefaults}
        calculateMetadata={shortFormMetadata}
        fps={FPS}
        durationInFrames={300}
        {...FORMATS.vertical}
      />
      <Composition
        id="Post"
        component={ShortForm}
        schema={shortFormSchema}
        defaultProps={{ ...shortDefaults, palette: "papel", backdrop: "grid", motion: "pop" }}
        calculateMetadata={shortFormMetadata}
        fps={FPS}
        durationInFrames={300}
        {...FORMATS.portrait}
      />
      <Composition
        id="Promo"
        component={ShortForm}
        schema={shortFormSchema}
        defaultProps={{ ...shortDefaults, palette: "oceano", motion: "blur" }}
        calculateMetadata={shortFormMetadata}
        fps={FPS}
        durationInFrames={300}
        {...FORMATS.landscape}
      />
      <Composition
        id="Spotlight"
        component={Spotlight}
        schema={spotlightSchema}
        defaultProps={spotlightDefaults}
        fps={FPS}
        durationInFrames={8 * FPS}
        {...FORMATS.vertical}
      />
      <Composition
        id="Spotlight-Horizontal"
        component={Spotlight}
        schema={spotlightSchema}
        defaultProps={{ ...spotlightDefaults, palette: "lima", backdrop: "grid" }}
        fps={FPS}
        durationInFrames={8 * FPS}
        {...FORMATS.landscape}
      />
    </Folder>
    <Folder name="Tus-videos">
      <Composition
        id="Clip"
        component={CaptionedClip}
        schema={captionedClipSchema}
        defaultProps={{
          data: "",
          format: "source",
          cutSilences: true,
          showCaptions: true,
          captionLook: "karaoke",
          captionPosition: "bottom",
          uppercase: false,
          clipStart: 0,
          clipEnd: 0,
          title: "",
          palette: "brasa",
          handle: BRAND.defaultHandle,
          showProgress: false,
        }}
        calculateMetadata={captionedClipMetadata}
        fps={FPS}
        durationInFrames={150}
        {...FORMATS.landscape}
      />
      <MyVideos />
    </Folder>
  </>
);
