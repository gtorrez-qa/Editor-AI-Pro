import type { Caption } from "@remotion/captions";
import { staticFile } from "remotion";
import type { Span } from "./timeline";

/**
 * Resultado de `npm run prepare-video`: metadatos, subtítulos y tramos a
 * conservar de un video. Se guarda en public/data/<nombre>.json.
 */
export type PreparedVideo = {
  /** Ruta del video dentro de public/ (ej. "media/entrevista.mp4") */
  video: string;
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  captions: Caption[] | null;
  keep: Span[] | null;
  createdAt: string;
};

export const loadPrepared = async (file: string, signal?: AbortSignal): Promise<PreparedVideo> => {
  const res = await fetch(staticFile(`data/${file}`), { signal });
  if (!res.ok) {
    throw new Error(
      `No encontré public/data/${file}. Prepará el video primero con: npm run prepare-video -- <ruta-del-video>`,
    );
  }
  return (await res.json()) as PreparedVideo;
};

/** Acepta rutas de public/ o URLs completas. */
export const resolveAsset = (src: string) => (/^(https?:|data:|blob:)/.test(src) ? src : staticFile(src));
