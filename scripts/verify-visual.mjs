/* Verificación visual del portafolio con Chrome del sistema. Uso interno (no se despliega). */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const OUT = "/home/jandradeu/Documents/memories/Memories/portfolio-verify";
const URL = "http://127.0.0.1:4173/";
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--disable-gpu", "--hide-scrollbars", "--no-first-run", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
});

// ── Desktop 1440×950 ──────────────────────────────────────────────
await page.setViewport({ width: 1440, height: 950 });
await page.goto(URL, { waitUntil: "load", timeout: 90000 });
await new Promise((r) => setTimeout(r, 4000));
await page.screenshot({ path: `${OUT}/p-01-hero-es.png` });

for (const [i, id] of ["perfil", "experiencia", "proyectos", "stack", "certificaciones", "contacto"].entries()) {
  await page.evaluate((sec) => {
    const el = document.getElementById(sec);
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  }, id);
  await new Promise((r) => setTimeout(r, 1600));
  await page.screenshot({ path: `${OUT}/p-0${i + 2}-sec-${id}.png` });
}

// Toggle EN + hero
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  btns.find((b) => b.textContent?.trim() === "en")?.click();
});
await new Promise((r) => setTimeout(r, 700));
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise((r) => setTimeout(r, 1400));
await page.screenshot({ path: `${OUT}/p-08-hero-en.png` });
const hasEn = await page.evaluate(() => document.body.innerText.includes("Hybrid engineer"));

// ── Móvil 390×844 ─────────────────────────────────────────────────
await page.setViewport({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}/p-09-movil-hero.png` });

for (const [i, id] of ["experiencia", "proyectos", "contacto"].entries()) {
  await page.evaluate((sec) => {
    const el = document.getElementById(sec);
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  }, id);
  await new Promise((r) => setTimeout(r, 1400));
  await page.screenshot({ path: `${OUT}/p-1${i}-movil-${id}.png` });
}

// Overflow horizontal en móvil
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);

console.log("EN visible:", hasEn, "| overflow-x móvil(px):", overflow, "| errores JS:", errors.length ? errors.join(" || ") : "ninguno");
await browser.close();
