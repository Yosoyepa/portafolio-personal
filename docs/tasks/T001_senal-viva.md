# T001 · «Señal viva»: actividad de GitHub, DataRain, retrato ASCII y logos reales

Fecha: 2026-10-24 · Arquitecto y diseñador: Claude Opus 5.5 · Workers: Claude Opus 5.5 `xhigh` (decisión del responsable
solo para esta sesión: nada de Haiku ni Sonnet en diseño o implementación).

## Contexto y punto de partida

- Sitio: Next.js 15 (App Router, `output: "export"`), React 19, TypeScript estricto, Tailwind 4, Motion 13, Lenis.
  Alias `@/*` → `src/*`; por tanto `@/components/ui` = `src/components/ui`. No hay `components.json` de shadcn: no hace
  falta inicializarlo, la estructura `components/ui` ya es compatible. `tw-animate-css` no se instala: ningún componente
  usa sus clases.
- Paso 0 hecho por el arquitecto en `main`: componentes de origen copiados tal cual en `src/components/ui/`
  (`activity-heatmap.tsx`, `data-rain.tsx`). El CSS module y los motion tokens del heatmap, y el CSS de DataRain, no
  venían en el prompt del responsable: se recuperaron de las previsualizaciones publicadas en 21st.dev
  (@kuratlielia/activity-heatmap y @anark17r/data-rain) y están en `src/components/ui/activity-heatmap-utils/` y
  `src/components/ui/data-rain.css`. Los `demo.tsx` no se copian: el uso real son las secciones del sitio.
- Línea base (`pnpm build` en `5206de7`): ruta `/` 126 kB, **First Load JS 229 kB**; compartido 103 kB.
- Hashes protegidos (LaserFlow y el perfil no se tocan):
  - `src/components/reactbits/LaserFlow.jsx` `74cb5aeb6362bafb65698129ce38d06397049df635f256c9525da4d05ca5ef0d`
  - `src/components/reactbits/LaserFlow.css` `a7a5be02fd7a69e03ad7bba4dd0f4bf9e4421fb764083fe7e1d307684afd83c5`
  - `src/components/ProfileLaser.tsx` `18cc57a5745d2bf38b9e3cd3e16747269343f685917727db8dc0291e3977ebf3`
- Datos de GitHub: el calendario público de `github.com/users/Yosoyepa/contributions` suma ≈2 680 en su ventana y la API
  GraphQL autenticada da 2 690 en la suya: el perfil ya muestra públicamente las contribuciones privadas (de forma
  anónima). Publicar el calendario no expone nada que no sea ya público. Sin nombres de repos privados.

## Diseño (decisiones del arquitecto)

Identidad que se conserva: fondo `#05060b`/`#070b13`, cian `#63dce5`/`#adf3ed`, violeta `#8b5cf6`/`#a795ee`,
Space Grotesk (display), Geist (texto), JetBrains Mono (metadatos). Todo lo nuevo debe parecer de la misma familia.

1. **Hero con DataRain.** Sustituye a `StarField` (el lienzo de estrellas) como capa animada del inicio. Fondo
   transparente sobre la nebulosa WebP (que sigue siendo el LCP), paleta del sitio (calm `#4fd1e8`, mid `#8b7cf6`,
   hot `#e9a8ff`, core `#eafcff`; ajustable ±10 % si la verificación visual lo pide). El cursor es el obstáculo; con
   el puntero fuera, piloto automático. Se pausa con el botón «Movimiento», fuera de vista y con la pestaña oculta.
   Movimiento reducido: un único fotograma estático.
2. **Nueva sección `#actividad`** entre Proyectos y Stack, compuesta como un perfil de GitHub reinterpretado:
   - Izquierda (≈300 px): tarjeta de perfil con el **retrato ASCII** (ver 3) en un marco de terminal
     `~/yosoyepa $ cat avatar.txt`, nombre, `@Yosoyepa`, bio de una línea, enlace a GitHub y barra de lenguajes
     de los repos públicos propios (colores de lenguaje que da la API).
   - Derecha: panel terminal con cabecera `● ● ●` + comando `git log --author=yosoyepa --since="1 year ago"` que se
     teclea al entrar en vista, chip «snapshot DD mmm AAAA», el **ActivityHeatmap** con selector de rango
     (Último año · años con actividad), 4 indicadores calculados del rango (contribuciones, días activos, racha más
     larga, día récord) con números que ruedan, y una línea de «commit» del día seleccionado.
   - «Activación de commit»: ola diagonal de aparición (del componente), barrido al cambiar de rango, celdas de
     nivel 4 con brillo neón, y pulso de 3 latidos en el último día con actividad tras la ola.
   - Móvil: tarjeta arriba, panel abajo; el heatmap hace scroll horizontal anclado a la fecha más reciente.
3. **Retrato ASCII** (`src/components/ui/ascii-portrait.tsx`), inspirado en las recetas «ASCII photo-effect» de
   21st.dev: a partir de `/assets/juan-portrait-square.webp`, caracteres por luminancia en tonos cian con acentos
   violeta, máscara de viñeta, animación de «decodificación» de arriba abajo al entrar en vista y lente de cursor que
   aviva y revuelve los caracteres cercanos. Coste cero en reposo.
4. **Logos reales.** Marquee, chips de Stack y chips de tecnología de Proyectos y Experiencia muestran el logo de la
   marca: Simple Icons (CC0) con su color oficial; servicios AWS con los iconos oficiales de AWS Architecture Icons.
   Los conceptos sin marca (RAG, LLMOps, FinOps, Event-Driven…) conservan su icono Phosphor.
5. **Contenido** (arquitecto): métrica de commits con datos reales del snapshot, proyecto Ommatix (README público),
   credencial Desarrollo Seguro (CC) COL y diplomado de ML en curso. Nada de AgenticRank (sin verificar) ni del
   cliente bancario.

## Ítems críticos y definición de hecho

### I1 · Heatmap fiel al diseño y con datos reales
Riesgo: que se «parezca» pero pierda el diseño original, o que muestre datos inventados.
- [ ] `src/components/ui/activity-heatmap-utils/activity-heatmap.module.css` conserva todas las reglas recuperadas;
      el tema oscuro se aplica con variables en un contenedor, no editando las reglas del módulo.
- [ ] `node scripts/fetch-github-activity.mjs` regenera `src/data/github-activity.json` (token por `GITHUB_TOKEN` o
      `gh auth token`; el token nunca se escribe en disco ni en logs).
- [ ] El total del rango «Último año» del JSON coincide con `gh api graphql … contributionCalendar{totalContributions}`
      del mismo día (diferencia 0).
- [ ] ES/EN: el componente acepta textos traducidos; con EN los textos por defecto son idénticos al original.

### I2 · Animación tipo commit y accesibilidad del heatmap
- [ ] Ola de aparición al entrar en vista; barrido al cambiar de rango; números que ruedan; pulso del último día.
- [ ] Teclado: flechas, Inicio/Fin, Enter selecciona y la línea de commit lo anuncia (`aria-live`).
- [ ] `prefers-reduced-motion`: sin ola, sin pulso, sin tecleo; todo visible al instante.

### I3 · DataRain en el hero sin romper rendimiento ni legibilidad
- [ ] `StarField` deja de importarse (archivo borrado si queda sin uso).
- [ ] Bucle detenido con el botón «Movimiento», fuera de vista y con la pestaña oculta (verificado contando frames).
- [ ] Contraste del texto del hero ≥ 4,5:1 sobre el fondo resultante en las zonas del titular y la descripción.
- [ ] Movimiento reducido: un fotograma estático, sin listeners de puntero activos.

### I4 · Retrato ASCII
- [ ] Generado en el cliente desde el WebP real; `role="img"` con `aria-label` ES/EN.
- [ ] Decodificación al entrar en vista; lente de cursor; sin rAF en reposo (0 frames tras 1 s sin interacción).
- [ ] Movimiento reducido: retrato final estático.

### I5 · Logos reales
- [ ] Marquee, Stack, Proyectos y Experiencia muestran logos de marca donde existan; resto con Phosphor.
- [ ] Logos oscuros (`#000`, `#181717`, `#191919`…) se pintan en claro para fondo oscuro.
- [ ] Fuente y licencia de cada familia de iconos anotadas en `docs/visual-assets.md`.

### I6 · Contenido veraz
- [ ] Cada dato nuevo tiene fuente (README público, API de GitHub o memoria del responsable con `id:línea`).
- [ ] Sin AgenticRank, sin nombre del cliente bancario, sin datos privados.

### I7 · Calidad y presupuesto (sobre `main` tras integrar)
- [ ] `pnpm test` en verde; `npx tsc --noEmit` sin errores; `pnpm build` exporta.
- [ ] First Load JS de `/` ≤ **265 kB** (línea base 229 kB).
- [ ] Sin scroll horizontal a 1440×900, 768×1024 y 390×844; consola sin errores.
- [ ] Hashes de LaserFlow y ProfileLaser idénticos a los de arriba.

### I8 · Gates irreversibles
- [ ] Nada de `push`, deploy ni PR sin aprobación explícita del responsable en el chat.

## Plan de delegación

| Fase | Quién | Modelo / esfuerzo | Entrega |
|---|---|---|---|
| 0. Criterios, diseño, componentes de origen | Arquitecto | Opus 5.5 | Este documento + commit base |
| 1a. Sección Actividad + datos | `w-activity` | Opus 5.5 · xhigh | Heatmap integrado, script y JSON, sección `#actividad` |
| 1b. DataRain en hero + retrato ASCII | `w-rain-ascii` | Opus 5.5 · xhigh | Hero con DataRain, `ascii-portrait.tsx` |
| 1c. Logos reales | `w-brand` | Opus 5.5 · xhigh | `BrandIcon`, Marquee/Stack/Proyectos/Experiencia |
| 2. Contenido y montaje | Arquitecto | Opus 5.5 | Métricas, Ommatix, credenciales, retrato en Actividad |
| 3. Revisión y prueba ciega | Arquitecto + `w-blind` | Opus 5.5 · xhigh | Checklist re-ejecutado en `main`, informe de fricción |

Rutas exclusivas por worker: ver cada brief. Ningún worker edita `src/lib/content.ts`, `caseStudies.ts`,
`career.ts`, `globals.css` ni `portfolio.css` (cada uno trae su propia hoja de estilos).

## Cierre

_(se rellena al final)_
