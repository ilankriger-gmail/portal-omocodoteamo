import { NextResponse } from "next/server";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  // Versão simplificada que apenas retorna null e não faz nada
  return NextResponse.json({ adClient: null });
}