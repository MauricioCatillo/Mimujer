import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedDir = path.resolve(__dirname, '../../uploads/generated');

let puppeteerModule;

async function loadPuppeteer() {
  if (puppeteerModule) {
    return puppeteerModule;
  }
  try {
    const mod = await import('puppeteer');
    puppeteerModule = mod.default || mod;
    return puppeteerModule;
  } catch (error) {
    console.warn('[screenshotService] Puppeteer no disponible:', error.message);
    return null;
  }
}

export async function ensureGeneratedDir() {
  await fs.mkdir(generatedDir, { recursive: true });
  return generatedDir;
}

export async function generateScreenshot(url, filename = null) {
  const puppeteer = await loadPuppeteer();
  if (!puppeteer) {
    throw new Error('La generación automática de miniaturas no está disponible');
  }

  await ensureGeneratedDir();
  const safeName = filename || `${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  const outputPath = path.join(generatedDir, safeName);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: outputPath, fullPage: true });
    return { path: outputPath, filename: safeName };
  } finally {
    await browser.close();
  }
}
