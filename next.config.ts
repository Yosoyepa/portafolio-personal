import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sitio 100% estático: `out/` se puede publicar en GitHub Pages, Vercel, Netlify…
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
