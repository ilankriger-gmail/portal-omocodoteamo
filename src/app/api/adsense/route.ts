import { prisma } from "@/lib/prisma";
import { safeDbOperation } from "@/lib/db-fallback";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Verifica se estamos no build
    const isBuild = process.env.NODE_ENV === "production" &&
                    process.env.NEXT_PHASE === "phase-production-build";

    // Durante o build, retorna um valor padrão para evitar erro
    if (isBuild) {
      console.log("Build time: Retornando valor padrão para adsense");
      return NextResponse.json({ adClient: null });
    }

    // Em runtime normal, usa operação segura com fallback
    const config = await safeDbOperation(
      async () => {
        return await prisma.config.findFirst({
          select: {
            googleAdSenseId: true,
            adsAtivado: true,
          },
        });
      },
      { googleAdSenseId: null, adsAtivado: false }
    );

    return NextResponse.json({
      adClient: config?.adsAtivado ? config?.googleAdSenseId : null,
    });
  } catch (error) {
    console.error("Erro ao buscar configuração de AdSense:", error);
    return NextResponse.json({ adClient: null });
  }
}