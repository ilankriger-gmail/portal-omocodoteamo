import type { ScraperResult } from "./index";
import { getBrowser, delay } from "./browser";

export async function scrapYoutube(url: string): Promise<ScraperResult> {
  let browser = null;

  try {
    // Extrair channel ID ou handle da URL
    const channelUrl = normalizeYoutubeUrl(url);
    if (!channelUrl) {
      return { seguidores: null, erro: "URL do YouTube inválida" };
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

    await page.goto(channelUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await delay(2000);

    // Extrair número de inscritos
    const inscritos = await page.evaluate(() => {
      // Método 1: Elemento com ID específico
      const subscriberEl = document.querySelector("#subscriber-count");
      if (subscriberEl) {
        return subscriberEl.textContent?.trim() || null;
      }

      // Método 2: Span com classe de inscritos
      const spans = document.querySelectorAll("span");
      for (const span of spans) {
        const text = span.textContent?.toLowerCase() || "";
        if (
          text.includes("subscriber") ||
          text.includes("inscrito") ||
          text.includes("inscritos")
        ) {
          // Tentar extrair número do próprio elemento ou vizinho
          const match = text.match(/([\d,.]+[KMB]?)/i);
          if (match) {
            return match[1];
          }
        }
      }

      // Método 3: Meta tag
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const content = metaDesc.getAttribute("content") || "";
        const match = content.match(/([\d,.]+[KMB]?)\s*(subscribers?|inscritos?)/i);
        if (match) {
          return match[1];
        }
      }

      return null;
    });

    await browser.close();

    if (!inscritos) {
      return { seguidores: null, erro: "Não foi possível extrair inscritos" };
    }

    const numero = parseSubscriberCount(inscritos);
    return { seguidores: numero, erro: null };
  } catch (error) {
    if (browser) await browser.close();
    return {
      seguidores: null,
      erro: `YouTube: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

function normalizeYoutubeUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes("youtube.com") && !urlObj.hostname.includes("youtu.be")) {
      return null;
    }

    // Se já é uma URL de canal, retornar
    if (urlObj.pathname.includes("/channel/") || urlObj.pathname.includes("/@")) {
      return url;
    }

    // Se é uma URL de vídeo ou outro formato, tentar extrair o canal
    return url;
  } catch {
    // Assume que é um handle como @username
    if (url.startsWith("@")) {
      return `https://www.youtube.com/${url}`;
    }
    return null;
  }
}

function parseSubscriberCount(str: string): number {
  // Remove texto e mantém apenas números e sufixos
  let cleaned = str.replace(/[^\d,.KMBkmbMilmil]/gi, "");

  // Trata "mil" como K
  cleaned = cleaned.replace(/mil/gi, "K");

  // Remove separadores de milhares
  cleaned = cleaned.replace(/,/g, "").replace(/\./g, "");

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
