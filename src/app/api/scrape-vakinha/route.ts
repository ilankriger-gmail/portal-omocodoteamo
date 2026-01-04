import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Verifica se estamos no ambiente de build da Vercel
const isBuild = process.env.NODE_ENV === "production" &&
                process.env.NEXT_PHASE === "phase-production-build";

export async function POST(req: Request) {
  // Durante o build, retornar dados mock
  if (isBuild) {
    console.log("[scrape-vakinha] Ignorando execução durante o build da Vercel");
    return NextResponse.json({
      titulo: "Exemplo de Vaquinha",
      descricao: "Descrição de exemplo para build",
      imagemUrl: "/exemplo.jpg",
      chavePix: "exemplo@pix.com",
      meta: 5000,
      arrecadado: 1200,
      build: true
    });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const { url } = await req.json();

    if (!url || !url.includes("vakinha.com.br")) {
      return NextResponse.json({ message: "URL inválida" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await res.text();

    // Extrair título
    const tituloMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<title>([^<|]+)/i);

    // Extrair descrição (meta description ou primeiro parágrafo)
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i) ||
                      html.match(/<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)/i);

    // Extrair imagem
    const imagemMatch = html.match(/https:\/\/static\.vakinha\.com\.br\/uploads\/vakinha\/image\/[^"'\s]+/);

    // Extrair valores
    const valorRegex = /R\$\s*([\d.]+,\d{2})/g;
    const valores: number[] = [];
    let match;
    while ((match = valorRegex.exec(html)) !== null) {
      valores.push(parseFloat(match[1].replace(/\./g, "").replace(",", ".")));
    }
    valores.sort((a, b) => b - a);

    // Extrair chave PIX
    let chavePix = "";
    const pixPatterns = [
      // Chave aleatória (UUID)
      /(?:pix|chave)[^a-z0-9]*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
      // CPF
      /(?:pix|chave)[^0-9]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i,
      // CNPJ
      /(?:pix|chave)[^0-9]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i,
      // Email próximo de PIX
      /(?:pix|chave)[^a-z0-9]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      // Telefone
      /(?:pix|chave)[^0-9]*(\+?55?\s?\d{2}\s?\d{4,5}-?\d{4})/i,
    ];

    for (const pattern of pixPatterns) {
      const pixMatch = html.match(pattern);
      if (pixMatch?.[1]) {
        chavePix = pixMatch[1];
        break;
      }
    }

    return NextResponse.json({
      titulo: tituloMatch?.[1]?.trim() || "",
      descricao: descMatch?.[1]?.trim() || "",
      imagemUrl: imagemMatch?.[0] || "",
      chavePix,
      meta: valores[0] || 0,
      arrecadado: valores[1] || valores[0] || 0,
    });
  } catch (error) {
    console.error("Erro no scrape:", error);
    return NextResponse.json({ message: "Erro ao buscar dados" }, { status: 500 });
  }
}
