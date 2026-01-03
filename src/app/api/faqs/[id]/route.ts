import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Buscar FAQ por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const faq = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!faq) {
      return NextResponse.json({ error: "FAQ não encontrada" }, { status: 404 });
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Erro ao buscar FAQ:", error);
    return NextResponse.json({ error: "Erro ao buscar FAQ" }, { status: 500 });
  }
}

// PATCH: Atualizar FAQ
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(body.pergunta !== undefined && { pergunta: body.pergunta }),
        ...(body.resposta !== undefined && { resposta: body.resposta }),
        ...(body.imagemUrl !== undefined && { imagemUrl: body.imagemUrl }),
        ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
        ...(body.botaoTexto !== undefined && { botaoTexto: body.botaoTexto }),
        ...(body.botaoLink !== undefined && { botaoLink: body.botaoLink }),
        ...(body.ordem !== undefined && { ordem: body.ordem }),
        ...(body.ativo !== undefined && { ativo: body.ativo }),
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Erro ao atualizar FAQ:", error);
    return NextResponse.json({ error: "Erro ao atualizar FAQ" }, { status: 500 });
  }
}

// DELETE: Excluir FAQ
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.fAQ.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir FAQ:", error);
    return NextResponse.json({ error: "Erro ao excluir FAQ" }, { status: 500 });
  }
}
