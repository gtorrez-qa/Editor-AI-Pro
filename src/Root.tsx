import React from "react";
import { Composition, Folder } from "remotion";
import { BeforeAfter, beforeAfterSchema, type BeforeAfterProps } from "./scenes/BeforeAfter";
import { CaptionedClip, captionedClipMetadata, captionedClipSchema, type CaptionedClipProps } from "./scenes/CaptionedClip";
import { CAPTION_STYLES_DURATION, CaptionStyles, Gallery, GALLERY_DURATION, TITLE_STYLES_DURATION, TitleStyles } from "./scenes/Gallery";
import { Launch, launchMetadata, launchSchema, type LaunchProps } from "./scenes/Launch";
import { Numbers, numbersMetadata, numbersSchema, type NumbersProps } from "./scenes/Numbers";
import { PhotoStory, photoStoryMetadata, photoStorySchema, type PhotoStoryProps } from "./scenes/PhotoStory";
import { Podcast, podcastMetadata, podcastSchema, type PodcastProps } from "./scenes/Podcast";
import { Presentation, presentationMetadata, presentationSchema, type PresentationProps } from "./scenes/Presentation";
import { ShortForm, shortFormMetadata, shortFormSchema, type ShortFormProps } from "./scenes/ShortForm";
import { Spotlight, spotlightSchema, type SpotlightProps } from "./scenes/Spotlight";
import { Testimonial, testimonialSchema, type TestimonialProps } from "./scenes/Testimonial";
import { BRAND } from "./theme/brand";
import { FORMATS, FPS } from "./theme/formats";
import { MyVideos } from "./videos";
import { withMark } from "./blocks/InvisibleMark";

/** Todas las composiciones llevan la marca de agua invisible (se desactiva en theme/brand.ts). */
const M = {
  ShortForm: withMark(ShortForm),
  Testimonial: withMark(Testimonial),
  Numbers: withMark(Numbers),
  PhotoStory: withMark(PhotoStory),
  Spotlight: withMark(Spotlight),
  Launch: withMark(Launch),
  BeforeAfter: withMark(BeforeAfter),
  Presentation: withMark(Presentation),
  CaptionedClip: withMark(CaptionedClip),
  Podcast: withMark(Podcast),
  Gallery: withMark(Gallery),
  TitleStyles: withMark(TitleStyles),
  CaptionStyles: withMark(CaptionStyles),
};

const handle = BRAND.defaultHandle;
const noMusic = { music: "", musicVolume: 0.5 };

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
  handle,
  hookSeconds: 3,
  secondsPerPoint: 3,
  ctaSeconds: 3.5,
  showProgress: true,
  transitions: ["deslizar-arriba", "fundido", "barrido-der", "deslizar-izq"],
  ambient: "polvo",
  ...noMusic,
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
  handle,
  ...noMusic,
};

const clipDefaults: CaptionedClipProps = {
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
  speakerName: "",
  speakerRole: "",
  palette: "brasa",
  handle,
  showProgress: false,
  music: "",
  musicVolume: 0.35,
  musicDuck: 0.25,
  videoVolume: 1,
};

const presentationDefaults: PresentationProps = {
  slides: [
    { title: "Editor AI Pro", body: "Videos profesionales escritos por IA", bullets: [], media: "" },
    {
      title: "El *problema*",
      body: "Editar video lleva horas y requiere aprender programas complejos.",
      bullets: ["Líneas de tiempo confusas", "Exportar para cada red", "Subtitular a mano"],
      media: "",
    },
    {
      title: "La *solución*",
      body: "Describís el video y la IA lo arma.",
      bullets: ["Plantillas para cada plataforma", "Subtítulos automáticos", "Render en lote"],
      media: "",
    },
  ],
  palette: "oceano",
  backdrop: "grid",
  transitions: ["deslizar-izq", "cubo", "fundido"],
  secondsPerSlide: 5,
  handle,
  showProgress: true,
  ...noMusic,
};

const testimonialDefaults: TestimonialProps = {
  quote: "En una tarde hice los videos de *todo el mes*. No vuelvo a editar a mano.",
  author: "Laura Méndez",
  role: "Creadora de contenido",
  avatar: "",
  rating: 5,
  palette: "noche",
  backdrop: "aurora",
  handle,
  ...noMusic,
};

const launchDefaults: LaunchProps = {
  countdownFrom: 3,
  eyebrow: "Llega",
  product: "Editor *AI* Pro",
  tagline: "Tus videos, escritos por IA",
  date: "Disponible desde el 1 de diciembre",
  ctaLabel: "Reservá tu lugar",
  ambient: "chispas",
  revealSeconds: 6,
  palette: "brasa",
  backdrop: "aurora",
  handle,
  ...noMusic,
};

const beforeAfterDefaults: BeforeAfterProps = {
  before: "",
  after: "",
  title: "Mirá la *diferencia*",
  beforeLabel: "Antes",
  afterLabel: "Después",
  palette: "lima",
  handle,
  ...noMusic,
};

const podcastDefaults: PodcastProps = {
  data: "",
  clipStart: 0,
  clipEnd: 0,
  showName: "Charlas con IA",
  episode: "Episodio 12: cómo crear videos sin editar",
  cover: "",
  speaker: "Guillermo Torrez",
  showCaptions: true,
  captionLook: "box",
  palette: "noche",
  backdrop: "aurora",
  handle,
  music: "",
  musicVolume: 0.25,
};

const photoStoryDefaults: PhotoStoryProps = {
  photos: [],
  captions: ["Donde empezó todo", "El equipo", "El primer lanzamiento", "Y lo que viene"],
  title: "Nuestro *año*",
  ending: "Gracias por *acompañarnos*",
  secondsEach: 3,
  palette: "papel",
  handle,
  ...noMusic,
};

const numbersDefaults: NumbersProps = {
  title: "Resultados del *mes*",
  stats: [
    { value: 120, label: "videos publicados", prefix: "", suffix: "", decimals: 0 },
    { value: 2.4, label: "millones de vistas", prefix: "", suffix: "M", decimals: 1 },
    { value: 85, label: "menos tiempo editando", prefix: "", suffix: "%", decimals: 0 },
  ],
  ambient: "polvo",
  holdSeconds: 3,
  palette: "oceano",
  backdrop: "aurora",
  handle,
  ...noMusic,
};

export const Root: React.FC = () => (
  <>
    <Folder name="Redes">
      <Composition id="Short" component={M.ShortForm} schema={shortFormSchema} defaultProps={shortDefaults} calculateMetadata={shortFormMetadata} fps={FPS} durationInFrames={300} {...FORMATS.vertical} />
      <Composition id="Post" component={M.ShortForm} schema={shortFormSchema} defaultProps={{ ...shortDefaults, palette: "papel", backdrop: "grid", motion: "pop", ambient: "ninguno", transitions: ["giro", "iris"] }} calculateMetadata={shortFormMetadata} fps={FPS} durationInFrames={300} {...FORMATS.portrait} />
      <Composition id="Promo" component={M.ShortForm} schema={shortFormSchema} defaultProps={{ ...shortDefaults, palette: "oceano", motion: "blur", transitions: ["barrido-diagonal", "reloj", "fundido"] }} calculateMetadata={shortFormMetadata} fps={FPS} durationInFrames={300} {...FORMATS.landscape} />
      <Composition id="Testimonio" component={M.Testimonial} schema={testimonialSchema} defaultProps={testimonialDefaults} fps={FPS} durationInFrames={8 * FPS} {...FORMATS.vertical} />
      <Composition id="Numeros" component={M.Numbers} schema={numbersSchema} defaultProps={numbersDefaults} calculateMetadata={numbersMetadata} fps={FPS} durationInFrames={200} {...FORMATS.vertical} />
      <Composition id="Historia" component={M.PhotoStory} schema={photoStorySchema} defaultProps={photoStoryDefaults} calculateMetadata={photoStoryMetadata} fps={FPS} durationInFrames={300} {...FORMATS.vertical} />
    </Folder>
    <Folder name="Marketing">
      <Composition id="Spotlight" component={M.Spotlight} schema={spotlightSchema} defaultProps={spotlightDefaults} fps={FPS} durationInFrames={8 * FPS} {...FORMATS.vertical} />
      <Composition id="Spotlight-Horizontal" component={M.Spotlight} schema={spotlightSchema} defaultProps={{ ...spotlightDefaults, palette: "lima", backdrop: "grid" }} fps={FPS} durationInFrames={8 * FPS} {...FORMATS.landscape} />
      <Composition id="Lanzamiento" component={M.Launch} schema={launchSchema} defaultProps={launchDefaults} calculateMetadata={launchMetadata} fps={FPS} durationInFrames={270} {...FORMATS.landscape} />
      <Composition id="AntesDespues" component={M.BeforeAfter} schema={beforeAfterSchema} defaultProps={beforeAfterDefaults} fps={FPS} durationInFrames={8 * FPS} {...FORMATS.landscape} />
      <Composition id="Presentacion" component={M.Presentation} schema={presentationSchema} defaultProps={presentationDefaults} calculateMetadata={presentationMetadata} fps={FPS} durationInFrames={300} {...FORMATS.landscape} />
    </Folder>
    <Folder name="Tus-videos">
      <Composition id="Clip" component={M.CaptionedClip} schema={captionedClipSchema} defaultProps={clipDefaults} calculateMetadata={captionedClipMetadata} fps={FPS} durationInFrames={150} {...FORMATS.landscape} />
      <Composition id="Podcast" component={M.Podcast} schema={podcastSchema} defaultProps={podcastDefaults} calculateMetadata={podcastMetadata} fps={FPS} durationInFrames={360} {...FORMATS.vertical} />
      <MyVideos />
    </Folder>
    <Folder name="Demos">
      <Composition id="Galeria" component={M.Gallery} fps={FPS} durationInFrames={GALLERY_DURATION} {...FORMATS.vertical} />
      <Composition id="Galeria-Horizontal" component={M.Gallery} fps={FPS} durationInFrames={GALLERY_DURATION} {...FORMATS.landscape} />
      <Composition id="Estilos-Titulos" component={M.TitleStyles} fps={FPS} durationInFrames={TITLE_STYLES_DURATION} {...FORMATS.landscape} />
      <Composition id="Estilos-Subtitulos" component={M.CaptionStyles} fps={FPS} durationInFrames={CAPTION_STYLES_DURATION} {...FORMATS.vertical} />
    </Folder>
  </>
);
