---
name: remotion-experto
description: Reglas técnicas para escribir componentes y composiciones de Remotion correctos y rápidos en este proyecto — animación por cuadro, Sequence, assets, fuentes, esquemas zod, calculateMetadata, video y audio, rendimiento y errores típicos. Usar al crear o modificar código en src/, o cuando un render falla, parpadea o sale distinto a la vista previa.
---

# Remotion en Editor AI Pro

## Reglas que no se rompen

1. **Todo depende de `useCurrentFrame()`.** Nada de `setTimeout`, `setInterval`, transiciones o animaciones CSS, `Date.now()` ni `Math.random()`. Para azar: `random("semilla")` de `remotion`.
2. **Tamaños relativos:** usá `unit(width, height)` de `theme/formats.ts` para que el mismo componente sirva en todos los formatos.
3. **Archivos locales con `staticFile()`** (o `resolveAsset()`, que también acepta URLs). Los archivos van en `public/`.
4. **Video con `<OffthreadVideo>`** (más preciso en render) y recorte con `trimBefore` (en cuadros), no `startFrom`.
5. **Audio con `<Audio>`**; volumen dinámico con una función `volume={(f) => ...}`.
6. **Fuentes** solo desde `theme/fonts.ts` (`@remotion/google-fonts`), así se esperan antes de renderizar.

## Estructura de una composición nueva

```tsx
export const miSchema = z.object({ titulo: z.string(), palette: z.enum(paletteIds), ...musicFields });
export type MiProps = z.infer<typeof miSchema>;
export const miMetadata: CalculateMetadataFunction<MiProps> = ({ props }) => ({ durationInFrames: ... });
export const MiVideo: React.FC<MiProps> = (p) => { ... };
```

Registrala en `src/videos/index.tsx`:

```tsx
<Composition id="MiVideo" component={MiVideo} schema={miSchema} defaultProps={...}
  calculateMetadata={miMetadata} fps={FPS} durationInFrames={300} {...FORMATS.vertical} />
```

- El esquema `zod` hace que las props se puedan editar en el Studio y validar en `--props`.
- Si la duración depende de los datos (cantidad de ítems, largo de un video), calculala en `calculateMetadata`. Si necesita leer un archivo, hacé `fetch(staticFile(...))` ahí, con `abortSignal`.

## Tiempo

- `<Sequence from={x} durationInFrames={y}>` reinicia `useCurrentFrame()` a 0 adentro: animá cada escena desde su propio cero.
- Para escenas con transición: `TransitionSeries` + `makeTransition()` de `blocks/Transitions.tsx`. La duración total = suma de escenas − suma de transiciones.
- `premountFor={fps}` en Sequences con video evita cuadros negros al entrar.

## Rendimiento

- Evitá `filter: blur()` grandes en muchos elementos; preferí degradados radiales.
- Memorizá cálculos pesados por render con `useMemo` (ej. `createTikTokStyleCaptions`).
- Para borradores: `--scale=0.5` o `--frames=0-90`.

## Verificar

- `npm run typecheck` después de cada cambio.
- `npx remotion still <Id> out/x.png --frame=N` en los momentos clave antes de un render largo.
- `npx remotion compositions` lista todo lo registrado con su duración.

## Errores típicos

| Síntoma | Causa probable |
|---|---|
| Texto con otra fuente en el render | Fuente no cargada desde `theme/fonts.ts` |
| Parpadeo o cuadros distintos entre renders | Uso de `Math.random()` o tiempo real |
| "No composition with the ID" | Falta registrarla o el id tiene espacios/acentos |
| Video negro al principio de una escena | Falta `premountFor` |
| Props ignoradas en `--props` | El nombre no coincide con el esquema |
