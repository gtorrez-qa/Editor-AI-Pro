---
name: editar-video
description: Edita un video o audio propio de la persona — subtítulos automáticos, corte de silencios, recortes, cambio de formato (horizontal a vertical), título, cartel con nombre (lower third), música de fondo y clips de podcast. Usar cuando la persona trae una grabación o pide subtitular, cortar, recortar o adaptar un video existente.
---

# Editar un video propio

## 1. Ubicar el archivo

El video o audio tiene que estar dentro de `public/media/`. Si la persona da otra ruta, `prepare-video` lo copia solo. Si no dijo cuál, listá `public/media/` y preguntá.

## 2. Preparar (análisis local)

```
npm run prepare-video -- public/media/<archivo> --lang es
```

- `--lang`: idioma del audio (`es`, `en`, `pt`…). Si no lo sabés, omitilo y Whisper lo detecta.
- `--model`: `small` por defecto (buena calidad). `tiny` o `base` para probar rápido; `medium` o `large-v3-turbo` para audio difícil (ruido, acentos). La primera vez descarga el modelo.
- `--noise -35` / `--min-silence 0.6` / `--pad 0.15`: ajustan el corte de silencios. Si corta palabras, subí `--pad` a 0.25; si deja pausas largas, bajá `--min-silence` a 0.4.
- `--no-captions` / `--no-cuts`: saltean un paso.

Genera `public/data/<nombre>.json`. Revisá en la salida cuántas palabras transcribió y cuánto dura sin silencios, y contáselo a la persona.

## 3. Elegir composición

- **Video** → `Clip`.
- **Solo audio** (podcast, nota de voz) o clip de podcast vertical → `Podcast`.

## 4. Props principales de `Clip`

| Prop | Uso |
|---|---|
| `data` | `"<nombre>.json"` |
| `format` | `source` (igual al original), `vertical`, `portrait`, `square`, `landscape` |
| `cutSilences` | `true` para sacar pausas |
| `clipStart` / `clipEnd` | tramo en segundos (0 = todo) — para "sacá 30 s para Instagram" |
| `showCaptions`, `captionLook` (`karaoke`, `box`, `minimal`, `neon`, `pop`, `outline`, `gradient`, `underline`), `captionPosition`, `uppercase` | subtítulos (ver `Estilos-Subtitulos`) |
| `title` | título los primeros segundos |
| `speakerName`, `speakerRole` | cartel con nombre (lower third) |
| `music`, `musicVolume`, `musicDuck` | música de fondo que baja sola cuando se habla |
| `videoVolume` | volumen del audio original |

Para elegir el mejor tramo de 30–60 s, leé las `captions` del JSON y buscá la frase más fuerte o completa; proponé el tramo con su texto antes de renderizar.

## 5. Revisar y renderizar

1. Captura en un momento con subtítulos: `npx remotion still Clip out/x.png --frame=90 --props='{"data":"<nombre>.json","format":"vertical"}'`.
2. Revisá que los subtítulos no tapen caras ni queden en la zona de botones (en vertical, `captionPosition: "center"` suele ser mejor).
3. Render: `npx remotion render Clip out/<nombre>.mp4 --props=...`, o varios formatos con `npm run render-batch -- Clip --props ... --formats vertical,landscape`.

## Errores comunes

- "No encontré public/data/...": falta correr `prepare-video` o el nombre no coincide.
- Subtítulos con palabras mal escritas: repetí con un modelo más grande o corregí el texto directamente en el JSON (`captions[].text`).
- Subtítulos desfasados después de cortar: no debería pasar (se re-sincronizan solos); si pasa, probá `cutSilences: false` para confirmar y avisá.
