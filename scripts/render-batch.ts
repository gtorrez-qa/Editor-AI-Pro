/**
 * Render en lote: exporta una o varias composiciones en varios formatos de una sola vez.
 *
 * Uso:
 *   npm run render-batch -- Short                                   (los 4 formatos)
 *   npm run render-batch -- Short,Spotlight --formats vertical,square
 *   npm run render-batch -- Clip --props '{"data":"entrevista.json"}' --formats vertical,landscape
 *   npm run render-batch -- Short --props mis-datos.json --out out/campaña --scale 0.5
 *
 * Opciones:
 *   --formats  vertical,portrait,square,landscape  (o "all", por defecto)
 *   --props    JSON en línea o ruta a un archivo .json con props para todas las composiciones
 *   --out      carpeta de salida (por defecto out/lote)
 *   --scale    escala de resolución (0.5 = mitad, útil para borradores)
 *   --codec    h264 (por defecto) | h265 | vp9 | prores | gif
 */
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, type Codec } from "@remotion/renderer";
import { existsSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { FORMATS, formatIds, type FormatId } from "../src/theme/formats";
import { parseArgs, ROOT, toPosix } from "./lib/tools";

const { positional, flags } = parseArgs(process.argv.slice(2));

const readProps = (): Record<string, unknown> => {
  const raw = flags.props;
  if (typeof raw !== "string") return {};
  const text = existsSync(raw) ? readFileSync(raw, "utf8") : raw;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`--props no es JSON válido ni un archivo existente: ${raw}`);
  }
};

const extensionFor = (codec: Codec) =>
  codec === "vp9" ? "webm" : codec === "prores" ? "mov" : codec === "gif" ? "gif" : "mp4";

const main = async () => {
  const ids = (positional[0] ?? "").split(",").filter(Boolean);
  if (!ids.length) throw new Error("Indicá al menos una composición. Ejemplo: npm run render-batch -- Short");

  const requested =
    typeof flags.formats === "string" && flags.formats !== "all"
      ? (flags.formats.split(",") as FormatId[])
      : formatIds;
  const bad = requested.filter((f) => !(f in FORMATS));
  if (bad.length) throw new Error(`Formatos desconocidos: ${bad.join(", ")}. Válidos: ${formatIds.join(", ")}`);

  const outDir = path.resolve(typeof flags.out === "string" ? flags.out : path.join(ROOT, "out", "lote"));
  const scale = typeof flags.scale === "string" ? Number(flags.scale) : 1;
  const codec = (typeof flags.codec === "string" ? flags.codec : "h264") as Codec;
  const extraProps = readProps();
  await mkdir(outDir, { recursive: true });

  console.log("• Empaquetando el proyecto…");
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts") });

  const results: string[] = [];
  for (const id of ids) {
    for (const format of requested) {
      const size = FORMATS[format];
      // primero se consulta la composición para saber si maneja el formato por props (como "Clip")
      const probe = await selectComposition({ serveUrl, id, inputProps: extraProps });
      const handlesFormat = "format" in (probe.props as Record<string, unknown>);
      const inputProps = handlesFormat ? { ...extraProps, format } : extraProps;
      const composition = handlesFormat
        ? await selectComposition({ serveUrl, id, inputProps })
        : { ...probe, width: size.width, height: size.height };

      const file = path.join(outDir, `${id}-${format}.${extensionFor(codec)}`);
      const label = `${id} · ${format} (${composition.width}×${composition.height})`;
      let last = -1;
      await renderMedia({
        serveUrl,
        composition,
        inputProps,
        codec,
        scale,
        outputLocation: file,
        onProgress: ({ progress }) => {
          const pct = Math.floor(progress * 10) * 10;
          if (pct !== last) {
            last = pct;
            process.stdout.write(`\r• ${label}: ${pct}%   `);
          }
        },
      });
      process.stdout.write("\n");
      results.push(toPosix(path.relative(process.cwd(), file)));
    }
  }

  console.log(`\n✔ ${results.length} video(s) listos:`);
  for (const r of results) console.log(`  ${r}`);
};

main().catch((err) => {
  console.error(`\n✖ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
