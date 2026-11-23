import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "..", "..");
export const PUBLIC_DIR = path.join(ROOT, "public");
export const CACHE_DIR = path.join(ROOT, ".cache");

type Result = { code: number; stdout: string; stderr: string };

const REMOTION_CLI = path.join(ROOT, "node_modules", "@remotion", "cli", "remotion-cli.js");

/**
 * Ejecuta el ffmpeg / ffprobe que trae Remotion (no hace falta instalarlo aparte).
 * Se lanza con el mismo Node, sin shell, así los argumentos no se interpretan.
 */
export const runTool = (tool: "ffmpeg" | "ffprobe", args: string[]): Promise<Result> =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [REMOTION_CLI, tool, ...args], { cwd: ROOT });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });

/** Lee argumentos estilo --clave valor / --bandera / --no-bandera. */
export const parseArgs = (argv: string[]) => {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--no-")) flags[a.slice(5)] = false;
    else if (a.startsWith("--")) {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[a.slice(2)] = next;
        i++;
      } else flags[a.slice(2)] = true;
    } else positional.push(a);
  }
  return { positional, flags };
};

export const toPosix = (p: string) => p.split(path.sep).join("/");

/** Lee .env y .env.local de la raíz del proyecto (formato CLAVE=valor). */
export const readEnvFile = (): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const name of [".env", ".env.local"]) {
    const file = path.join(ROOT, name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
  return out;
};

/** Variables de entorno para el render: las de .env más las REMOTION_* del sistema. */
export const renderEnv = (): Record<string, string> => {
  const fromSystem = Object.fromEntries(
    Object.entries(process.env).filter(([k, v]) => k.startsWith("REMOTION_") && v !== undefined),
  ) as Record<string, string>;
  return { ...readEnvFile(), ...fromSystem };
};
