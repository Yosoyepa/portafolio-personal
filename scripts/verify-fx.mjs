/* Verificación de efectos: haz de luz + revelado por cursor. Uso interno. */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const OUT = "/home/jandradeu/Documents/memories/Memories/portfolio-verify";
const URL = "http://127.0.0.1:4173/";
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--disable-gpu", "--hide-scrollbars", "--no-first-run", "--disable-dev-shm-usage", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 160)}`);
});

await page.setViewport({ width: 1440, height: 950 });
await page.goto(URL, { waitUntil: "load", timeout: 90000 });
await new Promise((r) => setTimeout(r, 4500));

// 1. Hero en reposo (haz + esfera, sin cursor)
await page.screenshot({ path: `${OUT}/fx-01-hero-beam.png` });

// 2. Cursor sobre la zona derecha → revelado de keywords
await page.mouse.move(1150, 420);
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}/fx-02-hero-reveal-right.png` });

// 3. Cursor sobre zona inferior-izquierda → código revelado
await page.mouse.move(320, 700);
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}/fx-03-hero-reveal-code.png` });

// 4. Marquee pills (scroll a la franja)
await page.evaluate(() => window.scrollTo(0, document.getElementById("inicio").scrollHeight - 40));
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: `${OUT}/fx-04-marquee.png` });

// WebGL activo en el canvas del haz
const glInfo = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  return c ? { w: c.width, h: c.height } : null;
});

console.log("canvas beam:", JSON.stringify(glInfo), "| errores:", errors.length ? errors.join(" || ") : "ninguno");
await browser.close();
