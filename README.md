# Juan Andrade — Portafolio profesional

Portafolio bilingüe de **Juan Carlos Andrade Unigarro**, Senior AI Engineer. Presenta experiencia en inteligencia documental, agentes, backend y plataformas AWS, con seis casos públicos enlazados a su código.

## Experiencia del sitio

- **Inicio interactivo:** una constelación SVG representa contexto, agentes y producción alrededor de un núcleo con Scanner. Filamentos azules recorren conexiones y órbitas; las rutas responden al cursor y a la etapa seleccionada. Una nebulosa WebP aporta detalle al fondo, con estrellas, estelas y control de pausa.
- **Perfil con LaserFlow:** el haz, la niebla y la caída alrededor de las tarjetas se conservan. Las tarjetas interiores añaden realce al interactuar y acceso al stack.
- **Trayectoria editorial:** tres etapas profesionales con problema, aportación, tecnologías aplicadas y contribuciones ampliables. El explorador complementario busca en el contenido publicado y muestra resultados sin esperar una animación de salida ni exigir salir del campo de texto.
- **Seis casos de ingeniería:** Write, Check, Trust; Personal Assistant; Secret Oracle; RAG sobre información pública; BioStock; CodeGuardAI. Incluyen filtros, diagramas, alcance, estado del proyecto y enlace al repositorio correspondiente.
- **Stack con contexto:** las tecnologías se relacionan con su aplicación en proyectos y experiencia.
- **Doce credenciales:** Accordion Gallery con categorías, detalles, controles de teclado y disposición vertical en móvil.
- **Tarjeta de contacto reversible:** «Contactarme» gira la tarjeta para mostrar correo, LinkedIn y GitHub. La cara oculta queda fuera de la navegación; Escape regresa a la portada y se restaura el foco. Scanner añade bandas de luz al fondo, con control de pausa independiente.
- **ES/EN:** selector persistente y atributo de idioma actualizado. Enlaces semánticos, foco visible, skip-link y alternativas de movimiento reducido.

## Desarrollo y verificación

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

Las pruebas usan el soporte nativo de TypeScript de Node; ejecutar con Node 22.18+ o 24+. Detener el servidor de desarrollo antes de compilar, porque ambos procesos escriben en `.next/`.

El proyecto utiliza Next.js 15, React 19, TypeScript, Tailwind 4, Motion, Lenis, OGL y Three.js. `pnpm build` genera un sitio estático en `out/`, que puede servirse sin un backend de Next.js:

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory out
```

La búsqueda se ejecuta en el navegador sobre el contenido público del portafolio. No utiliza un LLM ni envía consultas a un servicio. Los archivos de memorias del directorio superior no se empaquetan.

## Despliegue en Vercel

El sitio es 100 % estático (`output: "export"` en `next.config.ts`), por lo que Vercel lo publica sin configuración adicional:

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. Vercel detecta Next.js y `pnpm` automáticamente; no se necesitan variables de entorno ni ajustes de build.
3. Cada push a `main` genera un despliegue nuevo con su URL de vista previa.

También sirve en GitHub Pages, Netlify o cualquier hosting estático publicando el contenido de `out/`.

## Contenido y personalización

| Contenido | Archivo |
| --- | --- |
| Textos generales ES/EN, correo, LinkedIn y GitHub | `src/lib/content.ts` |
| Narrativa y tecnologías de las tres etapas laborales | `src/lib/career.ts` |
| Seis casos, enlaces, estado y decisiones técnicas | `src/lib/caseStudies.ts` |
| Fuentes que respaldan el contenido | `docs/portfolio-evidence.md` |
| Índice y recuperación local | `src/lib/retrieval.ts` |
| Constelación vectorial del inicio | `src/components/SignalField.tsx` |
| Scanner del núcleo y Contacto | `src/components/ScannerSurface.tsx`, `src/components/reactbits/Scanner.jsx` |
| Texturas de nebulosa y prompt de generación | `docs/visual-assets.md` |
| Estrellas y estelas del inicio | `src/components/StarField.tsx` |
| Atmósfera de las secciones | `src/components/AmbientBackground.tsx`, `public/assets/space-dust.svg` |
| Presentación e interacciones del inicio | `src/components/Hero.tsx` |
| Composición visual, casos y tarjeta reversible | `src/app/portfolio.css` |
| Tokens, estilos base y tipografía | `src/app/globals.css` |
| Ilustraciones de credenciales | `src/components/Certifications.tsx` |
| SEO y metadatos | `src/app/layout.tsx` |

La tarjeta de contacto utiliza el retrato local `public/assets/juan-portrait.webp` (79 kB, con recorte cuadrado para el mini-avatar) renderizado en modo holograma. Los iconos geométricos están en `PortfolioIcon.tsx`. Space Grotesk, Geist y JetBrains Mono se sirven mediante `next/font`.

## Rendimiento

Toda la animación se resuelve con Motion (una sola librería de animación); no se incluye GSAP en el bundle. Las secciones por debajo del viewport usan `content-visibility: auto` para saltarse su layout y pintura iniciales, y la imagen LCP del inicio se precarga con `fetchpriority="high"` desde `layout.tsx`. Con compresión en el servidor (Lighthouse móvil, emulación 4G): ~92 de rendimiento, LCP 2.7 s, TBT ~210 ms y CLS 0; en desktop, 99.

Los efectos tienen un presupuesto explícito y suspenden el renderizado fuera de pantalla o con la pestaña oculta mediante `src/lib/renderLoop.mjs`:

| Efecto | Implementación y presupuesto |
| --- | --- |
| Inicio | Constelación SVG de forma estable y señales animadas. Estrellas en un Canvas 2D a un máximo de 24 fps, hasta 240 estrellas (100 en móvil), 3 estelas y rastro del cursor limitado a 28 puntos. DPR máximo 1.5 y búfer de hasta 2 millones de píxeles. Nebulosa WebP estática de 73 kB (24 kB en móvil). No monta la galaxia WebGL ni descarga vídeo. |
| Scanner | Dos superficies diferidas: núcleo de hasta 50 000 píxeles y Contacto de hasta 750 000. Ambas hasta 24 fps, sin montaje WebGL con movimiento reducido, y con pausa fuera de pantalla o al ocultar la pestaña. |
| Dither en Experiencia | Un pase OGL combina ondas y tramado Bayer; hasta 30 fps y DPR 0.75, sin la cadena React Three Fiber/postprocesado. Se prepara cerca del viewport. |
| RippleGrid en Stack | Hasta 30 fps y DPR 0.75. |
| LaserFlow en Perfil | Shader conservado, hasta 30 fps y DPR adaptativo. Las coordenadas de la caja se recalculan al cambiar sus dimensiones. |
| Diagramas de proyectos | Animación CSS únicamente durante hover o foco. |
| Fondos de las secciones | Polvo estelar SVG compartido y estático, órbitas y estelas vectoriales. Los gradientes animados se pausan fuera de vista, con pestaña oculta o movimiento reducido; Contacto utiliza el pase Scanner descrito arriba. |
| Marquee | Animación suspendida fuera de vista, con pestaña oculta o movimiento reducido. |

La pausa cancela callbacks pendientes. La preferencia de movimiento reducido evita animación continua y conserva una representación estática. La ilustración vectorial mantiene su nitidez al escalar. No se actualiza estado React en cada fotograma del fondo estelar; el movimiento del puntero actualiza únicamente la inclinación de la figura y la conexión cercana.

Estos valores describen límites de trabajo; no representan una medición del consumo de CPU o GPU del dispositivo.

## Validación de esta revisión

- 17 pruebas de recuperación bilingüe, contenido de los seis casos y ciclo de renderizado: visibilidad, pausa, reanudación y límites a 60/120 Hz.
- Compilación de producción y comprobación de TypeScript completas.
- Revisión en navegador a 1920 × 1080, 768 × 1024 y 390 × 844: navegación, filtros, detalles, búsqueda manteniendo el foco, tarjeta reversible y ausencia de desbordamiento horizontal.
- Archivos de LaserFlow y `ProfileLaser.tsx` verificados contra sus hashes anteriores a esta revisión.

El script existente `scripts/verify-visual.mjs` permite capturas adicionales con Chrome local; requiere el sitio servido y no forma parte de las pruebas unitarias.

## Referencias y licencias

- [React Bits](https://reactbits.dev/): adaptaciones locales de Accordion Gallery, Border Glow, GooeyNav, ProfileCard, LaserFlow, Dither, RippleGrid y Scanner. Licencia en `src/components/reactbits/LICENSE.md`.
- [Space Grotesk en Free Faces](https://www.freefaces.gallery/typefaces/space-grotesk): referencia tipográfica.
- [Spectrums](https://spectrums.framer.website/) y [Grainient](https://grainient.supply/): referencias de formas, degradados y textura; los SVG del sitio son locales.
- [Transitions.dev](https://transitions.dev/) y [OriginKit](https://www.originkit.dev/): referencias para paneles y cambios de estado.

© 2026 Juan Carlos Andrade Unigarro.
