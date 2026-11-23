# Editor AI Pro

**Editor de video con IA, por Guillermo Torrez.**

Describí el video que querés y Claude Code lo arma, lo previsualiza y lo exporta. Funciona sobre [Remotion](https://remotion.dev) (videos hechos con React) y todo el procesamiento corre en tu computadora: sin claves de API y sin subir tus archivos a ningún lado.

## Qué hace

- **Videos desde cero** para TikTok, Reels, Shorts, Instagram y YouTube: gancho, ideas y llamada a la acción con textos animados, fondos en movimiento y transiciones.
- **Subtítulos automáticos** palabra por palabra con Whisper, en tres estilos (karaoke, caja, minimal).
- **Cortar silencios** de videos hablados de forma automática.
- **Quitar el fondo** de fotos de productos o personas y presentarlas en una vitrina animada.
- **Cambiar de formato** cualquier video (horizontal → vertical, cuadrado, 4:5).

## Requisitos

- Node.js 20 o superior
- [Claude Code](https://claude.com/claude-code) (opcional, pero es la forma de usarlo hablando)

## Inicio rápido

```bash
npm install
npm run studio
```

Se abre el Studio en el navegador con todas las plantillas. Para trabajar con Claude, abrí Claude Code en esta carpeta y pedile lo que quieras, por ejemplo:

> "Haceme un TikTok anunciando mi curso de fotografía, con colores cálidos"
>
> "Ponele subtítulos a public/media/entrevista.mp4 y sacale los silencios"
>
> "Sacá el fondo de fotos/zapatilla.jpg y armá una promo de 8 segundos"

## Uso manual

| Tarea | Comando |
|---|---|
| Vista previa | `npm run studio` |
| Exportar un video | `npx remotion render Short out/short.mp4` |
| Preparar tu video (subtítulos + silencios) | `npm run prepare-video -- public/media/video.mp4 --lang es` |
| Exportar tu video editado | `npx remotion render Clip out/video.mp4 --props='{"data":"video.json"}'` |
| Quitar el fondo de una foto | `npm run remove-bg -- fotos/producto.jpg` |

La primera vez que preparás un video se descargan Whisper y el modelo de idioma (el modelo `small` pesa unos 470 MB). Para probar rápido podés usar `--model tiny`.

## Plantillas

| Id | Formato | Para qué |
|---|---|---|
| `Short` | 1080×1920 | TikTok, Reels, Shorts |
| `Post` | 1080×1350 | Feed de Instagram |
| `Promo` | 1920×1080 | YouTube, web |
| `Spotlight` | 1080×1920 | Producto vertical |
| `Spotlight-Horizontal` | 1920×1080 | Producto horizontal |
| `Clip` | el de tu video, o el que elijas | Tus videos con subtítulos y cortes |

Paletas incluidas: `brasa`, `oceano`, `lima`, `noche`, `papel`.

## Licencia

© 2026 Guillermo Torrez. Todos los derechos reservados. Ver [LICENSE](LICENSE), que también detalla las licencias de las bibliotecas de terceros (Remotion requiere licencia de empresa para organizaciones de más de 3 personas).
