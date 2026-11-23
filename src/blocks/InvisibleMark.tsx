import React, { useMemo } from "react";
import { AbsoluteFill, Img } from "remotion";
import { embedField, GRID, ownerId } from "../lib/fingerprint";
import { BRAND } from "../theme/brand";

/**
 * Clave de la huella. Para máxima seguridad, cambiala por un valor privado propio y no la
 * publiques: quien conozca la clave podría intentar quitar la marca.
 */
export const MARK_KEY = "editor-ai-pro:v1";

/** Opacidad máxima del velo (0.012 ≈ 3 niveles de 255): imperceptible y legible tras recomprimir. */
export const MARK_STRENGTH = 0.012;

/** Píxeles por celda en la imagen del velo. */
const CELL_PX = 8;
/** Opacidad de cada grano (los granos son pocos; su promedio da la intensidad buscada). */
const GRAIN_ALPHA = 10 / 255;
/** Probabilidad de grano neutro (claro u oscuro por igual) que camufla la estructura. */
const CAMO = 0.12;

/**
 * Construye la imagen del velo una sola vez, con difuminado (dithering):
 * cada celda se dibuja como granos sueltos cuya densidad codifica el valor de la celda.
 * Así no aparecen escalones ni bloques visibles, pero el promedio por celda se conserva.
 */
const buildMarkImage = (owner: string, strength: number): string => {
  if (typeof document === "undefined") return "";
  const field = embedField(MARK_KEY, ownerId(owner));
  const size = GRID * CELL_PX;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(size, size);
  let seed = 0x9e3779b9;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  const alpha = Math.round(GRAIN_ALPHA * 255);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = field[Math.floor(y / CELL_PX) * GRID + Math.floor(x / CELL_PX)];
      const signal = (Math.abs(v) * strength) / GRAIN_ALPHA; // probabilidad de grano con el signo de la celda
      const r = rand();
      let tone = -1;
      if (r < signal) tone = v >= 0 ? 255 : 0;
      else if (r < signal + CAMO) tone = 255;
      else if (r < signal + 2 * CAMO) tone = 0;
      if (tone < 0) continue;
      const o = (y * size + x) * 4;
      img.data[o] = tone;
      img.data[o + 1] = tone;
      img.data[o + 2] = tone;
      img.data[o + 3] = alpha;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
};

/** Envuelve una composición para que todos sus cuadros lleven la marca invisible. */
export function withMark<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  const Marked: React.FC<P> = (props) => (
    <>
      <Component {...props} />
      {BRAND.invisibleMark && <InvisibleMark />}
    </>
  );
  Marked.displayName = `withMark(${Component.displayName ?? Component.name})`;
  return Marked;
}

/**
 * Marca de agua invisible con el identificador del dueño.
 * Se verifica con: npm run verify-mark -- out/video.mp4
 */
export const InvisibleMark: React.FC<{ owner?: string; strength?: number }> = ({
  owner = BRAND.owner,
  strength = MARK_STRENGTH,
}) => {
  const src = useMemo(() => buildMarkImage(owner, strength), [owner, strength]);
  if (!src || strength <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img src={src} style={{ width: "100%", height: "100%", imageRendering: "auto" }} />
    </AbsoluteFill>
  );
};
