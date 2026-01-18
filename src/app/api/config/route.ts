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
  try {
    const config = await prisma.config.findFirst();
    // Garantir valores padrão para campos novos
    if (config) {
      return NextResponse.json({
        ...config,
        bannerPrincipalAtivo: config.bannerPrincipalAtivo ?? true,
        bannerPrincipalTexto: config.bannerPrincipalTexto ?? "CONFIANÇA VEM DA VERDADE",
        bannerPrincipalGradientStart: config.bannerPrincipalGradientStart ?? "#000000",
        bannerPrincipalGradientEnd: config.bannerPrincipalGradientEnd ?? "#1a1a2e",
      });
    }
    return NextResponse.json(null);
  } catch (error) {
    console.error("Erro ao buscar config:", error);
    return NextResponse.json(null);
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Dados base (campos que sempre existem)
    const baseData = {
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
    };

    // Dados do banner principal (campos novos)
    const bannerPrincipalData = {
      bannerPrincipalAtivo: body.bannerPrincipalAtivo ?? true,
      bannerPrincipalTexto: body.bannerPrincipalTexto || null,
      bannerPrincipalGradientStart: body.bannerPrincipalGradientStart || "#000000",
      bannerPrincipalGradientEnd: body.bannerPrincipalGradientEnd || "#1a1a2e",
    };

    let config;

    // Tentar salvar com todos os campos (incluindo novos)
    try {
      config = await prisma.config.upsert({
        where: { id: "config-principal" },
        update: { ...baseData, ...bannerPrincipalData },
        create: {
          id: "config-principal",
          ...baseData,
          ...bannerPrincipalData,
          bannerPrincipalTexto: body.bannerPrincipalTexto || "CONFIANÇA VEM DA VERDADE",
        },
      });
    } catch (innerError) {
      // Se falhar (campos novos não existem), salvar só os antigos
      console.warn("Campos novos não existem, salvando apenas campos base:", innerError);
      config = await prisma.config.upsert({
        where: { id: "config-principal" },
        update: baseData,
        create: { id: "config-principal", ...baseData },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao atualizar config:", error);
    return NextResponse.json({ message: "Erro ao atualizar" }, { status: 500 });
  }
}
