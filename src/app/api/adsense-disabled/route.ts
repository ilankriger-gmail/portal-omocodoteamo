import { NextResponse } from "next/server";

// Esta é uma versão completamente estática da API que não acessa o banco de dados
// durante o build da Vercel, evitando erros de "failed to collect page data"

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  // Durante o build, sempre retornamos um valor estático
  return NextResponse.json({ adClient: null });
}