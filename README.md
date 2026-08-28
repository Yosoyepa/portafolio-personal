# Juan Andrade — Portafolio Profesional

Sitio web personal de **Juan Carlos Andrade Unigarro** — Senior AI Engineer (IA generativa, AWS, LLMOps, serverless).

![Stack](https://img.shields.io/badge/Next.js-15-000?logo=next.js) ![TS](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

## ✨ Características

- **Bilingüe ES/EN** con toggle persistente (`localStorage`) y `<html lang>` dinámico.
- **Hero con firma visual triple**:
  - **Esfera 3D "red neuronal"** — React Three Fiber + Three.js, con parallax de mouse y pausa automática fuera del viewport.
  - **Constelación oculta** — keywords del stack que solo se revelan donde pasa el cursor (linterna con máscara radial + spring), solo en punteros finos.
- **Haz de luz volumétrico en el Perfil** — shader WebGL propio (fog fbm + wisps + tilt hacia el cursor) que cae centrado y **aterriza con un charco de luz** sobre la caja de contenido.
- **Animaciones de alto nivel** — GSAP + ScrollTrigger vía `@gsap/react` (`useGSAP` con scope y cleanup automático), Lenis (scroll suave), Motion/Framer Motion (micro-interacciones, rotador de roles).
- **Marquee de pills** con iconos Phosphor por tecnología.
- **100% estático** (`output: "export"`) → deployable gratis en GitHub Pages, Vercel, Netlify, Cloudflare Pages.
- **Accesible**: skip-link, respeta `prefers-reduced-motion`, focus visible, targets ≥40px, contraste AA, HTML semántico con landmarks.
- **Tipografía**: Syne (display) + Geist (body) + JetBrains Mono (utilitaria) vía `next/font`.
- Diseño oscuro con grano sutil, timeline de experiencia, tarjetas de proyectos y certificaciones.

## 🚀 Uso rápido

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # genera el sitio estático en out/
```

> El build de producción requiere Node 18.18+.

## 🛠 Personalización

| Qué | Dónde |
|-----|-------|
| Textos ES/EN (experiencia, proyectos, skills, certificaciones) | `src/lib/content.ts` |
| **Email y LinkedIn** (¡hay placeholders!) | constantes `EMAIL` y `LINKEDIN_URL` en `src/lib/content.ts` |
| Colores, fuentes y animaciones base | `src/app/globals.css` (tokens `@theme`) |
| Efecto 3D del hero (partículas, colores) | `src/components/ParticleField.tsx` |
| SEO / metadata | `src/app/layout.tsx` |

## ☁️ Despliegue

**Vercel (recomendado):** importa el repo en [vercel.com](https://vercel.com) — cero configuración.

**GitHub Pages:** el build ya genera `out/` estático. Con GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push: { branches: [main] }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@latest  # o: setup-node + pnpm install + pnpm build
      - uses: actions/upload-pages-artifact@v3
        with: { path: out }
```

(O simplemente sube el contenido de `out/` a la rama `gh-pages`.)

## 🔍 Verificación visual (opcional)

Con el sitio estático servido (ej. `python3 -m http.server 4173` dentro de `out/`):

```bash
node scripts/verify-visual.mjs
```

Toma capturas de todas las secciones en ES y EN usando Chrome local.

## 📁 Estructura

```
src/
├── app/            # layout, page, estilos globales, favicon
├── components/
│   ├── providers/  # idioma (i18n) + scroll suave (Lenis+GSAP)
│   ├── Navbar.tsx  Hero.tsx  ParticleField.tsx  Marquee.tsx
│   ├── Metrics.tsx About.tsx  Experience.tsx   Projects.tsx
│   └── Skills.tsx  Certifications.tsx  Contact.tsx  Footer.tsx
└── lib/            # content.ts (todo el contenido bilingüe) + utils
```

---

© 2026 Juan Carlos Andrade Unigarro · Hecho con Next.js, GSAP, Three.js y Tailwind
