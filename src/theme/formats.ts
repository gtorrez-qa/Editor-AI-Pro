/** Tamaños de salida por plataforma. Todo se renderiza a 30 fps. */
export const FPS = 30;

export const FORMATS = {
  vertical: { width: 1080, height: 1920, label: "TikTok / Reels / Shorts (9:16)" },
  portrait: { width: 1080, height: 1350, label: "Feed de Instagram (4:5)" },
  square: { width: 1080, height: 1080, label: "Cuadrado (1:1)" },
  landscape: { width: 1920, height: 1080, label: "YouTube / web (16:9)" },
} as const;

export type FormatId = keyof typeof FORMATS;
export const formatIds = Object.keys(FORMATS) as [FormatId, ...FormatId[]];

/** Escala tipográfica relativa al lado corto del cuadro. */
export const unit = (width: number, height: number) => Math.min(width, height) / 100;
