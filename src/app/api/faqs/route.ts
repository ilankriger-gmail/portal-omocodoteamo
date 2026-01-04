import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// GET: Listar FAQs (público - apenas ativos, ordenados)
export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Erro ao buscar FAQs:", error);
    return NextResponse.json({ error: "Erro ao buscar FAQs" }, { status: 500 });
  }
}

// POST: Criar FAQ (protegido)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Obter a maior ordem atual
    const maxOrdem = await prisma.fAQ.aggregate({
      _max: { ordem: true },
    });

    const faq = await prisma.fAQ.create({
      data: {
        pergunta: body.pergunta,
        resposta: body.resposta,
        imagemUrl: body.imagemUrl || null,
        videoUrl: body.videoUrl || null,
        botaoTexto: body.botaoTexto || null,
        botaoLink: body.botaoLink || null,
        ordem: (maxOrdem._max.ordem || 0) + 1,
        ativo: body.ativo ?? true,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar FAQ:", error);
    return NextResponse.json({ error: "Erro ao criar FAQ" }, { status: 500 });
  }
}
