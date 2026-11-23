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
  /** Cálido y suave: gastronomía, viajes, estilo de vida */
  atardecer: {
    base: "#1f0f1a",
    surface: "#3a1830",
    ink: "#fff3ec",
    inkSoft: "#e3bfc0",
    accent: "#ff8a5b",
    accent2: "#ff4f8b",
  },
  /** Fresco y limpio, fondo claro: salud, bienestar, educación */
  menta: {
    base: "#eefaf5",
    surface: "#ffffff",
    ink: "#0f2a22",
    inkSoft: "#4f6f64",
    accent: "#0b8466",
    accent2: "#2c7be5",
  },
  /** Negro y dorado: lujo, joyería, eventos */
  oro: {
    base: "#0b0a08",
    surface: "#1c1914",
    ink: "#f8f1e1",
    inkSoft: "#bcae90",
    accent: "#d9b45b",
    accent2: "#f3dc9b",
  },
  /** Azules fríos y blancos: tecnología, finanzas, corporativo */
  hielo: {
    base: "#0a1324",
    surface: "#132342",
    ink: "#f2f7ff",
    inkSoft: "#9fb3d1",
    accent: "#6cb6ff",
    accent2: "#b5f0ff",
  },
  /** Violetas intensos: gaming, música, nocturno */
  uva: {
    base: "#12061f",
    surface: "#24103d",
    ink: "#f7f0ff",
    inkSoft: "#bba6d9",
    accent: "#b15cff",
    accent2: "#ffcc4d",
  },
} satisfies Record<string, Palette>;

export type PaletteId = keyof typeof PALETTES;
export const paletteIds = Object.keys(PALETTES) as [PaletteId, ...PaletteId[]];
