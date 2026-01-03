import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";

export async function GET() {
  const vaquinhas = await prisma.vaquinha.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vaquinhas);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Gerar slug a partir do título
    const baseSlug = generateSlug(body.titulo);

    // Buscar todos os slugs existentes para garantir unicidade
    const existingVaquinhas = await prisma.vaquinha.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: {
        slug: true,
      },
    });

    const existingSlugs = existingVaquinhas.map(v => v.slug);
    const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

    const vaquinha = await prisma.vaquinha.create({
      data: {
        titulo: body.titulo,
        slug: uniqueSlug,
        descricao: body.descricao,
        linkOriginal: body.linkOriginal,
        chavePix: body.chavePix,
        imagemUrl: body.imagemUrl || null,
        videoUrl: body.videoUrl || null,
        meta: body.meta,
        valorAtual: body.valorAtual || 0,
        doacoes: body.doacoes || 0, // Adicionar campo de doações
        coracoes: body.coracoes || 0, // Adicionar campo de corações
        status: body.status || "ATIVA", // Usar o status fornecido ou padrão "ATIVA"
      },
    });

    return NextResponse.json(vaquinha, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar vaquinha:", error);
    return NextResponse.json({ message: "Erro ao criar vaquinha" }, { status: 500 });
  }
}
