---
name: referencias-visuales
description: Busca referencias visuales en la web (estilos de marcas, tendencias, paletas, tipografías, tipos de animación) y las convierte en una paleta y ajustes de diseño aplicables a los videos. Usar cuando la persona pide "el estilo de Apple/Nike/Netflix", "algo moderno/minimalista/retro", trae colores de su marca o un link de referencia.
---

# Referencias visuales

## 1. Investigar

- Si la persona nombra una marca o estilo, buscá en la web (WebSearch) cómo son sus videos y gráficos: colores dominantes, tipografía, ritmo, tipo de transiciones, uso de espacio en blanco. Buscá 2–3 fuentes (sitio oficial, análisis de diseño, galerías de motion design).
- Si trae un link, leelo (WebFetch) y extraé lo mismo.
- Si trae colores de marca (hex), usalos tal cual.
- No descargues ni copies logos, imágenes o videos de otras marcas para usarlos en el video: tomá solo el estilo (colores, ritmo, composición). Las marcas registradas no se usan sin permiso.

## 2. Traducir a una "ficha de estilo"

Escribile a la persona un resumen corto:

```
Estilo: <nombre>
Colores: fondo #..., texto #..., acento #..., acento 2 #...
Tipografía: <sans geométrica / serif editorial / mono técnica> — usamos <la más cercana disponible>
Movimiento: <rise / blur / pop / type>, transiciones <...>, ritmo <lento / medio / rápido>
Fondo: <aurora / grid / solid>, partículas <sí/no>
Referencias: <links consultados>
```

## 3. Aplicarlo

1. Agregá la paleta a `src/theme/palettes.ts` con un nombre corto en minúsculas (ej. `minimal`), respetando las 6 claves (`base`, `surface`, `ink`, `inkSoft`, `accent`, `accent2`). Verificá contraste de `ink` sobre `base` (mínimo 4.5:1).
2. Si el estilo pide otra tipografía, agregala en `src/theme/fonts.ts` con `@remotion/google-fonts/<Fuente>` y usala en el componente correspondiente.
3. Usá la paleta nueva en las props (`palette: "minimal"`) y elegí movimiento y transiciones según la ficha.
4. `npm run typecheck` y una captura con `npx remotion still` para mostrarle el resultado antes de renderizar todo.

## Estilos frecuentes (punto de partida)

| Estilo | Paleta | Movimiento | Fondo |
|---|---|---|---|
| Minimalista premium | negro/blanco + 1 acento | `blur`, transiciones `fundido` | `solid` |
| Tecnología / startup | azul oscuro + cian | `rise`, `deslizar` | `grid` |
| Energético / deportivo | negro + rojo o lima | `pop`, `barrido` | `aurora` + `chispas` |
| Editorial / revista | crema + negro + rojo | `type` o `rise` | `solid` (paleta `papel`) |
| Lujo | negro + dorado (paleta `oro`) | `shine` o `blur` lento | `solid` |
| Gaming / nocturno | violeta + amarillo (paleta `uva`) | `glitch` | `aurora` + `chispas` |
| Salud / bienestar | fondo claro + verde (paleta `menta`) | `letters` | `solid` |
