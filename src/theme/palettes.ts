export type Palette = {
  /** Fondo principal */
  base: string;
  /** Superficies (tarjetas, cajas de subtítulo) */
  surface: string;
  /** Texto principal */
  ink: string;
  /** Texto secundario */
  inkSoft: string;
  /** Color de acento principal */
  accent: string;
  /** Acento secundario (degradados, brillos) */
  accent2: string;
};

export const PALETTES = {
  brasa: {
    base: "#0f1220",
    surface: "#1c2138",
    ink: "#fff7ef",
    inkSoft: "#c7c1d6",
    accent: "#ff6b4a",
    accent2: "#ffb547",
  },
  oceano: {
    base: "#03151d",
    surface: "#0b2a38",
    ink: "#eefcff",
    inkSoft: "#9cc3cf",
    accent: "#19d3c5",
    accent2: "#5aa9ff",
  },
  lima: {
    base: "#0f130b",
    surface: "#1e2617",
    ink: "#f6ffe9",
    inkSoft: "#b8c7a3",
    accent: "#b6f03c",
    accent2: "#3cf0a0",
  },
  noche: {
    base: "#07070b",
    surface: "#16161f",
    ink: "#ffffff",
    inkSoft: "#a9a9bd",
    accent: "#f43f8e",
    accent2: "#7c5cff",
  },
  papel: {
    base: "#f5efe4",
    surface: "#ffffff",
    ink: "#1d1a16",
    inkSoft: "#6b6257",
    accent: "#e2462f",
    accent2: "#2f6fe2",
  },
} satisfies Record<string, Palette>;

export type PaletteId = keyof typeof PALETTES;
export const paletteIds = Object.keys(PALETTES) as [PaletteId, ...PaletteId[]];
