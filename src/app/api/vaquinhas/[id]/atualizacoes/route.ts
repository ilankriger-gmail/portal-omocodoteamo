import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    const atualizacao = await prisma.atualizacao.create({
      data: {
        vaquinhaId: id,
        tipo: body.tipo,
        conteudo: body.conteudo,
        imagemUrl: body.imagemUrl || null,
        videoUrl: body.videoUrl || null,
      },
    });

    return NextResponse.json(atualizacao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar atualização:", error);
    return NextResponse.json({ message: "Erro ao criar atualização" }, { status: 500 });
  }
}
