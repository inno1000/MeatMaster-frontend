/**
 * Génère splash + icônes Android à partir de public/logo.svg (sans sharp).
 * Exécution : depuis la racine du repo, `node scripts/generate-android-branding.mjs`
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { Jimp, rgbaToInt } from "jimp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "logo.svg");
const resRoot = join(root, "android", "app", "src", "main", "res");

const BG = rgbaToInt(250, 252, 253, 255);

const resvgBase = {
  font: { loadSystemFonts: true, defaultFontFamily: "sans-serif" },
};

async function splashAt(w, h) {
  const targetW = Math.min(w, h) * 0.58;
  const resvg = new Resvg(await readFile(svgPath), {
    ...resvgBase,
    fitTo: { mode: "width", value: Math.max(48, Math.round(targetW)) },
  });
  const logoBuf = Buffer.from(resvg.render().asPng());
  const logo = await Jimp.read(logoBuf);
  const canvas = new Jimp({ width: w, height: h, color: BG });
  const x = Math.round((w - logo.bitmap.width) / 2);
  const y = Math.round((h - logo.bitmap.height) / 2);
  canvas.composite(logo, x, y);
  return canvas.getBuffer("image/png");
}

/** Icône carrée (legacy) : fond + logo */
async function squareIcon(size, logoScale) {
  const resvg = new Resvg(await readFile(svgPath), {
    ...resvgBase,
    fitTo: { mode: "width", value: Math.max(32, Math.round(size * logoScale)) },
  });
  const logo = await Jimp.read(Buffer.from(resvg.render().asPng()));
  const canvas = new Jimp({ width: size, height: size, color: BG });
  const x = Math.round((size - logo.bitmap.width) / 2);
  const y = Math.round((size - logo.bitmap.height) / 2);
  canvas.composite(logo, x, y);
  return canvas.getBuffer("image/png");
}

/** Calque premier plan adaptive (fond transparent) */
async function adaptiveForeground(size) {
  const resvg = new Resvg(await readFile(svgPath), {
    ...resvgBase,
    fitTo: { mode: "width", value: Math.max(32, Math.round(size * 0.58)) },
  });
  return Buffer.from(resvg.render().asPng());
}

const splashes = [
  ["drawable/splash.png", 480, 320],
  ["drawable-land-hdpi/splash.png", 800, 480],
  ["drawable-land-mdpi/splash.png", 480, 320],
  ["drawable-land-xhdpi/splash.png", 1280, 720],
  ["drawable-land-xxhdpi/splash.png", 1600, 960],
  ["drawable-land-xxxhdpi/splash.png", 1920, 1280],
  ["drawable-port-hdpi/splash.png", 480, 800],
  ["drawable-port-mdpi/splash.png", 320, 480],
  ["drawable-port-xhdpi/splash.png", 720, 1280],
  ["drawable-port-xxhdpi/splash.png", 960, 1600],
  ["drawable-port-xxxhdpi/splash.png", 1280, 1920],
];

const legacyLaunchers = [
  ["mipmap-mdpi", 48],
  ["mipmap-hdpi", 72],
  ["mipmap-xhdpi", 96],
  ["mipmap-xxhdpi", 144],
  ["mipmap-xxxhdpi", 192],
];

const foregrounds = [
  ["mipmap-mdpi", 108],
  ["mipmap-hdpi", 162],
  ["mipmap-xhdpi", 216],
  ["mipmap-xxhdpi", 324],
  ["mipmap-xxxhdpi", 432],
];

async function main() {
  console.info("Source:", svgPath);

  for (const [rel, w, h] of splashes) {
    const out = join(resRoot, rel);
    await mkdir(dirname(out), { recursive: true });
    const buf = await splashAt(w, h);
    await writeFile(out, buf);
    console.info("Wrote", rel, `${w}x${h}`);
  }

  for (const [folder, size] of legacyLaunchers) {
    for (const name of ["ic_launcher.png", "ic_launcher_round.png"]) {
      const out = join(resRoot, folder, name);
      await mkdir(dirname(out), { recursive: true });
      const buf = await squareIcon(size, 0.62);
      await writeFile(out, buf);
      console.info("Wrote", `${folder}/${name}`, `${size}x${size}`);
    }
  }

  for (const [folder, size] of foregrounds) {
    const out = join(resRoot, folder, "ic_launcher_foreground.png");
    await mkdir(dirname(out), { recursive: true });
    const buf = await adaptiveForeground(size);
    await writeFile(out, buf);
    console.info("Wrote", `${folder}/ic_launcher_foreground.png`, `${size}x${size}`);
  }

  console.info("Terminé.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
