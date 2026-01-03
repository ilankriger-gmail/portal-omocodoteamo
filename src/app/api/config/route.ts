import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao atualizar config:", error);
    return NextResponse.json({ message: "Erro ao atualizar" }, { status: 500 });
  }
}
