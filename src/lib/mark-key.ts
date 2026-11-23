/**
 * Clave secreta de la marca de agua invisible.
 *
 * Cada persona que usa Editor AI Pro debe generar su propia clave (`npm run generate-key`).
 * Se guarda en el archivo .env (que nunca se sube a git) como REMOTION_MARK_KEY.
 *
 * - Sin clave propia se usa DEMO_MARK_KEY, que es pública: cualquiera que lea este código
 *   podría intentar quitar la marca. Sirve solo para probar.
 * - Si perdés la clave, no vas a poder verificar los videos que exportaste con ella.
 *   Guardala en un lugar seguro (gestor de contraseñas).
 */
export const DEMO_MARK_KEY = "editor-ai-pro:demo-public-key";
export const MARK_KEY_ENV = "REMOTION_MARK_KEY";

export const getMarkKey = (env: Record<string, string | undefined>): string => {
  const key = env[MARK_KEY_ENV]?.trim();
  return key && key.length >= 16 ? key : DEMO_MARK_KEY;
};

export const isDemoMarkKey = (key: string) => key === DEMO_MARK_KEY;
