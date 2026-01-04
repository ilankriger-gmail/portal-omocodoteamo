import type { ScraperResult } from "./index";

export async function scrapInstagram(url: string): Promise<ScraperResult> {
  let browser = null;

  try {
    // Import dinâmico de browser.ts
    const { getBrowser, delay } = await import("./browser");

    // Extrair username da URL
    const username = extractUsername(url);
    if (!username) {
      return { seguidores: null, erro: "URL do Instagram inválida" };
    }

    const profileUrl = `https://www.instagram.com/${username}/`;

    browser = await getBrowser();
    const page = await browser.newPage();

    // Configurar User-Agent para parecer um navegador real
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Bloquear recursos desnecessários para acelerar
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

    // Aguardar um pouco para o conteúdo carregar
    await delay(2000);

    // Tentar extrair seguidores do meta tag (mais confiável)
    const seguidores = await page.evaluate(() => {
      // Método 1: Meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const content = metaDesc.getAttribute("content") || "";
        // Formato: "X Followers, Y Following, Z Posts..."
        const match = content.match(/([\d,.]+[KMB]?)\s*Followers/i);
        if (match) {
          return match[1];
        }
        // Formato PT-BR: "X seguidores"
        const matchPt = content.match(/([\d,.]+[KMB]?)\s*seguidores/i);
        if (matchPt) {
          return matchPt[1];
        }
      }

      // Método 2: Elemento do perfil (menos confiável, muda frequentemente)
      const followerElements = document.querySelectorAll('span[title]');
      for (const el of followerElements) {
        const title = el.getAttribute("title");
        if (title && /^\d/.test(title)) {
          return title;
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
    if (browser) {
      // Import browser.ts para fechar o browser
      const { closeBrowser } = await import("./browser");
      await browser.close();
    }
    return {
      seguidores: null,
      erro: `Instagram: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

function extractUsername(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes("instagram.com")) return null;

    // Remove trailing slash and get last part
    const path = urlObj.pathname.replace(/\/$/, "");
    const parts = path.split("/").filter(Boolean);
    return parts[0] || null;
  } catch {
    // Se não for URL válida, assume que é o username direto
    return url.replace("@", "").trim() || null;
  }
}

function parseFollowerCount(str: string): number {
  // Remove pontos/vírgulas de milhares e converte sufixos
  let cleaned = str.replace(/,/g, "").replace(/\./g, "");

  // Trata sufixos K, M, B
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
