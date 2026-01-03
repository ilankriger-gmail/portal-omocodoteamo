import { scrapInstagram } from "./instagram";
import { scrapYoutube } from "./youtube";
import { scrapTiktok } from "./tiktok";
import { scrapFacebook } from "./facebook";
import { scrapKwai } from "./kwai";
import { scrapThreads } from "./threads";

export type ScraperResult = {
  seguidores: number | null;
  erro: string | null;
};

const scrapers: Record<string, (url: string) => Promise<ScraperResult>> = {
  instagram: scrapInstagram,
  youtube: scrapYoutube,
  tiktok: scrapTiktok,
  facebook: scrapFacebook,
  kwai: scrapKwai,
  threads: scrapThreads,
};

export async function buscarSeguidores(
  plataforma: string,
  url: string
): Promise<ScraperResult> {
  const scraper = scrapers[plataforma.toLowerCase()];

  if (!scraper) {
    return {
      seguidores: null,
      erro: `Plataforma "${plataforma}" não suportada para scraping automático`,
    };
  }

  try {
    return await scraper(url);
  } catch (error) {
    return {
      seguidores: null,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export { scrapInstagram, scrapYoutube, scrapTiktok, scrapFacebook, scrapKwai, scrapThreads };
