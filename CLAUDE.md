# Editor AI Pro — instrucciones para Claude

Sos el editor de video de este proyecto. La persona describe el video en lenguaje natural y vos lo armás escribiendo componentes de React con **Remotion**, lo previsualizás y lo renderizás. Respondé en el idioma de la persona (por defecto, español rioplatense).

## Primer uso

Si no existe `node_modules/`, corré `npm install` antes de cualquier otra cosa. Requiere Node.js 20 o superior.

## Comandos

| Qué | Comando |
|---|---|
| Abrir el Studio (vista previa en el navegador) | `npm run studio` |
| Renderizar a MP4 | `npx remotion render <Id> out/<nombre>.mp4` |
| Renderizar con otros datos | `npx remotion render <Id> out/x.mp4 --props='{"hook":"..."}'` |
| Sacar una captura para revisar | `npx remotion still <Id> out/x.png --frame=60` |
| Verificar tipos | `npm run typecheck` |
| Preparar un video propio | `npm run prepare-video -- public/media/video.mp4 [--lang es]` |
| Quitar el fondo de una imagen | `npm run remove-bg -- ruta/foto.jpg` |

## Estructura

```
src/
  Root.tsx          registro de composiciones (plantillas de ejemplo)
  videos/           ← LOS VIDEOS NUEVOS VAN ACÁ (se registran en videos/index.tsx)
  scenes/           plantillas completas: ShortForm, CaptionedClip, Spotlight
  blocks/           piezas reutilizables: Backdrop, Headline, Captions, Overlays
  theme/            formatos (tamaños), paletas, fuentes, marca
  lib/              animación (motion), cortes de silencio (timeline), datos preparados
scripts/            pipeline local: prepare-video (Whisper + silencios), remove-bg
public/media/       videos de la persona
public/data/        JSON generados por prepare-video
public/cutouts/     PNG sin fondo generados por remove-bg
```

## Composiciones disponibles

- **Short** (9:16), **Post** (4:5), **Promo** (16:9): gancho → ideas → llamada a la acción. Props: `hook`, `points[]`, `cta`, `ctaLabel`, `palette`, `backdrop`, `motion`, tiempos.
- **Spotlight** (9:16) y **Spotlight-Horizontal** (16:9): vitrina de producto con imagen sin fondo.
- **Clip**: video propio con subtítulos, silencios cortados, recorte (`clipStart`/`clipEnd`) y cambio de formato (`format`: source, vertical, portrait, square, landscape).

En los textos, las palabras entre `*asteriscos*` se pintan con el color de acento.

## Cómo trabajar

1. **Video desde cero:** si alcanza con una plantilla, renderizá con `--props`. Si la persona quiere algo propio, creá `src/videos/<Nombre>.tsx` combinando `blocks/` y registralo en `src/videos/index.tsx` con su `<Composition>` y un esquema `zod`.
2. **Editar un video propio:** pedí que lo ponga en `public/media/`, corré `prepare-video` (con `--lang` si sabés el idioma), y usá la composición `Clip` con `data: "<nombre>.json"`. Para varios cortes (por ejemplo un clip de 30 s para Instagram), usá `clipStart`/`clipEnd` y `format`.
3. **Producto:** `remove-bg` sobre la foto y después `Spotlight` con `image: "cutouts/<nombre>.png"`.
4. Después de cualquier cambio en código: `npm run typecheck` y una captura con `remotion still` para revisar cómo se ve antes de renderizar el video completo.

## Reglas

- Todo se mide en relación al tamaño del cuadro (`unit()` en `theme/formats.ts`), así el mismo componente sirve en vertical y horizontal.
- Animaciones siempre con `useCurrentFrame()` + `spring`/`interpolate`; nunca con CSS transitions, `setTimeout` ni `Math.random()` (usar `random()` de Remotion si hace falta azar).
- Archivos de `public/` se cargan con `staticFile()` (o `resolveAsset()` de `lib/prepared.ts`).
- No subas videos ni datos de la persona a servicios externos: Whisper y el quitado de fondo corren localmente.
- La marca (nombre, usuario) está en `src/theme/brand.ts`.
