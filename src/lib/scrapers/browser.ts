import puppeteer, { Browser, Page } from "puppeteer";

let browserInstance: Browser | null = null;

// Função de delay para substituir page.waitForTimeout (deprecado)
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getBrowser(): Promise<Browser> {
  // Para produção na Vercel, usaria puppeteer-core + @sparticuz/chromium
  // Por enquanto, usando puppeteer completo para desenvolvimento local

  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // Produção: usar puppeteer-core com chromium serverless
    try {
      const chromium = await import("@sparticuz/chromium");
      const puppeteerCore = await import("puppeteer-core");

      browserInstance = await puppeteerCore.default.launch({
        args: chromium.default.args,
        defaultViewport: chromium.default.defaultViewport,
        executablePath: await chromium.default.executablePath(),
        headless: true,
      });
    } catch {
      // Fallback para puppeteer normal
      browserInstance = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920,1080",
        ],
      });
    }
  } else {
    // Desenvolvimento: usar puppeteer com Chromium bundled
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
  }

  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
