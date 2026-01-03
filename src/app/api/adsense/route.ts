import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const config = await prisma.config.findFirst({
      select: {
        googleAdSenseId: true,
        adsAtivado: true,
      },
    });

    return NextResponse.json({
      adClient: config?.adsAtivado ? config?.googleAdSenseId : null,
    });
  } catch (error) {
    console.error("Erro ao buscar configuração de AdSense:", error);
    return NextResponse.json({ adClient: null });
  }
}