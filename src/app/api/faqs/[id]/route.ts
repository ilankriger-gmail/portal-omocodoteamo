import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// GET: Buscar FAQ por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

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
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = params;

  try {
    // Verificar se a FAQ existe primeiro
    const existingFAQ = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!existingFAQ) {
      return NextResponse.json({ error: "FAQ não encontrada" }, { status: 404 });
    }

    const body = await request.json();

    // Preparar dados de atualização sem campos indefinidos
    const updateData: any = {};

    if (body.pergunta !== undefined) updateData.pergunta = body.pergunta;
    if (body.resposta !== undefined) updateData.resposta = body.resposta;
    if (body.imagemUrl !== undefined) updateData.imagemUrl = body.imagemUrl;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.botaoTexto !== undefined) updateData.botaoTexto = body.botaoTexto;
    if (body.botaoLink !== undefined) updateData.botaoLink = body.botaoLink;
    if (body.ordem !== undefined) updateData.ordem = body.ordem;
    if (body.ativo !== undefined) updateData.ativo = body.ativo;

    // Adicionar campo de atualização
    updateData.updatedAt = new Date();

    const faq = await prisma.fAQ.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Erro ao atualizar FAQ:", error);

    // Fornecer mensagem de erro mais específica
    const errorMessage = error instanceof Error
      ? `Erro ao atualizar FAQ: ${error.message}`
      : "Erro ao atualizar FAQ";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE: Excluir FAQ
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = params;

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
