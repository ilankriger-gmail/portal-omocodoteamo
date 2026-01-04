export type ScraperResult = {
  seguidores: number | null;
  erro: string | null;
};

type ScraperFunction = (url: string) => Promise<ScraperResult>;

export async function buscarSeguidores(
  plataforma: string,
  url: string
): Promise<ScraperResult> {
  const platform = plataforma.toLowerCase();

  try {
    // Carregamento dinâmico do módulo específico da plataforma
    let scraperFunction: ScraperFunction;

    switch (platform) {
      case "instagram":
        const instagramModule = await import("./instagram");
        scraperFunction = instagramModule.scrapInstagram;
        break;

      case "youtube":
        const youtubeModule = await import("./youtube");
        scraperFunction = youtubeModule.scrapYoutube;
        break;

      case "tiktok":
        const tiktokModule = await import("./tiktok");
        scraperFunction = tiktokModule.scrapTiktok;
        break;

      case "facebook":
        const facebookModule = await import("./facebook");
        scraperFunction = facebookModule.scrapFacebook;
        break;

      case "kwai":
        const kwaiModule = await import("./kwai");
        scraperFunction = kwaiModule.scrapKwai;
        break;

      case "threads":
        const threadsModule = await import("./threads");
        scraperFunction = threadsModule.scrapThreads;
        break;

      default:
        return {
          seguidores: null,
          erro: `Plataforma "${plataforma}" não suportada para scraping automático`,
        };
    }

    return await scraperFunction(url);
  } catch (error) {
    return {
      seguidores: null,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Export individual scrapers for direct use
// These use dynamic imports to prevent loading at build time
export async function scrapInstagram(url: string): Promise<ScraperResult> {
  const { scrapInstagram } = await import("./instagram");
  return scrapInstagram(url);
}

export async function scrapYoutube(url: string): Promise<ScraperResult> {
  const { scrapYoutube } = await import("./youtube");
  return scrapYoutube(url);
}

export async function scrapTiktok(url: string): Promise<ScraperResult> {
  const { scrapTiktok } = await import("./tiktok");
  return scrapTiktok(url);
}

export async function scrapFacebook(url: string): Promise<ScraperResult> {
  const { scrapFacebook } = await import("./facebook");
  return scrapFacebook(url);
}

export async function scrapKwai(url: string): Promise<ScraperResult> {
  const { scrapKwai } = await import("./kwai");
  return scrapKwai(url);
}

export async function scrapThreads(url: string): Promise<ScraperResult> {
  const { scrapThreads } = await import("./threads");
  return scrapThreads(url);
}