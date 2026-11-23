import type { Caption } from "@remotion/captions";

/** Tramo del video original que se conserva, en segundos. */
export type Span = { start: number; end: number };

export const totalSeconds = (spans: Span[]) =>
  spans.reduce((sum, s) => sum + Math.max(0, s.end - s.start), 0);

/**
 * Convierte un instante del video original al instante equivalente en el
 * video ya cortado. Devuelve null si ese instante cae en un tramo eliminado.
 */
export const mapToCut = (t: number, spans: Span[]): number | null => {
  let offset = 0;
  for (const s of spans) {
    if (t < s.start) return null;
    if (t <= s.end) return offset + (t - s.start);
    offset += s.end - s.start;
  }
  return null;
};

/**
 * Momentos con voz en la línea de tiempo final (ms), para bajar la música.
 * Usa los tramos hablados detectados por prepare-video (`speech`), que son precisos.
 * Si no existen, usa las palabras transcritas con una duración máxima por palabra,
 * porque Whisper suele estirar el final de cada palabra hasta la siguiente.
 */
export const speechWindowsForCut = (
  speech: Span[] | null,
  captions: Caption[] | null,
  spans: Span[],
): { startMs: number; endMs: number }[] => {
  if (speech?.length) {
    const out: { startMs: number; endMs: number }[] = [];
    let offset = 0;
    for (const s of spans) {
      for (const k of speech) {
        const a = Math.max(s.start, k.start);
        const b = Math.min(s.end, k.end);
        if (b > a) out.push({ startMs: (offset + a - s.start) * 1000, endMs: (offset + b - s.start) * 1000 });
      }
      offset += s.end - s.start;
    }
    return out;
  }
  if (captions?.length) {
    return captionsForCut(captions, spans).map((c) => ({ startMs: c.startMs, endMs: Math.min(c.endMs, c.startMs + 900) }));
  }
  return [{ startMs: 0, endMs: totalSeconds(spans) * 1000 }];
};

/** Re-ubica los subtítulos en la línea de tiempo del video cortado. */
export const captionsForCut = (captions: Caption[], spans: Span[]): Caption[] => {
  const out: Caption[] = [];
  for (const c of captions) {
    const start = mapToCut(c.startMs / 1000, spans);
    if (start === null) continue;
    const span = spans.find((s) => c.startMs / 1000 >= s.start && c.startMs / 1000 <= s.end)!;
    const endSrc = Math.min(c.endMs / 1000, span.end);
    const end = start + Math.max(0.05, endSrc - c.startMs / 1000);
    out.push({
      ...c,
      startMs: Math.round(start * 1000),
      endMs: Math.round(end * 1000),
      timestampMs: c.timestampMs === null ? null : Math.round(start * 1000),
    });
  }
  return out;
};
