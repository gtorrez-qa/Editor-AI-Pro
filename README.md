# Editor AI Pro

**Editor de video con IA, por Guillermo Torrez.**

Describí el video que querés y Claude Code lo arma, lo revisa y lo exporta para cada red. Funciona sobre [Remotion](https://remotion.dev) (videos hechos con React). Tus archivos se procesan en tu computadora: sin claves de API y sin subir nada a ningún lado.

## Qué hace

- **13 plantillas listas**: TikTok/Reels/Shorts, post de Instagram, promo de YouTube, testimonio, números, historia con fotos, producto, lanzamiento con cuenta regresiva, antes/después, presentación, clip propio y podcast.
- **Subtítulos automáticos** palabra por palabra con Whisper (local), en 3 estilos.
- **Corte de silencios** automático en videos hablados, con subtítulos re-sincronizados.
- **Cambio de formato**: un video horizontal pasa a vertical, cuadrado o 4:5.
- **Música de fondo** con fundidos y *ducking* (baja sola cuando alguien habla). Incluye un generador de música propia libre de derechos.
- **Render en lote**: un comando exporta el mismo video para todas las redes.
- **Quitar fondo** de fotos de productos o personas.
- **Búsqueda de estilos en la web**: "quiero el estilo de Apple" → paleta y animaciones aplicadas.
- **Comando `/start`** que instala y configura todo, y **8 skills** que le enseñan a Claude a editar: crear videos, editar grabaciones, guion para redes, motion design, Remotion técnico, música, exportación y referencias visuales.
- **28 componentes reutilizables**: títulos animados (**10 estilos**), subtítulos (**8 estilos**), lower thirds, pantalla dividida, picture-in-picture, marco de celular, flecha con etiqueta, stickers, cinta de texto, marca de agua visible, zona segura para redes, partículas (4 tipos), cuenta regresiva, contadores, marcador, slideshow, antes/después, barras de audio, estrellas, fondos animados (3 tipos), botón de acción, barra de progreso, firma, música con ducking y 12 transiciones. Con **10 paletas** de color. Las composiciones `Galeria`, `Estilos-Titulos` y `Estilos-Subtitulos` los muestran en acción.
- **Marca de agua invisible con tu identificador**: cada video lleva grabado el ID del dueño. `npm run verify-mark` lo confirma incluso después de que una red social lo recomprima.

## Requisitos

- Node.js 20 o superior
- [Claude Code](https://claude.com/claude-code) para usarlo hablando (opcional para uso manual)
- Internet la primera vez (descarga el navegador de render, Whisper, el modelo de idioma y las fuentes)

## Inicio rápido

```bash
cd Editor-AI-Pro-GT
claude
/start
```

`/start` instala todo, verifica que funcione y te muestra qué podés pedir. Ejemplos:

> "Haceme un TikTok anunciando mi curso de fotografía, con colores cálidos y música"
>
> "Ponele subtítulos a public/media/entrevista.mp4, sacale los silencios y pasalo a vertical"
>
> "Armá una presentación de 5 diapositivas sobre mi emprendimiento con el estilo de Apple"
>
> "Exportá el video para TikTok, Instagram y YouTube a la vez"

## Uso manual

| Tarea | Comando |
|---|---|
| Vista previa y edición en el navegador | `npm run studio` |
| Exportar un video | `npx remotion render Short out/short.mp4` |
| Exportar para todas las redes | `npm run render-batch -- Short` |
| Preparar tu video o audio (subtítulos + silencios) | `npm run prepare-video -- public/media/video.mp4 --lang es` |
| Exportar tu video editado | `npx remotion render Clip out/video.mp4 --props='{"data":"video.json"}'` |
| Quitar el fondo de una foto | `npm run remove-bg -- fotos/producto.jpg` |
| Generar música de prueba | `npm run demo-music` |
| Verificar la marca de agua invisible | `npm run verify-mark -- video.mp4` |

La primera vez que preparás un video se descargan Whisper y el modelo de idioma (`small`, ~470 MB). Para probar rápido usá `--model tiny`.

## Plantillas

| Id | Formato | Para qué |
|---|---|---|
| `Short` | 1080×1920 | TikTok, Reels, Shorts |
| `Post` | 1080×1350 | Feed de Instagram |
| `Promo` | 1920×1080 | YouTube, web |
| `Testimonio` | 1080×1920 | Opinión de clientes |
| `Numeros` | 1080×1920 | Resultados y métricas |
| `Historia` | 1080×1920 | Fotos con música |
| `Spotlight` / `Spotlight-Horizontal` | 9:16 / 16:9 | Producto |
| `Lanzamiento` | 1920×1080 | Anuncios y lanzamientos |
| `AntesDespues` | 1920×1080 | Comparaciones |
| `Presentacion` | 1920×1080 | Diapositivas |
| `Clip` | el de tu video o el que elijas | Tus videos editados |
| `Podcast` | 1080×1920 | Clips de podcast |
| `Galeria` / `Galeria-Horizontal` | 9:16 / 16:9 | Demostración de componentes de diseño |
| `Estilos-Titulos` / `Estilos-Subtitulos` | 16:9 / 9:16 | Los 10 estilos de títulos y los 8 de subtítulos |

Todas se pueden exportar en cualquier formato con el render en lote.

## Licencia

© 2026 Guillermo Torrez. Todos los derechos reservados. Ver [LICENSE](LICENSE), que también detalla las licencias de las bibliotecas de terceros (Remotion requiere licencia de empresa para organizaciones de más de 3 personas; la biblioteca de quitar fondo es AGPL-3.0).
