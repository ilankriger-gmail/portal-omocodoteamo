import { PrismaClient } from "@prisma/client";
import { buscarSeguidores } from "../src/lib/scrapers";

const prisma = new PrismaClient();

// Configuração
const MAX_CONCURRENT = 3; // Número máximo de requests concorrentes
const DELAY_BETWEEN_REQUESTS = 2000; // Delay entre requisições em ms

// Função de atraso
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Atualizar seguidores de uma rede social
async function atualizarSeguidores(rede: { id: string, plataforma: string, url: string }) {
  // Pular plataformas sem scraper
  if (rede.plataforma === "whatsapp" || rede.plataforma === "x" || rede.plataforma === "telegram") {
    console.log(`Pulando ${rede.plataforma} (sem suporte para contagem de seguidores)`);
    return null;
  }

  try {
    console.log(`Atualizando seguidores para ${rede.plataforma}: ${rede.url}`);

    // Usar o scraper para buscar seguidores
    const { seguidores, erro } = await buscarSeguidores(rede.plataforma, rede.url);

    // Atualizar no banco de dados
    if (seguidores || erro) {
      await prisma.redeSocial.update({
        where: { id: rede.id },
        data: {
          seguidores: seguidores,
          seguidoresAtualizadoEm: new Date(),
          erroAtualizacao: erro || null
        }
      });
    }

    if (seguidores) {
      console.log(`✅ ${rede.plataforma}: ${seguidores.toLocaleString()} seguidores`);
    } else if (erro) {
      console.log(`⚠️ ${rede.plataforma}: ${erro}`);
    }

    return { plataforma: rede.plataforma, seguidores, erro };
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${rede.plataforma}:`, error);
    return { plataforma: rede.plataforma, erro: String(error) };
  }
}

// Processar redes em batches para controlar concorrência
async function processarEmBatches<T>(
  items: T[],
  processFn: (item: T) => Promise<any>,
  batchSize: number,
  delayMs: number
) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(processFn);
    const batchResults = await Promise.all(batchPromises);

    results.push(...batchResults);

    if (i + batchSize < items.length) {
      await delay(delayMs);
    }
  }

  return results;
}

// Função principal
async function main() {
  try {
    console.log("Iniciando atualização de seguidores...");

    // Buscar todas as redes sociais
    const redes = await prisma.redeSocial.findMany({
      select: {
        id: true,
        perfilId: true,
        plataforma: true,
        url: true,
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

    // Processar em batches
    await processarEmBatches(
      redes,
      atualizarSeguidores,
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

// Executar o script
main()
  .catch((e) => {
    console.error("Erro durante a atualização:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });