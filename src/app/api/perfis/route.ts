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
    const { nome, descricao } = body;

    const perfil = await prisma.perfilSocial.create({
      data: {
        nome,
        descricao,
      },
    });

    return NextResponse.json(perfil);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}
