import { Browser, Page } from "puppeteer";

let browserInstance: Browser | null = null;

// Verifica se estamos no ambiente de build da Vercel
const isBuild = process.env.NODE_ENV === "production" &&
                process.env.NEXT_PHASE === "phase-production-build";

// Função de delay para substituir page.waitForTimeout (deprecado)
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getBrowser(): Promise<Browser> {
  // Durante o build da Vercel, retorna uma Promise que rejeitará
  // quando realmente tentarem usar o browser
  if (isBuild) {
    console.log("[browser] Ignorando inicialização do browser durante o build");
    return Promise.reject(
      new Error("Browser não disponível durante o build")
    ) as unknown as Promise<Browser>;
  }

  // Para produção na Vercel, usaria puppeteer-core + @sparticuz/chromium
  // Por enquanto, usando puppeteer completo para desenvolvimento local

  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  // Importar puppeteer dinamicamente para evitar carregamento durante o build
  const puppeteer = await import("puppeteer");

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
    } catch (error) {
      console.error("[browser] Erro ao inicializar chromium serverless:", error);
      // Fallback para puppeteer normal
      browserInstance = await puppeteer.default.launch({
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
    browserInstance = await puppeteer.default.launch({
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
  // Durante o build, não faz nada
  if (isBuild) {
    console.log("[browser] Ignorando fechamento do browser durante o build");
    return;
  }

  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
