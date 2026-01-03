import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const vaquinha = await prisma.vaquinha.findUnique({
    where: { id },
    include: { atualizacoes: { orderBy: { createdAt: "desc" } } },
  });

  if (!vaquinha) {
    return NextResponse.json({ message: "Não encontrada" }, { status: 404 });
  }

  return NextResponse.json(vaquinha);
}

export async function PUT(
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

    const vaquinha = await prisma.vaquinha.update({
      where: { id },
      data: {
        titulo: body.titulo,
        descricao: body.descricao,
        linkOriginal: body.linkOriginal,
        chavePix: body.chavePix,
        imagemUrl: body.imagemUrl || null,
        videoUrl: body.videoUrl || null,
        meta: body.meta,
        valorAtual: body.valorAtual,
        status: body.status,
      },
    });

    return NextResponse.json(vaquinha);
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return NextResponse.json({ message: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.vaquinha.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir:", error);
    return NextResponse.json({ message: "Erro ao excluir" }, { status: 500 });
  }
}
