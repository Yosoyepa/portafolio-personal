# Nebulosa y Scanner

Iteración del 7 de septiembre de 2026, basada en la referencia visual facilitada por el propietario del portafolio. La referencia se utiliza para composición y ambiente; sus textos no se incorporan al sitio.

## Textura de nebulosa

Generada con la herramienta integrada de generación de imágenes, sin CLI ni llamadas a un servicio desde el portafolio. El PNG original se convirtió con Sharp a WebP, sin reescalar la versión de escritorio:

| Archivo local | Dimensiones | Tamaño |
| --- | --- | --- |
| `public/assets/nebula-blue.webp` | 1672 × 941 | 72 466 bytes |
| `public/assets/nebula-blue-mobile.webp` | 960 × 540 | 23 680 bytes |

La imagen se usa como textura estática de fondo. Las estrellas, estelas, etiquetas, órbitas y conexiones permanecen en Canvas/SVG. La versión móvil se selecciona mediante media query; no se descarga vídeo ni se renderiza una nebulosa procedural por fotograma.

Prompt final, modo integrado (`image_gen`):

> Use case: stylized-concept. Asset type: a background-only raster nebula texture for a senior AI engineer's dark portfolio website, wide landscape 16:9 composition. Create a cinematic but restrained deep-space star cloud. A wispy, intricate band of interstellar blue and teal gas with a faint muted plum and warm dust core crosses diagonally from the lower left edge through the middle-right toward the upper right. Fine fractal filaments and translucent cloud pockets, realistic astronomical cloud detail, sparse tiny distant stars, deep near-black navy negative space. The left 40 percent stays particularly dark and quiet for large white website headline text to be composited later. The right middle should have more blue nebula detail behind a separately coded constellation diagram. Keep the outer edges dark so it blends naturally into #070b13. Strong local detail in the gas but controlled overall brightness, no large bright orbs. This is ONLY the astronomical background texture, NOT a website mockup. Absolutely no text, no letters, no interface, no icons, no borders, no diagram nodes, no orbit lines, no logos, no planet, no central black hole, no lens flare, no artificial electric arcs. Native canvas stars and SVG electric trails will be added separately by code. Generate one polished landscape image.

## Scanner

El shader corresponde al componente React Bits Scanner adjuntado por el usuario. Su licencia se conserva en `src/components/reactbits/LICENSE.md`. La adaptación local está en `Scanner.jsx` y se integra mediante `ScannerSurface.tsx`.

- Núcleo: recorte circular SVG, hasta 24 fps, DPR máximo 1.5 y presupuesto de 50 000 píxeles.
- Contacto: pase independiente de hasta 24 fps, DPR máximo 0.85 y presupuesto de 750 000 píxeles. Su máscara mantiene legible el contenido y evita bordes rectangulares visibles.
- Carga diferida cerca de la vista; sin montaje WebGL con movimiento reducido y con alternativa estática si falta WebGL 2.
- La visibilidad y la pausa usan `createRenderLoop`; el tiempo se acumula solo al animar, sin saltar al reanudar. Se liberan geometría, programa y contexto al desmontar.
- La pausa del inicio también detiene el Scanner del núcleo y las señales SVG. Contacto dispone de su propio control de pausa. Los eventos de interacción se capturan desde la sección para funcionar sobre controles enfocados.
- Los filamentos eléctricos son trayectorias SVG fijas con pequeños segmentos luminosos que se desplazan; no se recalcula geometría en cada fotograma ni se añaden destellos estroboscópicos.

LaserFlow y `ProfileLaser.tsx` no se modifican en esta iteración.
