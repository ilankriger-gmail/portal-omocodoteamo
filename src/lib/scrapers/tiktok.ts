import type { ScraperResult } from "./index";
import { getBrowser, delay } from "./browser";

export async function scrapTiktok(url: string): Promise<ScraperResult> {
  let browser = null;

  try {
    // Extrair username da URL
    const username = extractUsername(url);
    if (!username) {
      return { seguidores: null, erro: "URL do TikTok inválida" };
    }

    const profileUrl = `https://www.tiktok.com/@${username}`;

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

    await page.goto(profileUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await delay(3000);

    // Extrair número de seguidores
    const seguidores = await page.evaluate(() => {
      // Método 1: Buscar por data-e2e attribute
      const followerEl = document.querySelector('[data-e2e="followers-count"]');
      if (followerEl) {
        return followerEl.textContent?.trim() || null;
      }

      // Método 2: Buscar por título/texto
      const strongElements = document.querySelectorAll("strong");
      for (const el of strongElements) {
        const title = el.getAttribute("title");
        if (title && /^\d/.test(title)) {
          const parent = el.closest("div");
          const parentText = parent?.textContent?.toLowerCase() || "";
          if (
            parentText.includes("follower") ||
            parentText.includes("seguidor")
          ) {
            return title;
          }
        }
      }

      // Método 3: Buscar no JSON-LD
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || "{}");
          if (data.interactionStatistic) {
            for (const stat of data.interactionStatistic) {
              if (stat.interactionType?.includes("Follow")) {
                return stat.userInteractionCount?.toString();
              }
            }
          }
        } catch {
          continue;
        }
      }

      return null;
    });

    await browser.close();

    if (!seguidores) {
      return { seguidores: null, erro: "Não foi possível extrair seguidores" };
    }

    const numero = parseFollowerCount(seguidores);
    return { seguidores: numero, erro: null };
  } catch (error) {
    if (browser) await browser.close();
    return {
      seguidores: null,
      erro: `TikTok: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

function extractUsername(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes("tiktok.com")) return null;

    // Remove @ do início se houver
    const path = urlObj.pathname.replace(/\/$/, "");
    const parts = path.split("/").filter(Boolean);
    const username = parts[0]?.replace("@", "");
    return username || null;
  } catch {
    // Assume que é username direto
    return url.replace("@", "").trim() || null;
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
