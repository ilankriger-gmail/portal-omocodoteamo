import { PrismaClient } from "@prisma/client";
import puppeteer from 'puppeteer';

const prisma = new PrismaClient();

// Configuration
const MAX_CONCURRENT = 2;
const DELAY_BETWEEN_REQUESTS = 3000;

// Delay function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse follower count from string (e.g. "1.2M", "500K", "1,200")
function parseFollowerCount(str: string): number {
  if (!str) return 0;

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

// Update followers for a social network
async function updateFollowers(rede: { id: string, plataforma: string, url: string, usuario: string }) {
  // Skip platforms without a scraper implementation
  if (["whatsapp", "x", "telegram"].includes(rede.plataforma)) {
    console.log(`Pulando ${rede.plataforma} (sem suporte para contagem de seguidores)`);
    return null;
  }

  // Skip empty URLs
  if (!rede.url) {
    console.log(`Pulando ${rede.plataforma}/${rede.usuario} (URL vazia)`);
    return null;
  }

  let browser;
  try {
    console.log(`Atualizando seguidores para ${rede.plataforma}: ${rede.url}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ]
    });

    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate to profile URL
    await page.goto(rede.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000); // Wait for dynamic content

    let followerCount = null;
    let error = null;

    // Extract follower count based on platform
    try {
      if (rede.plataforma === 'instagram') {
        // Instagram: Look for meta description
        followerCount = await page.evaluate(() => {
          const meta = document.querySelector('meta[name="description"]');
          if (meta) {
            const content = meta.getAttribute("content") || "";
            const match = content.match(/([\d,.]+[KMB]?)\s*(?:Followers|seguidores)/i);
            if (match) return match[1];
          }
          return null;
        });
      }
      else if (rede.plataforma === 'youtube') {
        // YouTube: Look for subscriber count
        followerCount = await page.evaluate(() => {
          const subscriberElements = document.querySelectorAll('#subscriber-count, .ytd-c4-tabbed-header-renderer');
          for (const el of Array.from(subscriberElements)) {
            const text = el.textContent || "";
            if (text.includes('inscritos') || text.includes('subscribers')) {
              return text.replace(/[^0-9KMB,.]/gi, '').trim();
            }
          }
          return null;
        });
      }
      else if (rede.plataforma === 'tiktok') {
        // TikTok: Look for follower count
        followerCount = await page.evaluate(() => {
          const followerElements = document.querySelectorAll('strong, .count-infos span, .tiktok-1kq5ae-SpanFollowerCount');
          for (const el of Array.from(followerElements)) {
            const text = el.textContent || "";
            if (text.match(/^\s*[\d,.]+[KMB]?\s*$/)) {
              return text.trim();
            }
          }
          return null;
        });
      }
      else if (rede.plataforma === 'facebook') {
        // Facebook: Look for follower count
        followerCount = await page.evaluate(() => {
          const followerElements = document.querySelectorAll('span[dir="auto"]');
          for (const el of Array.from(followerElements)) {
            const text = el.textContent || "";
            if (text.match(/[\d,.]+[KMB]?\s*(seguidores|followers)/i)) {
              return text.replace(/[^0-9KMB,.]/gi, '').trim();
            }
          }
          return null;
        });
      }
      else if (rede.plataforma === 'threads') {
        // Threads: Look for follower count
        followerCount = await page.evaluate(() => {
          const linkElements = document.querySelectorAll('a[href*="followers"]');
          for (const el of Array.from(linkElements)) {
            const text = el.textContent || "";
            if (text.match(/[\d,.]+[KMB]?/)) {
              return text.replace(/[^0-9KMB,.]/gi, '').trim();
            }
          }
          return null;
        });
      }
      else if (rede.plataforma === 'kwai') {
        // Kwai: Look for follower count
        followerCount = await page.evaluate(() => {
          const followerElements = document.querySelectorAll('.profile-user-count span, .profile-counts span');
          for (const el of Array.from(followerElements)) {
            const text = el.textContent || "";
            if (text.match(/[\d,.]+[KMB]?\s*(seguidores|followers)/i)) {
              return text.replace(/[^0-9KMB,.]/gi, '').trim();
            }
          }
          return null;
        });
      }

      if (!followerCount) {
        error = `Não foi possível extrair contagem de seguidores`;
      }
    } catch (err) {
      error = `Erro ao extrair seguidores: ${err.message}`;
    }

    await browser.close();

    // Convert follower count string to number
    const seguidores = followerCount ? parseFollowerCount(followerCount) : null;

    // Update database
    if (seguidores !== null || error !== null) {
      await prisma.redeSocial.update({
        where: { id: rede.id },
        data: {
          seguidores: seguidores,
          seguidoresAtualizadoEm: new Date(),
          erroAtualizacao: error || null
        }
      });
    }

    if (seguidores !== null) {
      console.log(`✅ ${rede.plataforma}: ${seguidores.toLocaleString()} seguidores`);
    } else if (error) {
      console.log(`⚠️ ${rede.plataforma}: ${error}`);
    }

    return { plataforma: rede.plataforma, seguidores, erro: error };
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${rede.plataforma}:`, error);

    // Update database with error
    try {
      await prisma.redeSocial.update({
        where: { id: rede.id },
        data: {
          seguidoresAtualizadoEm: new Date(),
          erroAtualizacao: `Erro: ${error.message}`
        }
      });
    } catch (dbError) {
      console.error(`Erro ao atualizar erro no BD:`, dbError);
    }

    // Close browser if still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Erro ao fechar browser:", closeError);
      }
    }

    return { plataforma: rede.plataforma, erro: String(error) };
  }
}

// Process items in batches
async function processBatches<T>(
  items: T[],
  processFn: (item: T) => Promise<any>,
  batchSize: number,
  delayMs: number
) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`Processando lote ${i/batchSize + 1}/${Math.ceil(items.length/batchSize)} (${batch.length} itens)`);

    const batchPromises = batch.map(processFn);
    const batchResults = await Promise.all(batchPromises);

    results.push(...batchResults);

    if (i + batchSize < items.length) {
      console.log(`Aguardando ${delayMs/1000}s antes do próximo lote...`);
      await delay(delayMs);
    }
  }

  return results;
}

// Main function
async function main() {
  try {
    console.log("Iniciando atualização de seguidores...");

    // Get all social networks
    const redes = await prisma.redeSocial.findMany({
      select: {
        id: true,
        perfilId: true,
        plataforma: true,
        url: true,
        usuario: true,
        perfil: {
          select: { nome: true }
        }
      },
      orderBy: [
        { perfilId: 'asc' },
        { ordem: 'asc' }
      ]
    });

    console.log(`Encontradas ${redes.length} redes sociais para atualizar`);

    // Process in batches
    await processBatches(
      redes,
      updateFollowers,
      MAX_CONCURRENT,
      DELAY_BETWEEN_REQUESTS
    );

    console.log("Atualização de seguidores concluída!");
  } catch (error) {
    console.error("Erro durante a atualização:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .catch((e) => {
    console.error("Erro fatal durante a atualização:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });