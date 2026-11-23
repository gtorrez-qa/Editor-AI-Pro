import React from "react";
import {
  AbsoluteFill,
  Audio,
  type CalculateMetadataFunction,
  Img,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Backdrop } from "../blocks/Backdrop";
import { Captions, captionLooks } from "../blocks/Captions";
import { AudioBars } from "../blocks/Media";
import { ProgressLine, Signature } from "../blocks/Overlays";
import { musicFields, Soundtrack } from "../blocks/Soundtrack";
import { drift, ease } from "../lib/motion";
import { loadPrepared, resolveAsset, type PreparedVideo } from "../lib/prepared";
import { captionsForCut, speechWindowsForCut, type Span } from "../lib/timeline";
import { BODY_FONT, DISPLAY_FONT } from "../theme/fonts";
import { FPS, unit } from "../theme/formats";
import { PALETTES, paletteIds, type Palette } from "../theme/palettes";

export const podcastSchema = z.object({
  /** JSON de `npm run prepare-video` (sirve para audio o video). Vacío = modo demostración */
  data: z.string(),
  /** Tramo del episodio a usar, en segundos */
  clipStart: z.number().min(0),
  clipEnd: z.number().min(0),
  showName: z.string(),
  episode: z.string(),
  /** Portada cuadrada dentro de public/ (si el episodio es solo audio) */
  cover: z.string(),
  speaker: z.string(),
  showCaptions: z.boolean(),
  captionLook: z.enum(captionLooks),
  palette: z.enum(paletteIds),
  backdrop: z.enum(["aurora", "grid", "solid"]),
  handle: z.string(),
  ...musicFields,
  prepared: z.any().optional(),
});
export type PodcastProps = z.infer<typeof podcastSchema>;

const rangeOf = (p: PodcastProps, v: PreparedVideo): Span => ({
  start: p.clipStart,
  end: p.clipEnd > 0 ? Math.min(p.clipEnd, v.durationSec) : v.durationSec,
});

export const podcastMetadata: CalculateMetadataFunction<PodcastProps> = async ({ props, abortSignal }) => {
  if (!props.data) return { durationInFrames: 12 * FPS, props: { ...props, prepared: undefined } };
  const prepared = await loadPrepared(props.data, abortSignal);
  const r = rangeOf(props, prepared);
  return { durationInFrames: Math.max(1, Math.round((r.end - r.start) * FPS)), props: { ...props, prepared } };
};

/** Barras simuladas para el modo demostración (sin audio cargado). */
const FakeBars: React.FC<{ palette: Palette; width: number; height: number }> = ({ palette, width, height }) => {
  const frame = useCurrentFrame();
  const bars = 40;
  return (
    <div style={{ width, height, display: "flex", alignItems: "center", gap: width / bars / 3 }}>
      {new Array(bars).fill(0).map((_, i) => {
        const v = 0.25 + 0.75 * Math.abs(Math.sin(frame / 5 + i * 0.7) * Math.cos(frame / 11 + i * 0.3));
        return <div key={i} style={{ flex: 1, height: v * height, borderRadius: 99, background: `linear-gradient(180deg, ${palette.accent2}, ${palette.accent})` }} />;
      })}
    </div>
  );
};

/** Clip de podcast vertical: portada o video, barras de audio, subtítulos y nombre del programa. */
export const Podcast: React.FC<PodcastProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const palette = PALETTES[p.palette];
  const u = unit(width, height);
  const v = p.prepared as PreparedVideo | undefined;
  const r = v ? rangeOf(p, v) : null;
  const isVideo = Boolean(v && v.width > 0);
  const captions = v?.captions && r && p.showCaptions ? captionsForCut(v.captions, [r]) : [];
  const art = Math.min(width * 0.72, height * 0.4);
  const breathe = 1 + drift(frame, 120, 0.012);
  const head = ease(frame, fps, 0, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.base }}>
      <Backdrop palette={palette} variant={p.backdrop} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: u * 14, gap: u * 4 }}>
        <div style={{ textAlign: "center", opacity: head, transform: `translateY(${(1 - head) * -u * 4}px)` }}>
          <div style={{ fontFamily: BODY_FONT, fontWeight: 800, fontSize: u * 3, letterSpacing: "0.25em", textTransform: "uppercase", color: palette.accent }}>
            {p.showName}
          </div>
          <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: u * 5.6, color: palette.ink, marginTop: u, padding: `0 ${u * 6}px` }}>
            {p.episode}
          </div>
        </div>
        <div
          style={{
            width: art,
            height: isVideo ? art * 1.1 : art,
            borderRadius: u * 4,
            overflow: "hidden",
            transform: `scale(${breathe})`,
            boxShadow: `0 ${u * 2}px ${u * 10}px ${palette.accent}55`,
            background: `linear-gradient(135deg, ${palette.accent}, ${palette.accent2})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: art * 0.1,
            color: palette.base,
          }}
        >
          {isVideo && v && r ? (
            <OffthreadVideo src={resolveAsset(v.video)} trimBefore={Math.round(r.start * fps)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : p.cover ? (
            <Img src={resolveAsset(p.cover)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <svg width={art * 0.32} height={art * 0.32} viewBox="0 0 24 24" fill="none" stroke={palette.base} strokeWidth={1.8} strokeLinecap="round">
              <rect x="9" y="3" width="6" height="11" rx="3" fill={palette.base} />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7" />
            </svg>
          )}
        </div>
        {p.speaker && <div style={{ fontFamily: BODY_FONT, fontWeight: 600, fontSize: u * 3.4, color: palette.inkSoft }}>{p.speaker}</div>}
        {v && !isVideo ? (
          <AudioBars src={v.video} palette={palette} width={art} height={u * 12} />
        ) : !v ? (
          <FakeBars palette={palette} width={art} height={u * 12} />
        ) : null}
      </AbsoluteFill>
      {v && !isVideo && r && <Audio src={resolveAsset(v.video)} trimBefore={Math.round(r.start * fps)} />}
      {captions.length > 0 && <Captions captions={captions} palette={palette} look={p.captionLook} position="bottom" />}
      <ProgressLine palette={palette} position="bottom" />
      <Signature handle={p.handle} palette={palette} />
      <Soundtrack src={p.music} volume={p.musicVolume} duckTo={0.15} speech={v && r ? speechWindowsForCut(v.keep, v.captions, [r]) : []} />
    </AbsoluteFill>
  );
};
