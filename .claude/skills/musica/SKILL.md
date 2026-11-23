---
name: musica
description: Agrega y ajusta música de fondo en los videos — elegir el tema, volumen, fundidos, ducking automático bajo la voz, punto de inicio y licencias. Usar cuando la persona pide música, "ponele un tema", "la música tapa la voz" o pregunta de dónde sacar canciones.
---

# Música de fondo

Todas las plantillas tienen `music` (ruta dentro de `public/`, vacío = sin música) y `musicVolume` (0 a 1). La música se repite en loop si el video es más largo, entra con fundido de 1 s y sale con fundido de 1,5 s.

## Dónde poner los temas

En `public/music/`. Formatos: mp3, wav, m4a, ogg.

Para probar sin buscar un tema: `npm run demo-music` genera `public/music/demo.wav` (música sintetizada propia, libre de derechos). Opciones: `--bpm 120 --seconds 30`.

## Volumen recomendado

| Caso | `musicVolume` |
|---|---|
| Video sin voz (texto + música) | 0.6 – 0.8 |
| Video con voz | 0.25 – 0.4 |
| Podcast | 0.15 – 0.25 |

## Ducking (la música baja cuando se habla)

- En `Clip` y `Podcast` es automático: usa los tramos con voz que detecta `prepare-video` para bajar la música mientras se habla y subirla en las pausas. `musicDuck` define cuánto baja (0.25 = al 25 % del volumen, unos −12 dB; 0.1 si la voz es suave).
- Si se preparó con `--no-cuts`, usa los tiempos de las palabras transcritas. Sin ninguno de los dos, la música queda al nivel bajo todo el tiempo.
- Con `cutSilences: true` casi todo el video es voz, así que la música queda baja casi siempre: es lo esperado.
- En composiciones propias: `<Soundtrack src=... speech={ventanas} duckTo={0.2} />` con ventanas `{ startMs, endMs }`.

## Empezar en otro punto del tema

`<Soundtrack startAtSec={12} />` arranca en el segundo 12 (útil para saltear una intro lenta). Para composiciones propias, sumalo como prop.

## Elegir el tema según el video

- Producto o lanzamiento: 110–128 BPM, con pulso marcado.
- Testimonio o historia: 70–90 BPM, piano o cuerdas.
- Tutorial o podcast: instrumental suave, sin voces.
- Evitá temas con voz cantada debajo de una persona hablando.

## Licencias (importante)

No uses canciones comerciales (Spotify, YouTube Music, radio): las redes silencian o bloquean el video y puede haber reclamos. Fuentes seguras:

- La biblioteca de audio de YouTube Studio (gratis, con condiciones por tema).
- Pixabay Music (licencia libre para uso comercial, revisar cada tema).
- Bibliotecas pagas con licencia comercial (Epidemic Sound, Artlist, etc.).
- La música propia generada con `npm run demo-music`.

Si la persona trae un tema, preguntale si tiene licencia para usarlo antes de publicarlo; no lo descargues vos de servicios de streaming.
