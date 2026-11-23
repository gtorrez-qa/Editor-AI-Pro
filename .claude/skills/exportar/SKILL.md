---
name: exportar
description: Exporta los videos terminados — render individual o en lote para varias redes a la vez (TikTok, Reels, Shorts, Instagram, YouTube, LinkedIn, X), formatos, calidad, códecs, GIF, borradores rápidos y especificaciones de cada plataforma. Usar cuando la persona pide renderizar, exportar, "sacalo para todas las redes", o pregunta por calidad o peso del archivo.
---

# Exportar

## Un video

```
npx remotion render <Id> out/<nombre>.mp4 --props=out/<nombre>.props.json
```

## Varias redes a la vez (render en lote)

```
npm run render-batch -- <Id> --props out/<nombre>.props.json --formats vertical,portrait,square,landscape
```

- Se pueden pasar varias composiciones separadas por coma: `Short,Testimonio`.
- `--formats all` (por defecto) exporta los 4 formatos.
- `--out out/campaña` cambia la carpeta.
- `--scale 0.5` para borradores rápidos.
- `--codec h264` (por defecto), `h265`, `vp9` (webm), `prores` (para seguir editando en otro programa) o `gif`.

El mismo diseño se adapta solo a cada formato. En `Clip` se usa la prop `format` (recorta el video original para llenar el cuadro).

Salida: `out/lote/<Id>-<formato>.mp4`.

## Qué formato usar en cada red

| Red | Formato | Tamaño | Duración recomendada |
|---|---|---|---|
| TikTok | `vertical` | 1080×1920 | 15–60 s |
| Instagram Reels | `vertical` | 1080×1920 | 15–90 s |
| YouTube Shorts | `vertical` | 1080×1920 | hasta 60 s |
| Feed de Instagram / Facebook | `portrait` | 1080×1350 | 15–60 s |
| LinkedIn / X | `square` o `landscape` | 1080×1080 / 1920×1080 | 30–90 s |
| YouTube | `landscape` | 1920×1080 | libre |

## Calidad y peso

- Por defecto: H.264, calidad alta, ideal para subir a cualquier red.
- Archivo muy pesado: agregá `--crf=28` (más alto = más liviano; 18–23 es casi sin pérdida).
- Máxima calidad para archivo master: `--codec=prores`.
- GIF para web o mail: `--codec=gif --scale=0.5 --every-nth-frame=2`.

## Antes de exportar la versión final

1. Capturas de 2–3 cuadros clave con `npx remotion still`.
2. Si es largo, un borrador con `--scale=0.5` para revisar ritmo y audio.
3. Confirmá que la música tiene licencia (skill `musica`).

## Marca de agua invisible

Cada video exportado lleva una marca invisible con el ID del dueño (configurable en `src/theme/brand.ts`), firmada con la clave secreta de `.env` (`REMOTION_MARK_KEY`). Si no existe, generala con `npm run generate-key`; sin clave propia se usa una de demostración pública y el render lo avisa. Para verificar hace falta la misma clave con la que se exportó. Para comprobar si un video (incluso descargado de una red social) salió de este editor:

```
npm run verify-mark -- ruta/al/video.mp4 [--owner "Nombre"]
```

Un puntaje mayor a 5,5 confirma la marca. Resiste recompresión y cambio de tamaño; no resiste recortes del cuadro, espejado ni rotación.

Al terminar, decí la ruta de cada archivo, su duración y peso (`ls -la out/...`).
