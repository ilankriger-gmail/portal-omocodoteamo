import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// GET: Listar todas as FAQs (admin - inclui inativas)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { ordem: "asc" },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Erro ao buscar FAQs:", error);
    return NextResponse.json({ error: "Erro ao buscar FAQs" }, { status: 500 });
  }
}
