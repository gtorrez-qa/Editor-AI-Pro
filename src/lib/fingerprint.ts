/**
 * Huella invisible de Editor AI Pro.
 *
 * Diseño (multi-bit, por espectro ensanchado con códigos distintos por bit):
 * - El cuadro se divide en una grilla de GRID×GRID celdas.
 * - El mensaje son 40 bits: un identificador de 32 bits del dueño + 8 bits de control (CRC-8).
 * - Cada bit tiene su propio patrón pseudoaleatorio ±1 sobre las celdas, derivado de la clave.
 * - El patrón final es la suma de los 40 patrones, cada uno con signo según el valor del bit.
 *   Se pinta como un velo blanco/negro de opacidad mínima (imperceptible).
 * - El verificador promedia muchos cuadros (el contenido en movimiento se cancela),
 *   correlaciona con cada patrón y recupera los 40 bits. Si el CRC coincide, lee el
 *   identificador y lo compara con el del dueño.
 *
 * Este archivo no usa el DOM: lo comparten el componente que la dibuja y el script verificador.
 */

export const GRID = 64;
export const ID_BITS = 32;
export const CHECK_BITS = 8;
export const TOTAL_BITS = ID_BITS + CHECK_BITS;

/** Hash FNV-1a de 32 bits. */
export const hash32 = (text: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

/** Identificador de 32 bits del dueño, mostrado en hexadecimal. */
export const ownerId = (owner: string) => hash32(`editor-ai-pro/owner/${owner.trim().toLowerCase()}`);
export const idToHex = (id: number) => id.toString(16).padStart(8, "0").toUpperCase();

/** CRC-8 (polinomio 0x07) sobre los 4 bytes del identificador. */
export const crc8 = (id: number): number => {
  let crc = 0;
  for (let b = 3; b >= 0; b--) {
    crc ^= (id >>> (b * 8)) & 0xff;
    for (let k = 0; k < 8; k++) crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
  }
  return crc;
};

/** Bits del mensaje (1 / -1): 32 del identificador + 8 de control. */
export const messageBits = (id: number): number[] => {
  const check = crc8(id);
  const bits: number[] = [];
  for (let i = ID_BITS - 1; i >= 0; i--) bits.push((id >>> i) & 1 ? 1 : -1);
  for (let i = CHECK_BITS - 1; i >= 0; i--) bits.push((check >>> i) & 1 ? 1 : -1);
  return bits;
};

/** Generador pseudoaleatorio determinista (mulberry32). */
const prng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Patrón ±1 del bit `bit` para la clave dada (GRID×GRID valores, por filas). */
export const bitPattern = (key: string, bit: number): Int8Array => {
  const next = prng(hash32(`${key}#${bit}`));
  const out = new Int8Array(GRID * GRID);
  for (let i = 0; i < out.length; i++) out[i] = next() < 0.5 ? -1 : 1;
  return out;
};

/**
 * Campo a dibujar: un valor por celda en el rango [-1, 1].
 * Positivo = aclarar, negativo = oscurecer.
 */
export const embedField = (key: string, id: number): Float32Array => {
  const bits = messageBits(id);
  const field = new Float32Array(GRID * GRID);
  bits.forEach((b, i) => {
    const p = bitPattern(key, i);
    for (let c = 0; c < field.length; c++) field[c] += b * p[c];
  });
  // normalizar: la suma de 40 patrones ±1 tiene desvío ~√40; recortar a ±2.5σ
  const sigma = Math.sqrt(TOTAL_BITS);
  for (let c = 0; c < field.length; c++) field[c] = Math.max(-1, Math.min(1, field[c] / (2.5 * sigma)));
  return field;
};

export type DecodeResult = {
  bits: number[];
  id: number;
  idHex: string;
  checkOk: boolean;
  /** Señal/ruido: ~0.8 es azar puro; por encima de ~3 la lectura es confiable */
  strength: number;
  /** Puntaje z de cada bit (correlación normalizada × √N) */
  z: number[];
};

/**
 * Verificación dirigida: ¿está la huella de este identificador?
 * Combina los 40 bits en un solo puntaje z (≈ 0 ± 1 si no hay marca o es de otro dueño).
 * Mucho más resistente que la lectura a ciegas cuando el video fue recomprimido.
 */
export const verifyId = (decoded: DecodeResult, id: number): number => {
  const expected = messageBits(id);
  const sum = expected.reduce((acc, b, i) => acc + b * decoded.z[i], 0);
  return sum / Math.sqrt(expected.length);
};

/** Umbral del puntaje z para afirmar que la marca está (probabilidad de falso positivo < 1 en 10 millones). */
export const VERIFY_THRESHOLD = 5.5;

/**
 * Filtro paso-alto por celda con recorte: resta el promedio local (5×5 celdas) para eliminar
 * los degradados del contenido y limita cada valor a ±clip, para que bordes y textos (que
 * difieren en cientos de niveles) no tapen la señal, que es de pocos niveles.
 */
export const highPassCells = (cells: ArrayLike<number>, clip: number): Float64Array => {
  const hp = new Float64Array(GRID * GRID);
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const yy = y + dy;
          const xx = x + dx;
          if (yy < 0 || xx < 0 || yy >= GRID || xx >= GRID) continue;
          sum += cells[yy * GRID + xx];
          n++;
        }
      }
      const v = cells[y * GRID + x] - sum / n;
      hp[y * GRID + x] = Math.max(-clip, Math.min(clip, v));
    }
  }
  return hp;
};

/**
 * Recupera el mensaje a partir del campo filtrado (promedio de highPassCells de muchos cuadros).
 */
export const decodeField = (key: string, hp: Float64Array): DecodeResult => {
  let energy = 0;
  for (const v of hp) energy += v * v;
  const norm = Math.sqrt(energy * hp.length) || 1;

  const scores: number[] = [];
  for (let i = 0; i < TOTAL_BITS; i++) {
    const p = bitPattern(key, i);
    let s = 0;
    for (let c = 0; c < hp.length; c++) s += hp[c] * p[c];
    scores.push(s / norm);
  }
  const bits = scores.map((s) => (s >= 0 ? 1 : -1));
  let id = 0;
  for (let i = 0; i < ID_BITS; i++) id = ((id << 1) | (bits[i] > 0 ? 1 : 0)) >>> 0;
  let check = 0;
  for (let i = 0; i < CHECK_BITS; i++) check = (check << 1) | (bits[ID_BITS + i] > 0 ? 1 : 0);
  // relación señal/ruido aproximada: correlación media frente a la esperada por azar (1/√N)
  const strength = (scores.reduce((acc, v) => acc + Math.abs(v), 0) / scores.length) * Math.sqrt(hp.length);
  const z = scores.map((v) => v * Math.sqrt(hp.length));
  return { bits, id, idHex: idToHex(id), checkOk: crc8(id) === check, strength, z };
};
