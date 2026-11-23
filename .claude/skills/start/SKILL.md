---
name: start
description: Pone en marcha Editor AI Pro por primera vez. Instala dependencias, verifica que todo compile, genera una vista previa y muestra qué se puede hacer. Usar cuando la persona escribe /start, abre el proyecto por primera vez o pregunta "cómo empiezo".
---

# /start — puesta en marcha

Hacé estos pasos en orden y contale a la persona en una línea qué estás haciendo en cada uno. No le pidas confirmación para instalar: es parte del arranque.

## 1. Verificar Node.js

Corré `node -v`. Si no existe o es menor a 20, frená y explicale que tiene que instalar Node.js 20 o superior desde https://nodejs.org (versión LTS), y que después vuelva a escribir `/start`.

## 2. Instalar dependencias

Si no existe `node_modules/`, corré `npm install`. Si ya existe, saltá este paso.

Si npm muestra avisos de `allow-scripts` o vulnerabilidades, no son errores: seguí adelante.

## 3. Verificar que compila

Corré `npm run typecheck`. Si falla, leé el error y corregilo antes de seguir.

## 4. Clave de la marca de agua

Corré `npm run generate-key`. Crea una clave secreta propia en `.env` (si ya existe, no la toca). Decile a la persona, en una línea, que guarde una copia de esa clave en un lugar seguro: sin ella no podrá verificar después que sus videos salieron de su editor. Nunca muestres la clave en el chat.

## 5. Primera vista previa

Generá una captura para confirmar que el render funciona (la primera vez descarga un navegador de ~130 MB):

```
npx remotion still Short out/bienvenida.png --frame=60
```

Mostrale la imagen a la persona si tu entorno lo permite.

## 6. Música de prueba (opcional)

Si no existe `public/music/demo.wav`, corré `npm run demo-music`, así puede probar la música de fondo sin buscar un tema.

## 7. Presentar lo que puede hacer

Terminá con un mensaje corto y concreto, en este estilo:

> ¡Listo! Editor AI Pro está funcionando. Podés pedirme cosas como:
>
> - "Haceme un TikTok anunciando mi curso de cocina, con colores cálidos y música"
> - "Ponele subtítulos a mi video y sacale los silencios" (dejalo en `public/media/`)
> - "Quiero una presentación de 5 diapositivas sobre mi emprendimiento"
> - "Armá un testimonio con esta frase de un cliente: ..."
> - "Exportá el video para TikTok, Instagram y YouTube a la vez"
> - "Buscá referencias de estilo tipo Apple y aplicalas"
>
> Para ver y ajustar todo en el navegador: `npm run studio`.

No listes todas las plantillas ni comandos salvo que lo pida: para eso está el README.
