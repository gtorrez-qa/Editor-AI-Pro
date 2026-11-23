/**
 * Genera una pista de música de prueba 100 % sintetizada (sin derechos de terceros)
 * para probar la música de fondo sin tener que conseguir un tema.
 *
 * Uso:
 *   npm run demo-music [-- --bpm 100 --seconds 32 --out public/music/demo.wav]
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, PUBLIC_DIR, toPosix } from "./lib/tools";

const { flags } = parseArgs(process.argv.slice(2));
const RATE = 44100;
const bpm = Number(flags.bpm ?? 100);
const seconds = Number(flags.seconds ?? 32);
const out = path.resolve(typeof flags.out === "string" ? flags.out : path.join(PUBLIC_DIR, "music", "demo.wav"));

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);
// progresión I–V–vi–IV en Do mayor
const chords = [
  [48, 60, 64, 67],
  [43, 59, 62, 67],
  [45, 60, 64, 69],
  [41, 60, 65, 69],
];
const beat = 60 / bpm;
const bar = beat * 4;
const total = Math.floor(seconds * RATE);
const left = new Float32Array(total);
const right = new Float32Array(total);

for (let i = 0; i < total; i++) {
  const t = i / RATE;
  const chord = chords[Math.floor(t / bar) % chords.length];
  const tb = t % beat;

  // colchón suave (pad) con leve desafinación estéreo
  let padL = 0;
  let padR = 0;
  for (const n of chord.slice(1)) {
    const f = midi(n);
    padL += Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.003 * t);
    padR += Math.sin(2 * Math.PI * f * 1.002 * t) + 0.3 * Math.sin(2 * Math.PI * f * 1.997 * t);
  }
  const swell = 0.75 + 0.25 * Math.sin((2 * Math.PI * t) / (bar * 2));

  // bajo en cada tiempo
  const bassEnv = Math.exp(-tb * 5);
  const bass = Math.sin(2 * Math.PI * midi(chord[0] - 12) * t) * bassEnv;

  // arpegio en corcheas
  const eighth = beat / 2;
  const step = Math.floor(t / eighth);
  const arpNote = chord[1 + (step % 3)] + 12;
  const arpEnv = Math.exp(-(t % eighth) * 9);
  const arp = Math.sin(2 * Math.PI * midi(arpNote) * t) * arpEnv;

  // golpe suave tipo bombo en 1 y 3, y "hat" de ruido en contratiempos
  const beatIdx = Math.floor(t / beat) % 4;
  const kick = beatIdx % 2 === 0 ? Math.sin(2 * Math.PI * (55 + 90 * Math.exp(-tb * 30)) * tb) * Math.exp(-tb * 9) : 0;
  const offbeat = (t + eighth) % beat;
  const hat = (Math.random() * 2 - 1) * Math.exp(-offbeat * 60) * 0.5;

  const common = 0.32 * bass + 0.5 * kick + 0.06 * hat;
  left[i] = 0.07 * padL * swell + 0.12 * arp + common;
  right[i] = 0.07 * padR * swell + 0.1 * arp + common;
}

// fundido en los bordes para que el loop no haga clic
const edge = Math.floor(0.05 * RATE);
for (let i = 0; i < edge; i++) {
  const g = i / edge;
  left[i] *= g;
  right[i] *= g;
  left[total - 1 - i] *= g;
  right[total - 1 - i] *= g;
}

let peak = 0;
for (let i = 0; i < total; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
const gain = 0.85 / peak;
const data = Buffer.alloc(total * 4);
for (let i = 0; i < total; i++) {
  data.writeInt16LE(Math.round(left[i] * gain * 32767), i * 4);
  data.writeInt16LE(Math.round(right[i] * gain * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

const save = async () => {
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, Buffer.concat([header, data]));
  const rel = toPosix(path.relative(PUBLIC_DIR, out));
  console.log(`✔ Música de prueba guardada en ${toPosix(path.relative(process.cwd(), out))}`);
  console.log(`  Usala con music = "${rel}"`);
};
save();
