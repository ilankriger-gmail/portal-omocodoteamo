import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scrapeVakinha } from "@/lib/scraper";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ message: "URL é obrigatória" }, { status: 400 });
    }

    const data = await scrapeVakinha(url);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro no scraper:", error);
    return NextResponse.json(
      { message: "Erro ao extrair dados do link" },
      { status: 500 }
    );
  }
}
