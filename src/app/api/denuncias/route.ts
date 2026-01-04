import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { perfilFalso, plataforma, descricao, imagemUrl, contato } = body;

    if (!perfilFalso || !plataforma || !descricao) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const denuncia = await prisma.denuncia.create({
      data: {
        perfilFalso,
        plataforma,
        descricao,
        imagemUrl: imagemUrl || null,
        contato: contato || null,
      },
    });

    return NextResponse.json({ success: true, id: denuncia.id });
  } catch (error) {
    console.error("Erro ao criar denúncia:", error);
    return NextResponse.json(
      { error: "Erro ao processar denúncia" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Apenas admin pode ver denúncias
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}
