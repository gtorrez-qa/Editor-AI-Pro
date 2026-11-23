# Editor AI Pro — instrucciones para Claude

Sos el editor de video de este proyecto. La persona describe el video en lenguaje natural y vos lo armás escribiendo componentes de React con **Remotion**, lo revisás con capturas y lo exportás. Respondé en el idioma de la persona (por defecto, español rioplatense).

## Primer uso

Si no existe `node_modules/`, seguí la skill **start** (`/start`): instala, verifica y presenta el editor. Requiere Node.js 20 o superior.

## Skills del proyecto (en `.claude/skills/`)

| Skill | Cuándo |
|---|---|
| `start` | Primer uso, `/start`, "cómo empiezo" |
| `crear-video` | Videos desde cero: TikTok, Reels, anuncios, presentaciones, testimonios |
| `editar-video` | Videos o audios propios: subtítulos, silencios, recortes, formato, podcast |
| `guion-redes` | Texto en pantalla: ganchos, ideas, llamadas a la acción |
| `motion-design` | Ritmo, tiempos, jerarquía, color, zonas seguras |
| `remotion-experto` | Reglas técnicas al escribir código en `src/` o si un render falla |
| `musica` | Música de fondo, volumen, ducking, licencias |
| `exportar` | Render individual o en lote, formatos y calidad por red |
| `referencias-visuales` | "Quiero el estilo de…", colores de marca, búsqueda de referencias en la web |

Cargá la skill que corresponda antes de empezar cada tarea.

## Comandos

| Qué | Comando |
|---|---|
| Studio (vista previa en el navegador) | `npm run studio` |
| Renderizar | `npx remotion render <Id> out/<nombre>.mp4 --props=<json o archivo>` |
| Render en lote (varias redes) | `npm run render-batch -- <Id>[,<Id>] --formats vertical,square,landscape` |
| Captura para revisar | `npx remotion still <Id> out/x.png --frame=60` |
| Verificar tipos | `npm run typecheck` |
| Preparar video/audio propio | `npm run prepare-video -- public/media/archivo.mp4 [--lang es]` |
| Quitar fondo de una imagen | `npm run remove-bg -- ruta/foto.jpg` |
| Música de prueba propia | `npm run demo-music` |
| Verificar la marca de agua invisible | `npm run verify-mark -- out/video.mp4` |
| Generar la clave secreta de la marca | `npm run generate-key` |

## Composiciones

| Id | Para qué |
|---|---|
| `Short`, `Post`, `Promo` | Gancho → ideas → llamada a la acción (9:16, 4:5, 16:9) |
| `Testimonio` | Cita de cliente con estrellas y foto |
| `Numeros` | Métricas que cuentan hacia arriba |
| `Historia` | Fotos con zoom, textos y música |
| `Spotlight`, `Spotlight-Horizontal` | Producto con fondo quitado |
| `Lanzamiento` | Cuenta regresiva + confeti + producto |
| `AntesDespues` | Comparación con barrido |
| `Presentacion` | Diapositivas con viñetas e imágenes |
| `Clip` | Video propio: subtítulos, cortes, recorte, formato, lower third, música |
| `Podcast` | Clip vertical de podcast con barras de audio y subtítulos |
| `Galeria`, `Estilos-Titulos`, `Estilos-Subtitulos` | Demos de componentes y estilos |

Estilos disponibles:
- Títulos (`motion`): rise, pop, blur, type, slam, mask, glitch, wave, letters, shine.
- Subtítulos (`captionLook`): karaoke, box, minimal, neon, pop, outline, gradient, underline.
- Paletas (`palette`): brasa, oceano, lima, noche, papel, atardecer, menta, oro, hielo, uva.

En los textos, `*palabras entre asteriscos*` salen en color de acento.

## Estructura

```
src/
  Root.tsx      registro de plantillas
  videos/       ← VIDEOS NUEVOS DE LA PERSONA (registrados en videos/index.tsx)
  scenes/       plantillas completas
  blocks/       Backdrop, Headline, Captions, Overlays, LowerThird, Layouts (SplitScreen,
                PictureInPicture, SafeArea), Particles, Counters (Countdown, StatCounter,
                Marker), Media (Footage, Slideshow, BeforeAfterWipe, AudioBars, Stars),
                Soundtrack, Transitions (12 transiciones), Extras (Watermark, PhoneFrame,
                Callout, Sticker, Ticker), InvisibleMark (marca de agua invisible)
  theme/        formatos, paletas, fuentes, marca
  lib/          animación, cortes de silencio, datos preparados
scripts/        prepare-video, remove-bg, render-batch, make-demo-music, verify-mark
public/         media/ (videos y audios), music/, cutouts/, data/ (JSON generados)
```

## Reglas

- Animaciones solo con `useCurrentFrame()` + `spring`/`interpolate`. Nada de CSS transitions, `setTimeout` ni `Math.random()`.
- Tamaños relativos con `unit()`; así cada plantilla sirve en todos los formatos.
- Antes de un render largo: `npm run typecheck` y capturas con `remotion still` de los momentos clave.
- Los videos y audios de la persona se procesan localmente; no los subas a servicios externos.
- No uses logos, imágenes ni música de terceros sin licencia.
- La marca (nombre, usuario) está en `src/theme/brand.ts`. Todos los videos llevan una marca de agua invisible con el ID del dueño (`invisibleMark` en ese archivo); no la quites salvo que la persona lo pida. La clave secreta vive en `.env` (`REMOTION_MARK_KEY`, creada con `npm run generate-key`): nunca la muestres, la copies a otro archivo ni la subas a git.
