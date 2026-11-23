import React from "react";
import {
  AbsoluteFill,
  type CalculateMetadataFunction,
  OffthreadVideo,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Captions, captionLooks, captionPositions } from "../blocks/Captions";
import { Headline } from "../blocks/Headline";
import { LowerThird } from "../blocks/LowerThird";
import { ProgressLine, Signature } from "../blocks/Overlays";
import { musicFields, Soundtrack, type SpeechWindow } from "../blocks/Soundtrack";
import { fadeOutBefore } from "../lib/motion";
import { loadPrepared, resolveAsset, type PreparedVideo } from "../lib/prepared";
import { captionsForCut, speechWindowsForCut, totalSeconds, type Span } from "../lib/timeline";
import { BODY_FONT } from "../theme/fonts";
import { FORMATS, FPS, unit } from "../theme/formats";
import { PALETTES, paletteIds } from "../theme/palettes";

export const captionedClipSchema = z.object({
  /** Archivo generado por `npm run prepare-video` dentro de public/data/ (ej. "entrevista.json") */
  data: z.string(),
  /** "source" mantiene el tamaño del video original; los demás lo recortan para esa plataforma */
  format: z.enum(["source", "vertical", "portrait", "square", "landscape"]),
  cutSilences: z.boolean(),
  showCaptions: z.boolean(),
  captionLook: z.enum(captionLooks),
  captionPosition: z.enum(captionPositions),
  uppercase: z.boolean(),
  /** Recorte opcional del original, en segundos (0 = desde el inicio / hasta el final) */
  clipStart: z.number().min(0),
  clipEnd: z.number().min(0),
  /** Título que aparece los primeros segundos (vacío = sin título) */
  title: z.string(),
  /** Nombre y cargo de quien habla, en un cartel inferior (vacío = sin cartel) */
  speakerName: z.string(),
  speakerRole: z.string(),
  palette: z.enum(paletteIds),
  handle: z.string(),
  showProgress: z.boolean(),
  ...musicFields,
  /** Cuánto baja la música mientras se habla (0.2 = al 20 %) */
  musicDuck: z.number().min(0).max(1),
  /** Volumen del audio original del video, de 0 a 1 */
  videoVolume: z.number().min(0).max(2),
  /** Lo completa calculateMetadata; no editar a mano */
  prepared: z.any().optional(),
});

export type CaptionedClipProps = z.infer<typeof captionedClipSchema>;

const spansFor = (p: CaptionedClipProps, v: PreparedVideo): Span[] => {
  const from = p.clipStart;
  const to = p.clipEnd > 0 ? Math.min(p.clipEnd, v.durationSec) : v.durationSec;
  const base: Span[] = p.cutSilences && v.keep?.length ? v.keep : [{ start: 0, end: v.durationSec }];
  return base
    .map((s) => ({ start: Math.max(s.start, from), end: Math.min(s.end, to) }))
    .filter((s) => s.end - s.start > 0.05);
};

export const captionedClipMetadata: CalculateMetadataFunction<CaptionedClipProps> = async ({
  props,
  abortSignal,
}) => {
  if (!props.data) return { durationInFrames: 5 * FPS, props: { ...props, prepared: undefined } };
  const prepared = await loadPrepared(props.data, abortSignal);
  const seconds = totalSeconds(spansFor(props, prepared));
  const size =
    props.format === "source"
      ? { width: prepared.width - (prepared.width % 2), height: prepared.height - (prepared.height % 2) }
      : FORMATS[props.format];
  return {
    durationInFrames: Math.max(1, Math.round(seconds * FPS)),
    width: size.width,
    height: size.height,
    props: { ...props, prepared },
  };
};

const Placeholder: React.FC = () => {
  const { width, height } = useVideoConfig();
  const u = unit(width, height);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#111",
        color: "#eee",
        fontFamily: BODY_FONT,
        fontSize: u * 3.4,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: u * 8,
        lineHeight: 1.5,
      }}
    >
      Todavía no hay un video preparado.
      <br />
      Poné tu video en public/media/ y corré:
      <br />
      <code style={{ color: "#ffb547" }}>npm run prepare-video -- public/media/tu-video.mp4</code>
    </AbsoluteFill>
  );
};

/** Tu propio video con subtítulos automáticos, silencios recortados y título. */
export const CaptionedClip: React.FC<CaptionedClipProps> = (p) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = p.prepared as PreparedVideo | undefined;
  if (!v) return <Placeholder />;

  const palette = PALETTES[p.palette];
  const u = unit(width, height);
  const spans = spansFor(p, v);
  const src = resolveAsset(v.video);
  const captions = v.captions && p.showCaptions ? captionsForCut(v.captions, spans) : [];
  // la música baja donde hay voz (tramos hablados detectados, o palabras si no hay detección)
  const speech: SpeechWindow[] = speechWindowsForCut(v.keep, v.captions, spans);

  let cursor = 0;
  const pieces = spans.map((s, i) => {
    const from = cursor;
    const len = Math.max(1, Math.round((s.end - s.start) * FPS));
    cursor += len;
    return (
      <Sequence key={i} from={from} durationInFrames={len} premountFor={FPS}>
        <OffthreadVideo
          src={src}
          trimBefore={Math.round(s.start * FPS)}
          volume={p.videoVolume}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Sequence>
    );
  });

  const titleEnd = 3.5 * FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {pieces}
      {p.title && frame < titleEnd && (
        <AbsoluteFill
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: u * 12,
            paddingLeft: u * 6,
            paddingRight: u * 6,
            opacity: fadeOutBefore(frame, titleEnd),
            background: `linear-gradient(180deg, ${palette.base}cc, transparent 35%)`,
          }}
        >
          <Headline text={p.title} motion="pop" size={u * 7} color={palette.ink} accent={palette.accent} />
        </AbsoluteFill>
      )}
      {p.speakerName && (
        <LowerThird name={p.speakerName} role={p.speakerRole} palette={palette} from={p.title ? titleEnd : 15} holdFrames={4 * FPS} />
      )}
      {captions.length > 0 && (
        <Captions
          captions={captions}
          palette={palette}
          look={p.captionLook}
          position={p.captionPosition}
          uppercase={p.uppercase}
        />
      )}
      {p.showProgress && <ProgressLine palette={palette} />}
      <Signature handle={p.handle} palette={palette} />
      <Soundtrack src={p.music} volume={p.musicVolume} duckTo={p.musicDuck} speech={speech} />
    </AbsoluteFill>
  );
};
