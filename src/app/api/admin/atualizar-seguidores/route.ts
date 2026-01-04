import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PLATAFORMAS_SUPORTADAS = ["instagram", "youtube", "tiktok", "facebook", "kwai", "threads"];
const DELAY_ENTRE_SCRAPES = 3000;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { buscarSeguidores } = await import("@/lib/scrapers");
  const { closeBrowser } = await import("@/lib/scrapers/browser");

  try {
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

    for (const rede of redes) {
      console.log(`[Admin] Processando ${rede.plataforma}: ${rede.usuario}`);

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

      if (resultado.seguidores !== null) {
        await prisma.redeSocial.update({
          where: { id: rede.id },
          data: {
            seguidores: resultado.seguidores,
            seguidoresAtualizadoEm: new Date(),
            erroAtualizacao: null,
          },
        });
        console.log(`[Admin] ✅ ${rede.plataforma}/${rede.usuario}: ${resultado.seguidores} seguidores`);
      } else {
        await prisma.redeSocial.update({
          where: { id: rede.id },
          data: {
            erroAtualizacao: resultado.erro,
          },
        });
        console.log(`[Admin] ❌ ${rede.plataforma}/${rede.usuario}: ${resultado.erro}`);
      }

      await new Promise((resolve) => setTimeout(resolve, DELAY_ENTRE_SCRAPES));
    }

    await closeBrowser();

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
    console.error("[Admin] Erro geral:", error);
    const { closeBrowser } = await import("@/lib/scrapers/browser");
    await closeBrowser();

    return NextResponse.json(
      {
        error: "Erro ao atualizar seguidores",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}