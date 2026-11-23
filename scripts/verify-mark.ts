/**
 * Verifica la marca de agua invisible de un video exportado con Editor AI Pro.
 *
 * Uso:
 *   npm run verify-mark -- out/video.mp4 [--owner "Guillermo Torrez"] [--max-frames 900]
 *
 * Lee cuadros del video, los promedia, recupera el identificador de 32 bits grabado
 * y lo compara con el del dueño.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { MARK_KEY } from "../src/blocks/InvisibleMark";
import { decodeField, GRID, highPassCells, idToHex, ownerId, VERIFY_THRESHOLD, verifyId } from "../src/lib/fingerprint";
import { BRAND } from "../src/theme/brand";
import { parseArgs, ROOT } from "./lib/tools";

const PX = 6; // cada celda de la grilla = 6×6 píxeles al analizar
const SIZE = GRID * PX;
/** Recorte por cuadro, en niveles de luminancia (la señal es de ~1–3 niveles). */
const CLIP = 5;

const { positional, flags } = parseArgs(process.argv.slice(2));

/** Lee los cuadros en escala de grises y acumula la luminancia por celda a medida que llegan. */
const accumulateCells = (file: string, maxFrames: number): Promise<{ cells: Float64Array; frames: number }> =>
  new Promise((resolve, reject) => {
    const cli = path.join(ROOT, "node_modules", "@remotion", "cli", "remotion-cli.js");
    const args = [cli, "ffmpeg", "-hide_banner", "-loglevel", "error", "-i", file, "-vf", `scale=${SIZE}:${SIZE}`,
      "-frames:v", String(maxFrames), "-pix_fmt", "gray", "-c:v", "rawvideo", "-f", "image2pipe", "pipe:1"];
    const child = spawn(process.execPath, args, { cwd: ROOT });
    const frameSize = SIZE * SIZE;
    const cells = new Float64Array(GRID * GRID);
    const frameCells = new Float64Array(GRID * GRID);
    let pending: Buffer = Buffer.alloc(0);
    let frames = 0;
    let err = "";
    child.stdout.on("data", (d: Buffer) => {
      pending = pending.length ? Buffer.concat([pending, d]) : d;
      while (pending.length >= frameSize) {
        frameCells.fill(0);
        for (let y = 0; y < SIZE; y++) {
          const row = y * SIZE;
          const cy = Math.floor(y / PX) * GRID;
          for (let x = 0; x < SIZE; x++) frameCells[cy + Math.floor(x / PX)] += pending[row + x];
        }
        for (let c = 0; c < frameCells.length; c++) frameCells[c] /= PX * PX;
        const hp = highPassCells(frameCells, CLIP);
        for (let c = 0; c < cells.length; c++) cells[c] += hp[c];
        frames++;
        pending = pending.subarray(frameSize);
      }
    });
    child.stderr.on("data", (d) => (err += d));
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve({ cells, frames }) : reject(new Error(err || `ffmpeg terminó con código ${code}`))));
  });

const main = async () => {
  const input = positional[0];
  if (!input) throw new Error("Indicá el video. Ejemplo: npm run verify-mark -- out/video.mp4");
  const file = path.resolve(input);
  if (!existsSync(file)) throw new Error(`No existe el archivo: ${file}`);
  const owner = typeof flags.owner === "string" ? flags.owner : BRAND.owner;
  const maxFrames = typeof flags["max-frames"] === "string" ? Number(flags["max-frames"]) : 900;

  console.log("• Leyendo cuadros del video…");
  const { cells, frames } = await accumulateCells(file, maxFrames);
  if (!frames) throw new Error("No se pudieron leer cuadros del video.");
  for (let c = 0; c < cells.length; c++) cells[c] /= frames;

  const result = decodeField(MARK_KEY, cells);
  const expected = ownerId(owner);
  const score = verifyId(result, expected);
  const blindOk = result.checkOk && result.id === expected;

  console.log(`  Cuadros analizados: ${frames}`);
  console.log(`  Dueño verificado: "${owner}" (ID ${idToHex(expected)})`);
  console.log(`  Puntaje de verificación: ${score.toFixed(1)} (umbral ${VERIFY_THRESHOLD}; sin marca ≈ 0 ± 1)`);
  console.log(`  Lectura a ciegas: ${result.idHex} (${result.checkOk ? "control válido" : "control inválido"})`);
  if (score >= VERIFY_THRESHOLD) {
    console.log(`
✔ Marca encontrada: este video fue exportado con Editor AI Pro por ${owner}.`);
  } else if (result.checkOk && !blindOk) {
    console.log(`
⚠ Hay una marca válida, pero de otro dueño (ID ${result.idHex}).`);
  } else {
    console.log(`
✖ No se encontró la marca de "${owner}" (video sin marca, de otro dueño o muy alterado).`);
    process.exitCode = 2;
  }
};

main().catch((err) => {
  console.error(`\n✖ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
