/**
 * Génère splash + icônes Android + logo UI transparent depuis public/logo-app.png.
 * Exécution : `npm run mobile:android:branding`
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Jimp, rgbaToInt } from "jimp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const logoPath = join(root, "public", "logo-app.png");
const logoUiPath = join(root, "public", "logo-app-ui.png");
const resRoot = join(root, "android", "app", "src", "main", "res");

/** Fond pages app — oklch(0.965 0.006 264) ≈ #f4f4f7 */
const APP_BG = rgbaToInt(244, 244, 247, 255);
const TRANSPARENT = rgbaToInt(0, 0, 0, 0);

/** Zone sûre icône adaptive Android (~66 % du diamètre). */
const LAUNCHER_SAFE_SCALE = 0.62;
const LEGACY_ICON_SCALE = 0.72;
const SPLASH_SCALE = 0.74;

let logoSource;

async function loadLogoSource() {
  if (!logoSource) {
    logoSource = await Jimp.read(logoPath);
  }
  return logoSource;
}

function makeNearWhiteTransparent(image, threshold = 246) {
  const { data } = image.bitmap;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0;
    }
  }
  return image;
}

/** Logo UI : fond blanc retiré pour fusionner avec bg-background. */
async function writeUiLogo() {
  const src = await loadLogoSource();
  const ui = src.clone();
  makeNearWhiteTransparent(ui);
  await ui.write(logoUiPath);
  console.info("Wrote public/logo-app-ui.png");
}

async function logoFitBox(maxW, maxH) {
  const src = await loadLogoSource();
  const logo = src.clone();
  const ratio = Math.min(maxW / logo.bitmap.width, maxH / logo.bitmap.height, 1);
  const w = Math.max(32, Math.round(logo.bitmap.width * ratio));
  const h = Math.max(32, Math.round(logo.bitmap.height * ratio));
  logo.resize({ w, h });
  return logo;
}

async function compositeCentered(canvasW, canvasH, maxScale, bgColor) {
  const maxW = canvasW * maxScale;
  const maxH = canvasH * maxScale;
  const logo = await logoFitBox(maxW, maxH);
  const canvas = new Jimp({ width: canvasW, height: canvasH, color: bgColor });
  const x = Math.round((canvasW - logo.bitmap.width) / 2);
  const y = Math.round((canvasH - logo.bitmap.height) / 2);
  canvas.composite(logo, x, y);
  return canvas.getBuffer("image/png");
}

async function splashAt(w, h) {
  return compositeCentered(w, h, SPLASH_SCALE, APP_BG);
}

async function squareIcon(size) {
  return compositeCentered(size, size, LEGACY_ICON_SCALE, APP_BG);
}

/** Premier plan adaptive : logo seul, fond transparent, dans la zone sûre. */
async function adaptiveForeground(size) {
  const logo = await logoFitBox(size * LAUNCHER_SAFE_SCALE, size * LAUNCHER_SAFE_SCALE);
  const canvas = new Jimp({ width: size, height: size, color: TRANSPARENT });
  const x = Math.round((size - logo.bitmap.width) / 2);
  const y = Math.round((size - logo.bitmap.height) / 2);
  canvas.composite(logo, x, y);
  return canvas.getBuffer("image/png");
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
  console.info("Source:", logoPath);
  await writeUiLogo();

  for (const [rel, w, h] of splashes) {
    const out = join(resRoot, rel);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, await splashAt(w, h));
    console.info("Wrote", rel, `${w}x${h}`);
  }

  for (const [folder, size] of legacyLaunchers) {
    for (const name of ["ic_launcher.png", "ic_launcher_round.png"]) {
      const out = join(resRoot, folder, name);
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, await squareIcon(size));
      console.info("Wrote", `${folder}/${name}`, `${size}x${size}`);
    }
  }

  for (const [folder, size] of foregrounds) {
    const out = join(resRoot, folder, "ic_launcher_foreground.png");
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, await adaptiveForeground(size));
    console.info("Wrote", `${folder}/ic_launcher_foreground.png`, `${size}x${size}`);
  }

  console.info("Terminé.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
