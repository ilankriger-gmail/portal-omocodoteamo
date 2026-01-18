import { NextResponse } from "next/server";
import { getParceiroData, getFallbackData } from "@/lib/parceiro";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Verifica se estamos no ambiente de build da Vercel
const isBuild = process.env.NODE_ENV === "production" &&
                process.env.NEXT_PHASE === "phase-production-build";

export async function GET() {
  // Durante o build, retorna uma resposta mock estática
  if (isBuild) {
    console.log("[Parceiro] Ignorando execução durante o build da Vercel");
    return NextResponse.json({
      ...getFallbackData(),
      build: true,
    });
  }

  const data = await getParceiroData();
  return NextResponse.json(data);
}
