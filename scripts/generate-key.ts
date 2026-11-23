/**
 * Genera la clave secreta de la marca de agua invisible y la guarda en .env.
 *
 * Uso:
 *   npm run generate-key            (no pisa una clave existente)
 *   npm run generate-key -- --force (reemplaza la clave: los videos viejos ya no se podrán verificar)
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MARK_KEY_ENV } from "../src/lib/mark-key";
import { parseArgs, readEnvFile, ROOT } from "./lib/tools";

const { flags } = parseArgs(process.argv.slice(2));
const envFile = path.join(ROOT, ".env");
const existing = readEnvFile()[MARK_KEY_ENV];

if (existing && flags.force !== true) {
  console.log(`✔ Ya tenés una clave en .env (${MARK_KEY_ENV}). No se cambió nada.`);
  console.log("  Para reemplazarla: npm run generate-key -- --force");
  console.log("  Atención: los videos exportados con la clave anterior ya no se podrán verificar con la nueva.");
  process.exit(0);
}

const key = randomBytes(32).toString("base64url");
const line = `${MARK_KEY_ENV}=${key}`;
let content = existsSync(envFile) ? readFileSync(envFile, "utf8") : "";
if (new RegExp(`^\\s*${MARK_KEY_ENV}\\s*=`, "m").test(content)) {
  content = content.replace(new RegExp(`^\\s*${MARK_KEY_ENV}\\s*=.*$`, "m"), line);
} else {
  if (content && !content.endsWith("\n")) content += "\n";
  content += `# Clave secreta de la marca de agua invisible. NO la compartas ni la subas a git.\n${line}\n`;
}
writeFileSync(envFile, content);

console.log("✔ Clave generada y guardada en .env");
console.log("");
console.log("  IMPORTANTE:");
console.log("  - Guardá una copia de la clave en un lugar seguro (por ejemplo, un gestor de contraseñas).");
console.log("    Si la perdés, no vas a poder verificar los videos que exportes con ella.");
console.log("  - No la compartas ni la subas a GitHub (.env ya está excluido de git).");
console.log("  - Para verla: abrí el archivo .env en la carpeta del proyecto.");
