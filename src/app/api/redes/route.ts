import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { perfilId, plataforma, usuario, url, seguidores, tipo } = body;

    // Buscar a maior ordem existente para colocar no final
    const maxOrdem = await prisma.redeSocial.aggregate({
      where: { perfilId },
      _max: { ordem: true },
    });
    const novaOrdem = (maxOrdem._max.ordem ?? -1) + 1;

    const rede = await prisma.redeSocial.create({
      data: {
        perfilId,
        plataforma,
        usuario,
        url,
        seguidores,
        ordem: novaOrdem,
        tipo: tipo || "oficial",
      },
    });

    return NextResponse.json(rede);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}
