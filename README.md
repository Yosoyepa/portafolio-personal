# Portafolio — Juan Andrade

Portafolio profesional de Juan Carlos Andrade Unigarro, Senior AI Engineer. Sitio bilingüe (ES/EN), 100 % estático.

## Desarrollo y build

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm test     # render loop y recuperación bilingüe
pnpm build    # genera el sitio estático en out/
```

Requiere Node 22.18+ o 24+. Detener `pnpm dev` antes de compilar (ambos escriben en `.next/`). El `out/` resultante se sirve con cualquier hosting estático:

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory out
```

## Despliegue

En Vercel no requiere configuración: importa el repositorio en [vercel.com/new](https://vercel.com/new) y detecta Next.js + pnpm automáticamente. También sirve en GitHub Pages, Netlify o cualquier hosting estático publicando `out/`.

## Cómo está hecho

- **Next.js 15** (App Router, `output: "export"`), React 19, TypeScript y Tailwind 4.
- **Una sola librería de animación** (Motion) + Lenis para scroll suave. Las secciones bajo el viewport usan `content-visibility: auto` y la imagen LCP se precarga desde `layout.tsx`.
- **Efectos con presupuesto propio** (`src/lib/renderLoop.mjs`): canvas 2D para la lluvia de datos del inicio (DataRain) y el retrato ASCII, OGL para Scanner/Dither/RippleGrid y three.js para LaserFlow — todos con límite de fps y DPR, y en pausa fuera de vista, con pestaña oculta o con movimiento reducido.
- **Componentes adaptados de [React Bits](https://reactbits.dev/)**; licencia en `src/components/reactbits/LICENSE.md`.
- **Tipografía autoalojada** con `next/font`: Space Grotesk, Geist y JetBrains Mono.
- **Contenido editable** en `src/lib/content.ts` (textos ES/EN y enlaces), `career.ts` (trayectoria) y `caseStudies.ts` (proyectos).
- **Actividad de GitHub** desde un snapshot versionado (`src/data/github-activity.json`): el sitio sigue siendo estático. Para refrescarlo, con `gh` autenticado o `GITHUB_TOKEN`:

  ```bash
  node scripts/fetch-github-activity.mjs
  ```

- **Componentes de 21st.dev** en `src/components/ui/`: Activity Heatmap (@kuratlielia) y DataRain (@anark17r); el retrato ASCII es propio, inspirado en las recetas ASCII de la comunidad.
- **Logos de tecnologías**: Simple Icons (CC0) y AWS Architecture Icons; fuentes y condiciones en `docs/visual-assets.md`.

## Referencias

- [React Bits](https://reactbits.dev/) — base de los componentes interactivos
- [Space Grotesk en Free Faces](https://www.freefaces.gallery/typefaces/space-grotesk) — tipografía display
- [Spectrums](https://spectrums.framer.website/) y [Grainient](https://grainient.supply/) — referencias de degradados y textura
- [Transitions.dev](https://transitions.dev/) y [OriginKit](https://www.originkit.dev/) — referencias de paneles y transiciones

© 2026 Juan Carlos Andrade Unigarro.
