import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = params;
    const { doacoes, coracoes } = await request.json();

    // Validar ID
    const vaquinha = await prisma.vaquinha.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!vaquinha) {
      return NextResponse.json({ error: "Vaquinha não encontrada" }, { status: 404 });
    }

    // Validar os valores (não-negativos)
    const doacoesValue = Math.max(0, Number(doacoes));
    const coracoesValue = Math.max(0, Number(coracoes));

    // Atualizar os campos
    const updated = await prisma.vaquinha.update({
      where: { id },
      data: {
        doacoes: doacoesValue,
        coracoes: coracoesValue,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar estatísticas" },
      { status: 500 }
    );
  }
}