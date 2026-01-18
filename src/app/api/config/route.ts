import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const config = await prisma.config.findFirst();
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const config = await prisma.config.upsert({
      where: { id: "config-principal" },
      update: {
        biografia: body.biografia,
        avatarUrl: body.avatarUrl || null,
        bannerTexto: body.bannerTexto || null,
        bannerLink: body.bannerLink || null,
        bannerImageUrl: body.bannerImageUrl || null,
        bannerAtivo: body.bannerAtivo ?? false,
        vaquinhaFixadaId: body.vaquinhaFixadaId || null,
        googleAnalyticsId: body.googleAnalyticsId || null,
        googleAdSenseId: body.googleAdSenseId || null,
        adsAtivado: body.adsAtivado ?? false,
        // Banner Principal
        bannerPrincipalAtivo: body.bannerPrincipalAtivo ?? true,
        bannerPrincipalTexto: body.bannerPrincipalTexto || null,
        bannerPrincipalGradientStart: body.bannerPrincipalGradientStart || "#000000",
        bannerPrincipalGradientEnd: body.bannerPrincipalGradientEnd || "#1a1a2e",
      },
      create: {
        id: "config-principal",
        biografia: body.biografia,
        avatarUrl: body.avatarUrl || null,
        bannerTexto: body.bannerTexto || null,
        bannerLink: body.bannerLink || null,
        bannerImageUrl: body.bannerImageUrl || null,
        bannerAtivo: body.bannerAtivo ?? false,
        vaquinhaFixadaId: body.vaquinhaFixadaId || null,
        googleAnalyticsId: body.googleAnalyticsId || null,
        googleAdSenseId: body.googleAdSenseId || null,
        adsAtivado: body.adsAtivado ?? false,
        // Banner Principal
        bannerPrincipalAtivo: body.bannerPrincipalAtivo ?? true,
        bannerPrincipalTexto: body.bannerPrincipalTexto || "CONFIANÇA VEM DA VERDADE",
        bannerPrincipalGradientStart: body.bannerPrincipalGradientStart || "#000000",
        bannerPrincipalGradientEnd: body.bannerPrincipalGradientEnd || "#1a1a2e",
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao atualizar config:", error);
    return NextResponse.json({ message: "Erro ao atualizar" }, { status: 500 });
  }
}
