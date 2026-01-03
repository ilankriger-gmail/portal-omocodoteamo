import type { ScraperResult } from "./index";
import { getBrowser, delay } from "./browser";

export async function scrapFacebook(url: string): Promise<ScraperResult> {
  let browser = null;

  try {
    // Normalizar URL
    const pageUrl = normalizeUrl(url);
    if (!pageUrl) {
      return { seguidores: null, erro: "URL do Facebook inválida" };
    }

    browser = await getBrowser();
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Bloquear recursos desnecessários
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await delay(2000);

    // Extrair número de seguidores/curtidas
    const seguidores = await page.evaluate(() => {
      // Método 1: Buscar texto com "followers" ou "seguidores"
      const allText = document.body.innerText;

      // Padrões comuns do Facebook
      const patterns = [
        /([\d,.]+[KMB]?)\s*(?:people follow|followers|seguidores)/i,
        /([\d,.]+[KMB]?)\s*(?:people like|likes|curtidas)/i,
        /(?:follow|seguem)[^\d]*([\d,.]+[KMB]?)/i,
      ];

      for (const pattern of patterns) {
        const match = allText.match(pattern);
        if (match) {
          return match[1];
        }
      }

      // Método 2: Buscar em elementos específicos
      const spans = document.querySelectorAll("span");
      for (const span of spans) {
        const text = span.textContent || "";
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match) {
            return match[1];
          }
        }
      }

      return null;
    });

    await browser.close();

    if (!seguidores) {
      return {
        seguidores: null,
        erro: "Facebook: Não foi possível extrair (página pode exigir login)"
      };
    }

    const numero = parseFollowerCount(seguidores);
    return { seguidores: numero, erro: null };
  } catch (error) {
    if (browser) await browser.close();
    return {
      seguidores: null,
      erro: `Facebook: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

function normalizeUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes("facebook.com") && !urlObj.hostname.includes("fb.com")) {
      return null;
    }
    return url;
  } catch {
    // Assume que é um page name
    if (url.trim()) {
      return `https://www.facebook.com/${url.trim()}`;
    }
    return null;
  }
}

function parseFollowerCount(str: string): number {
  let cleaned = str.replace(/,/g, "").replace(/\./g, "");

  const multipliers: Record<string, number> = {
    K: 1000,
    M: 1000000,
    B: 1000000000,
  };

  const match = cleaned.match(/^([\d.]+)([KMB])?$/i);
  if (match) {
    const num = parseFloat(match[1]);
    const suffix = match[2]?.toUpperCase();
    return Math.round(num * (suffix ? multipliers[suffix] : 1));
  }

  return parseInt(cleaned, 10) || 0;
}
