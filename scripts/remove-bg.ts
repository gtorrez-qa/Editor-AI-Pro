/**
 * Quita el fondo de una imagen y la guarda como PNG transparente en public/cutouts/.
 * Todo corre local (sin claves de API).
 *
 * Uso:
 *   npm run remove-bg -- fotos/zapatilla.jpg [public/cutouts/zapatilla.png]
 */
import { removeBackground } from "@imgly/background-removal-node";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs, PUBLIC_DIR, toPosix } from "./lib/tools";

const { positional } = parseArgs(process.argv.slice(2));
const [input, output] = positional;

const main = async () => {
  if (!input) throw new Error("Falta la imagen. Ejemplo: npm run remove-bg -- fotos/producto.jpg");
  const abs = path.resolve(input);
  if (!existsSync(abs)) throw new Error(`No existe el archivo: ${abs}`);

  const out = output ? path.resolve(output) : path.join(PUBLIC_DIR, "cutouts", `${path.parse(abs).name}.png`);
  await mkdir(path.dirname(out), { recursive: true });

  console.log("• Quitando el fondo (la primera vez tarda un poco más)…");
  const blob = await removeBackground(pathToFileURL(abs).href, {
    output: { format: "image/png" },
  });
  await writeFile(out, Buffer.from(await blob.arrayBuffer()));

  const rel = toPosix(path.relative(PUBLIC_DIR, out));
  console.log(`\n✔ Guardado en ${toPosix(path.relative(process.cwd(), out))}`);
  if (!rel.startsWith("..")) {
    console.log(`  Usalo en "Spotlight" con image = "${rel}"`);
  }
};

main().catch((err) => {
  console.error(`\n✖ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
