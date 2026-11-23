---
name: motion-design
description: Principios de diseño en movimiento para que los videos se vean profesionales — ritmo, tiempos, curvas de animación, jerarquía, tipografía, color, legibilidad y zonas seguras de cada red. Usar al crear o ajustar el diseño de cualquier video, o cuando la persona dice que algo "se ve amateur", "muy rápido", "aburrido" o "desordenado".
---

# Motion design

## Ritmo y tiempos (a 30 fps)

| Elemento | Duración |
|---|---|
| Entrada de texto | 12–20 cuadros |
| Retraso entre palabras | 3–4 cuadros |
| Transición entre escenas | 12–18 cuadros |
| Tiempo mínimo para leer una frase corta | 45–60 cuadros |
| Pausa antes de la llamada a la acción | 10–15 cuadros |

- Todo entra escalonado, nunca todo junto: título → subtítulo → botón, con 8–15 cuadros entre cada uno.
- Las salidas son más rápidas que las entradas (2/3 del tiempo).
- Cambiá algo en pantalla cada 2–3 segundos para mantener la atención en redes.

## Curvas

- `ease()` (spring con damping 200): movimientos elegantes, sin rebote. Uso general.
- `bounce()`: elementos que "saltan" (botones, insignias, números). Usalo poco: 1 o 2 por escena.
- `interpolate` lineal solo para cosas continuas (barras de progreso, paneos lentos).
- Nunca animes más de 2 propiedades fuertes a la vez en un mismo elemento (ej. escala + desenfoque está bien; escala + giro + desenfoque + color es ruido).

## Qué estilo de título usar

| Tono | `motion` |
|---|---|
| Neutro, informativo | `rise`, `mask` |
| Divertido, cercano | `pop`, `wave` |
| Elegante, premium | `blur`, `shine`, `letters` |
| Impacto, deportes, ofertas | `slam` |
| Tecnología, gaming | `glitch`, `type` |

Usá un solo estilo de título por video (como mucho dos: uno para el gancho y otro para el resto).

## Jerarquía

- Un solo foco por pantalla. Si hay título grande, lo demás va al 40–60 % del tamaño.
- Escala tipográfica relativa a `unit()`: título 8–14, subtítulo 4–5, texto 3–4, etiquetas 2,5–3.
- Máximo 2 familias tipográficas (ya definidas: Space Grotesk para títulos, Inter para texto).
- Alineación: centrado en vertical y para frases cortas; a la izquierda para listas y textos largos.

## Color y contraste

- Acento solo para lo importante (palabra clave, botón, número). Si todo es acento, nada lo es.
- Contraste mínimo 4.5:1 entre texto y fondo. Sobre video, agregá degradado oscuro detrás del texto.
- En fondos claros (`papel`) evitá partículas blancas y sombras fuertes.

## Zonas seguras

- **TikTok / Reels / Shorts (9:16):** dejar libre ~10 % arriba, ~20 % abajo (descripción) y ~14 % a la derecha (botones). Usá `<SafeArea debug>` para verificar.
- **YouTube (16:9):** 5 % de margen en todos los bordes.
- Los subtítulos en vertical van mejor en el centro o en el tercio inferior por encima del 20 % final.

## Diagnóstico rápido

- "Se ve amateur" → demasiadas animaciones distintas, colores sin criterio o texto muy chico. Reducí variedad y agrandá.
- "Muy rápido" → subí los segundos por pantalla y el retraso entre elementos.
- "Aburrido" → agregá movimiento de fondo (`aurora`, partículas suaves), alterná transiciones y usá un número o dato grande.
- "Desordenado" → un foco por pantalla, alineá todo al mismo eje, más margen.
