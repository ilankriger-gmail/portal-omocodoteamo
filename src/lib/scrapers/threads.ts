import type { ScraperResult } from "./index";

export async function scrapThreads(url: string): Promise<ScraperResult> {
  let browser = null;

  try {
    // Import dinâmico de browser.ts
    const { getBrowser, delay } = await import("./browser");

    // Extrair username da URL
    const username = extractUsername(url);
    if (!username) {
      return { seguidores: null, erro: "URL do Threads inválida" };
    }

    const profileUrl = `https://www.threads.net/@${username}`;

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
    await delay(2000);

    // Extrair número de seguidores
    const seguidores = await page.evaluate(() => {
      // Método 1: Meta description (formato comum do Threads)
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const content = metaDesc.getAttribute("content") || "";
        // Formato: "X followers"
        const match = content.match(/([\d,.]+[KMB]?)\s*followers/i);
        if (match) {
          return match[1];
        }
        // Formato PT-BR
        const matchPt = content.match(/([\d,.]+[KMB]?)\s*seguidores/i);
        if (matchPt) {
          return matchPt[1];
        }
      }

      // Método 2: Buscar por texto com "followers" ou "seguidores"
      const allText = document.body.innerText;

      const patterns = [
        /([\d,.]+[KMB]?)\s*(?:followers|seguidores)/i,
      ];

      for (const pattern of patterns) {
        const match = allText.match(pattern);
        if (match) {
          return match[1];
        }
      }

      // Método 3: Buscar elementos com dados de seguidores
      const links = document.querySelectorAll("a");
      for (const link of links) {
        const text = link.textContent || "";
        if (text.includes("followers") || text.includes("seguidores")) {
          const match = text.match(/([\d,.]+[KMB]?)/i);
          if (match) {
            return match[1];
          }
        }
      }

      return null;
    });

    await browser.close();

    if (!seguidores) {
      return { seguidores: null, erro: "Threads: Não foi possível extrair seguidores" };
    }

    const numero = parseFollowerCount(seguidores);
    return { seguidores: numero, erro: null };
  } catch (error) {
    if (browser) {
      // Import browser.ts para fechar o browser
      const { closeBrowser } = await import("./browser");
      await browser.close();
    }
    return {
      seguidores: null,
      erro: `Threads: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

function extractUsername(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes("threads.net")) return null;

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
