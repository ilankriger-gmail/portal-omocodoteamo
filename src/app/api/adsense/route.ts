// Arquivo route.ts intencionalmente minimalista para evitar erros de build
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// Verifica se estamos no ambiente de build da Vercel
const isBuild = process.env.NODE_ENV === "production" &&
                process.env.NEXT_PHASE === "phase-production-build";

// Rota GET que retorna um objeto vazio
export async function GET() {
  // Durante o build, registra mensagem no console
  if (isBuild) {
    console.log("[adsense] Ignorando execução durante o build da Vercel");
  }

  // Retorna simplesmente um objeto vazio com adClient: null
  return NextResponse.json({ adClient: null });
}