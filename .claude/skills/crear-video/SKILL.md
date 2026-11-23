---
name: crear-video
description: Crea un video desde cero a partir de una descripción (TikTok, Reel, Short, post, promo, anuncio, presentación, testimonio, números, historia con fotos, producto). Usar cuando la persona pide "haceme un video", "armá un TikTok/Reel/anuncio" o describe un video que no parte de una grabación propia.
---

# Crear un video desde cero

## 1. Entender el pedido (sin interrogar)

Sacá del mensaje: **objetivo** (vender, anunciar, educar, entretener), **plataforma** (define el formato), **mensaje principal**, **tono** y **marca** (colores, usuario). Si falta algo, decidí un valor razonable y decilo en una línea; preguntá solo si sin esa respuesta el video saldría mal (por ejemplo, el precio de un producto).

## 2. Elegir la plantilla

| Pedido | Composición | Formato |
|---|---|---|
| Video corto con gancho e ideas | `Short` / `Post` / `Promo` | 9:16 / 4:5 / 16:9 |
| Producto con foto | `Spotlight` / `Spotlight-Horizontal` | 9:16 / 16:9 |
| Lanzamiento, anuncio, evento | `Lanzamiento` | 16:9 (cambiable) |
| Comparación | `AntesDespues` | 16:9 |
| Diapositivas, explicación | `Presentacion` | 16:9 |
| Opinión de cliente | `Testimonio` | 9:16 |
| Resultados, métricas | `Numeros` | 9:16 |
| Fotos con música | `Historia` | 9:16 |

Todas aceptan cualquier formato desde el render en lote (ver skill `exportar`).

Si ninguna encaja, creá un componente nuevo en `src/videos/<Nombre>.tsx` combinando bloques de `src/blocks/` y registralo en `src/videos/index.tsx` con su esquema `zod` y `calculateMetadata` si la duración depende de los datos.

## 3. Escribir el contenido

Usá la skill `guion-redes` para el texto: gancho de menos de 8 palabras, una idea por pantalla, cierre con acción concreta. Marcá con `*asteriscos*` la palabra clave de cada frase para que salga en color de acento.

## 4. Diseño

- Paleta: `brasa` (cálida, energía), `oceano` (confianza, tecnología), `lima` (fresco, ecológico), `noche` (premium, moda), `papel` (claro, editorial), `atardecer` (gastronomía, viajes), `menta` (salud, educación, fondo claro), `oro` (lujo, eventos), `hielo` (corporativo, finanzas), `uva` (gaming, música). Si la persona da colores de marca o pide un estilo, usá la skill `referencias-visuales`.
- Movimiento de títulos (`motion`): `rise` (neutro), `pop` (divertido), `blur` (elegante), `type` (técnico), `slam` (impacto, deportes), `mask` (editorial, premium), `glitch` (tecnología, gaming), `wave` (juguetón), `letters` (suave, emotivo), `shine` (lujo, producto). La composición `Estilos-Titulos` los muestra todos.
- Recursos extra para componentes propios: `PhoneFrame` (mostrar una app), `Callout` (señalar algo), `Sticker` (emoji o "-50%"), `Ticker` (cinta de ofertas), `Watermark` (logo visible), `LowerThird`, `SplitScreen`, `PictureInPicture`. Ver `Galeria`.
- Transiciones: elegí 2 o 3 que combinen; no mezcles más de 4.
- Partículas (`ambient`) solo si suman: `chispas` para lanzamientos, `polvo` para ambiente, `ninguno` para lo corporativo.

## 5. Revisar antes de renderizar

1. Guardá las props en `out/<nombre>.props.json`.
2. `npx remotion still <Id> out/<nombre>.png --frame=<cuadro> --props=out/<nombre>.props.json` en 2 o 3 momentos clave (gancho, una idea, cierre).
3. Mirá las capturas: texto legible, nada cortado, buen contraste. Corregí y repetí.

## 6. Renderizar

```
npx remotion render <Id> out/<nombre>.mp4 --props=out/<nombre>.props.json
```

Para varias redes a la vez: `npm run render-batch -- <Id> --props out/<nombre>.props.json --formats vertical,square,landscape`.

Al terminar, decí dónde quedó el archivo, la duración y ofrecé 1 o 2 ajustes concretos (otra paleta, más corto, música).
