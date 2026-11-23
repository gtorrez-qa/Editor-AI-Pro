import { spawn } from "node:child_process";
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
