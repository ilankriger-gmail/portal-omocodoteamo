import { NextResponse } from "next/server";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Verifica se estamos no ambiente de build da Vercel
const isBuild = process.env.NODE_ENV === "production" &&
                process.env.NEXT_PHASE === "phase-production-build";

// Plataformas que suportam scraping
const PLATAFORMAS_SUPORTADAS = ["instagram", "youtube", "tiktok", "facebook", "kwai", "threads"];

// Rate limiting: delay entre cada scrape para evitar bloqueios
const DELAY_ENTRE_SCRAPES = 3000; // 3 segundos

export async function GET(request: Request) {
  // Durante o build, retorna uma resposta mock
  if (isBuild) {
    console.log("[Cron] Ignorando execução durante o build da Vercel");
    return NextResponse.json({
      mensagem: "Build time - API será executada apenas em runtime",
      build: true,
      executadoEm: new Date().toISOString(),
    });
  }

  // Importar módulos apenas em runtime para evitar problemas durante o build
  const { prisma } = await import("@/lib/prisma");
  const { buscarSeguidores } = await import("@/lib/scrapers");
  const { closeBrowser } = await import("@/lib/scrapers/browser");

  // Verificar token secreto
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Em produção, exigir token
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Buscar todas as redes sociais que suportam scraping
    const redes = await prisma.redeSocial.findMany({
      where: {
        plataforma: { in: PLATAFORMAS_SUPORTADAS },
      },
      include: {
        perfil: { select: { nome: true } },
      },
    });

    const resultados: {
      id: string;
      plataforma: string;
      usuario: string;
      perfilNome: string;
      sucesso: boolean;
      seguidoresAnterior: number | null;
      seguidoresNovo: number | null;
      erro: string | null;
    }[] = [];

    // Processar cada rede com delay
    for (const rede of redes) {
      console.log(`[Cron] Processando ${rede.plataforma}: ${rede.usuario}`);

      const resultado = await buscarSeguidores(rede.plataforma, rede.url);

      const registroResultado = {
        id: rede.id,
        plataforma: rede.plataforma,
        usuario: rede.usuario,
        perfilNome: rede.perfil.nome,
        sucesso: resultado.seguidores !== null,
        seguidoresAnterior: rede.seguidores,
        seguidoresNovo: resultado.seguidores,
        erro: resultado.erro,
      };

      resultados.push(registroResultado);

      // Atualizar no banco
      if (resultado.seguidores !== null) {
        await prisma.redeSocial.update({
          where: { id: rede.id },
          data: {
            seguidores: resultado.seguidores,
            seguidoresAtualizadoEm: new Date(),
            erroAtualizacao: null,
          },
        });
        console.log(
          `[Cron] ✅ ${rede.plataforma}/${rede.usuario}: ${resultado.seguidores} seguidores`
        );
      } else {
        await prisma.redeSocial.update({
          where: { id: rede.id },
          data: {
            erroAtualizacao: resultado.erro,
          },
        });
        console.log(`[Cron] ❌ ${rede.plataforma}/${rede.usuario}: ${resultado.erro}`);
      }

      // Delay antes do próximo scrape
      await new Promise((resolve) => setTimeout(resolve, DELAY_ENTRE_SCRAPES));
    }

    // Fechar o browser ao finalizar
    await closeBrowser();

    // Resumo
    const sucessos = resultados.filter((r) => r.sucesso).length;
    const falhas = resultados.filter((r) => !r.sucesso).length;

    return NextResponse.json({
      mensagem: "Atualização concluída",
      total: redes.length,
      sucessos,
      falhas,
      resultados,
      executadoEm: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Erro geral:", error);

    try {
      const { closeBrowser } = await import("@/lib/scrapers/browser");
      await closeBrowser();
    } catch (e) {
      console.error("[Cron] Erro ao fechar browser:", e);
    }

    return NextResponse.json(
      {
        error: "Erro ao atualizar seguidores",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

// Também aceitar POST para compatibilidade com alguns serviços de cron
export async function POST(request: Request) {
  return GET(request);
}
