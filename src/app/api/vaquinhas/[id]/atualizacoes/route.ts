import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Verifica se estamos no ambiente de build da Vercel
const isBuild = process.env.NODE_ENV === "production" &&
                process.env.NEXT_PHASE === "phase-production-build";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Durante o build, retornar dados mock
  if (isBuild) {
    console.log("[vaquinhas/[id]/atualizacoes] Ignorando execução durante o build da Vercel");
    return NextResponse.json(
      {
        id: "mock-atualizacao-id",
        vaquinhaId: "mock-vaquinha-id",
        tipo: "TEXTO",
        conteudo: "Atualização de exemplo para build",
        imagemUrl: null,
        videoUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        build: true
      },
      { status: 201 }
    );
  }

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Durante o build, retornar dados mock
  if (isBuild) {
    console.log("[vaquinhas/[id]/atualizacoes] GET: Ignorando execução durante o build da Vercel");
    return NextResponse.json({
      atualizacoes: [
        {
          id: "mock-atualizacao-id-1",
          vaquinhaId: "mock-vaquinha-id",
          tipo: "TEXTO",
          conteudo: "Primeira atualização de exemplo para build",
          imagemUrl: null,
          videoUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      build: true
    });
  }

  // Implementação real do GET
  try {
    const { id } = await params;

    const atualizacoes = await prisma.atualizacao.findMany({
      where: { vaquinhaId: id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ atualizacoes });
  } catch (error) {
    console.error("Erro ao buscar atualizações:", error);
    return NextResponse.json({ message: "Erro ao buscar atualizações" }, { status: 500 });
  }
}
