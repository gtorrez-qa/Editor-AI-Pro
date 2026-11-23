/**
 * Prepara un video propio para editarlo en la composición "Clip":
 *   1. Lee duración, tamaño y fps.
 *   2. Transcribe el audio con Whisper (local, sin claves de API) → subtítulos palabra por palabra.
 *   3. Detecta silencios y calcula los tramos a conservar.
 * Guarda todo en public/data/<nombre>.json.
 *
 * Uso:
 *   npm run prepare-video -- public/media/entrevista.mp4 [opciones]
 *
 * Opciones:
 *   --lang es            Idioma del audio (por defecto: detección automática)
 *   --model small        Modelo de Whisper: tiny | base | small | medium | large-v3-turbo (por defecto small)
 *   --no-captions        No transcribir
 *   --no-cuts            No detectar silencios
 *   --noise -35          Umbral de silencio en dB (más negativo = más estricto)
 *   --min-silence 0.6    Duración mínima de un silencio para cortarlo, en segundos
 *   --pad 0.15           Margen que se deja antes y después de cada tramo hablado, en segundos
 */
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
  type Language,
  type WhisperModel,
} from "@remotion/install-whisper-cpp";
import { existsSync } from "node:fs";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PreparedVideo } from "../src/lib/prepared";
import type { Span } from "../src/lib/timeline";
import { CACHE_DIR, parseArgs, PUBLIC_DIR, runTool, toPosix } from "./lib/tools";

const WHISPER_VERSION = "1.5.5";

const { positional, flags } = parseArgs(process.argv.slice(2));
const input = positional[0];
if (!input) {
  console.error("Falta el video. Ejemplo: npm run prepare-video -- public/media/entrevista.mp4");
  process.exit(1);
}

const num = (key: string, fallback: number) => (typeof flags[key] === "string" ? Number(flags[key]) : fallback);

const probe = async (file: string) => {
  const r = await runTool("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", file]);
  if (r.code !== 0) throw new Error(`ffprobe no pudo leer el archivo:\n${r.stderr}`);
  const info = JSON.parse(r.stdout);
  const v = info.streams.find((s: { codec_type: string }) => s.codec_type === "video");
  if (!v) throw new Error("El archivo no tiene pista de video.");
  const [n, d] = String(v.avg_frame_rate || v.r_frame_rate || "30/1").split("/").map(Number);
  const rotation = Math.abs(Number(v.tags?.rotate ?? v.side_data_list?.[0]?.rotation ?? 0));
  const swap = rotation === 90 || rotation === 270;
  return {
    durationSec: Number(info.format.duration ?? v.duration),
    width: swap ? v.height : v.width,
    height: swap ? v.width : v.height,
    fps: d ? n / d : 30,
    hasAudio: info.streams.some((s: { codec_type: string }) => s.codec_type === "audio"),
  };
};

const detectSpeech = async (file: string, duration: number): Promise<Span[]> => {
  const noise = num("noise", -35);
  const minSilence = num("min-silence", 0.6);
  const pad = num("pad", 0.15);
  const r = await runTool("ffmpeg", [
    "-hide_banner",
    "-i",
    file,
    "-vn",
    "-af",
    `silencedetect=noise=${noise}dB:d=${minSilence}`,
    "-f",
    "null",
    "-",
  ]);
  if (r.code !== 0) throw new Error(`No se pudieron detectar los silencios:\n${r.stderr.slice(-800)}`);
  const silences: Span[] = [];
  let open: number | null = null;
  for (const line of r.stderr.split(/\r?\n/)) {
    const s = line.match(/silence_start: (-?[\d.]+)/);
    const e = line.match(/silence_end: ([\d.]+)/);
    if (s) open = Math.max(0, Number(s[1]));
    if (e && open !== null) {
      silences.push({ start: open, end: Number(e[1]) });
      open = null;
    }
  }
  if (open !== null) silences.push({ start: open, end: duration });

  // tramos hablados = complemento de los silencios, con margen
  const keep: Span[] = [];
  let cursor = 0;
  for (const s of silences) {
    if (s.start > cursor) keep.push({ start: cursor, end: s.start });
    cursor = s.end;
  }
  if (cursor < duration) keep.push({ start: cursor, end: duration });

  const padded = keep
    .map((k) => ({ start: Math.max(0, k.start - pad), end: Math.min(duration, k.end + pad) }))
    .filter((k) => k.end - k.start >= 0.2);

  // unir tramos que se pisan por el margen
  const merged: Span[] = [];
  for (const k of padded) {
    const last = merged[merged.length - 1];
    if (last && k.start <= last.end) last.end = Math.max(last.end, k.end);
    else merged.push({ ...k });
  }
  return merged.map((k) => ({ start: +k.start.toFixed(3), end: +k.end.toFixed(3) }));
};

const transcribeAudio = async (file: string, base: string) => {
  const whisperDir = path.join(CACHE_DIR, "whisper");
  const model = (typeof flags.model === "string" ? flags.model : "small") as WhisperModel;
  const lang = typeof flags.lang === "string" ? (flags.lang as Language) : null;

  await mkdir(CACHE_DIR, { recursive: true });
  const wav = path.join(CACHE_DIR, `${base}.16k.wav`);
  const r = await runTool("ffmpeg", ["-y", "-hide_banner", "-i", file, "-vn", "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav]);
  if (r.code !== 0) throw new Error(`No se pudo extraer el audio:\n${r.stderr.slice(-800)}`);

  console.log("• Preparando Whisper (la primera vez descarga el programa y el modelo)…");
  await installWhisperCpp({ to: whisperDir, version: WHISPER_VERSION, printOutput: false });
  await downloadWhisperModel({ model, folder: whisperDir, printOutput: false });

  console.log(`• Transcribiendo con el modelo "${model}"${lang ? ` en "${lang}"` : ""}…`);
  const output = await transcribe({
    inputPath: wav,
    whisperPath: whisperDir,
    whisperCppVersion: WHISPER_VERSION,
    model,
    tokenLevelTimestamps: true,
    language: lang,
    splitOnWord: true,
    printOutput: false,
  });
  return toCaptions({ whisperCppOutput: output }).captions;
};

const main = async () => {
  const abs = path.resolve(input);
  if (!existsSync(abs)) throw new Error(`No existe el archivo: ${abs}`);

  // el video tiene que estar dentro de public/ para que Remotion lo pueda leer
  let inPublic = abs;
  const relToPublic = path.relative(PUBLIC_DIR, abs);
  if (relToPublic.startsWith("..") || path.isAbsolute(relToPublic)) {
    inPublic = path.join(PUBLIC_DIR, "media", path.basename(abs));
    await mkdir(path.dirname(inPublic), { recursive: true });
    await copyFile(abs, inPublic);
    console.log(`• Copié el video a ${toPosix(path.relative(process.cwd(), inPublic))}`);
  }
  const base = path.parse(abs).name;

  console.log("• Leyendo información del video…");
  const meta = await probe(inPublic);

  const wantCaptions = flags.captions !== false && meta.hasAudio;
  const wantCuts = flags.cuts !== false && meta.hasAudio;

  const captions = wantCaptions ? await transcribeAudio(inPublic, base) : null;
  if (wantCuts) console.log("• Buscando silencios…");
  const keep = wantCuts ? await detectSpeech(inPublic, meta.durationSec) : null;

  const result: PreparedVideo = {
    video: toPosix(path.relative(PUBLIC_DIR, inPublic)),
    durationSec: +meta.durationSec.toFixed(3),
    width: meta.width,
    height: meta.height,
    fps: +meta.fps.toFixed(3),
    captions,
    keep,
    createdAt: new Date().toISOString(),
  };

  const outFile = path.join(PUBLIC_DIR, "data", `${base}.json`);
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(result, null, 2));

  const kept = keep ? keep.reduce((s, k) => s + k.end - k.start, 0) : meta.durationSec;
  console.log("\n✔ Listo");
  console.log(`  Archivo:     public/data/${base}.json`);
  console.log(`  Duración:    ${meta.durationSec.toFixed(1)} s → ${kept.toFixed(1)} s sin silencios`);
  console.log(`  Subtítulos:  ${captions ? `${captions.length} palabras` : "no"}`);
  console.log(`\n  Abrí el Studio (npm run studio), elegí "Clip" y poné data = "${base}.json"`);
  console.log(
    `  O renderizá directo: npx remotion render Clip out/${base}.mp4 --props='{"data":"${base}.json"}'`,
  );
};

main().catch((err) => {
  console.error(`\n✖ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
