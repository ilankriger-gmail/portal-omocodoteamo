import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Verifica se estamos no ambiente de build da Vercel
const isBuild = process.env.NODE_ENV === "production" &&
                process.env.NEXT_PHASE === "phase-production-build";

// Cache em memória
let cachedData: VaquinhaScrapedData[] | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 dia em ms

interface VaquinhaScrapedData {
  id: string;
  nome: string;
  link: string;
  descricao: string | null;
  videoUrl: string | null;
  titulo?: string;
  imagemUrl?: string;
  valorArrecadado?: string;
  valorArrecadadoNum?: number;
  meta?: string;
  metaNum?: number;
  progresso?: number;
  doadores?: number;
  coracoes?: number;
  chavePix?: string;
  status?: string;
  fetchedAt: string;
}

async function scrapeVaquinha(url: string): Promise<Partial<VaquinhaScrapedData>> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await res.text();

    // Extrair título
    const tituloMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<title>([^<|]+)/i);

    // Extrair imagem
    const imagemMatch = html.match(/https:\/\/static\.vakinha\.com\.br\/uploads\/vakinha\/image\/[^"'\s]+/);

    // Extrair meta - procurar padrões específicos
    let meta = 0;
    let valorArrecadado = 0;

    // Tentar encontrar meta com padrão "meta de R$" ou "Meta: R$"
    const metaPattern = /meta[^R$]*R\$\s*([\d.]+,\d{2})/i;
    const metaMatch = html.match(metaPattern);
    if (metaMatch) {
      meta = parseFloat(metaMatch[1].replace(/\./g, "").replace(",", "."));
    }

    // Tentar encontrar valor arrecadado com padrão "arrecadado" ou próximo do início
    const arrecadadoPatterns = [
      /arrecadad[oa][^R$]*R\$\s*([\d.]+,\d{2})/i,
      /R\$\s*([\d.]+,\d{2})[^<]*arrecadad/i,
      /já\s+arrecadou[^R$]*R\$\s*([\d.]+,\d{2})/i,
    ];

    for (const pattern of arrecadadoPatterns) {
      const arrecMatch = html.match(pattern);
      if (arrecMatch) {
        valorArrecadado = parseFloat(arrecMatch[1].replace(/\./g, "").replace(",", "."));
        break;
      }
    }

    // Se não encontrou com padrões específicos, usar lógica de valores
    if (meta === 0 || valorArrecadado === 0) {
      const valorRegex = /R\$\s*([\d.]+,\d{2})/g;
      const valores: number[] = [];
      let match;
      while ((match = valorRegex.exec(html)) !== null) {
        const val = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
        if (val > 0 && val < 100000000) { // Ignorar valores absurdos
          valores.push(val);
        }
      }

      // Remover duplicatas e ordenar
      const valoresUnicos = Array.from(new Set(valores)).sort((a, b) => b - a);

      // Se temos pelo menos 2 valores diferentes
      if (valoresUnicos.length >= 2) {
        // A meta geralmente é um número "redondo" (termina em 000)
        const metaCandidata = valoresUnicos.find(v => v % 1000 === 0) || valoresUnicos[0];
        const arrecadadoCandidato = valoresUnicos.find(v => v !== metaCandidata) || valoresUnicos[1];

        if (meta === 0) meta = metaCandidata;
        if (valorArrecadado === 0) valorArrecadado = arrecadadoCandidato;
      } else if (valoresUnicos.length === 1) {
        if (meta === 0) meta = valoresUnicos[0];
      }
    }

    // Garantir que meta >= arrecadado para vaquinhas não concluídas
    // (ou permitir que arrecadado > meta para vaquinhas que passaram da meta)
    if (meta > 0 && valorArrecadado > meta) {
      // Vaquinha passou da meta - isso é válido
    } else if (valorArrecadado > meta && meta > 0) {
      // Trocar os valores se parecer que estão invertidos
      [meta, valorArrecadado] = [valorArrecadado, meta];
    }

    // Extrair número de doadores
    const doadoresMatch = html.match(/(\d+)\s*(?:doador|doadores|apoiador|apoiadores)/i);

    // Extrair número de corações/likes
    const coracoesPatterns = [
      /(\d+)\s*(?:coração|corações|coracoes|like|likes|curtida|curtidas)/i,
      /(\d+)\s*(?:pessoas?\s+(?:curtiram|amaram|apoiaram))/i,
    ];
    let coracoes: number | undefined;
    for (const pattern of coracoesPatterns) {
      const coracoesMatch = html.match(pattern);
      if (coracoesMatch) {
        coracoes = parseInt(coracoesMatch[1]);
        break;
      }
    }

    // Extrair chave PIX - procurar por padrões comuns de PIX
    // CPF: 000.000.000-00 ou 00000000000
    // CNPJ: 00.000.000/0000-00 ou 00000000000000
    // Email: email@dominio.com
    // Telefone: +55 11 99999-9999
    // Chave aleatória: uuid
    let chavePix: string | undefined;

    // Procurar por PIX no HTML
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
        // Limpar palavras indesejadas que podem ser capturadas junto
        chavePix = pixMatch[1]
          .replace(/copiar?/gi, "")
          .replace(/copiado/gi, "")
          .replace(/copia/gi, "")
          .replace(/copy/gi, "")
          .trim();
        if (chavePix) break;
      }
    }

    // Verificar status
    const encerrada = html.includes("encerrada") || html.includes("Encerrada") || html.includes("finalizada");

    const formatCurrency = (val: number) => {
      return "R$ " + val.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    };

    return {
      titulo: tituloMatch?.[1]?.trim(),
      imagemUrl: imagemMatch?.[0],
      valorArrecadado: valorArrecadado > 0 ? formatCurrency(valorArrecadado) : undefined,
      valorArrecadadoNum: valorArrecadado,
      meta: meta > 0 ? formatCurrency(meta) : undefined,
      metaNum: meta,
      progresso: meta > 0 ? Math.min((valorArrecadado / meta) * 100, 100) : 0,
      doadores: doadoresMatch ? parseInt(doadoresMatch[1]) : undefined,
      coracoes,
      chavePix,
      status: encerrada ? "ENCERRADA" : "ATIVA",
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erro ao buscar vaquinha " + url + ":", error);
    return {
      fetchedAt: new Date().toISOString(),
    };
  }
}

export async function GET(req: Request) {
  // Durante o build, retornar dados mock
  if (isBuild) {
    console.log("[vaquinhas-apoiadas] Ignorando execução durante o build da Vercel");
    return NextResponse.json({
      vaquinhas: [
        {
          id: "vaquinha-apoiada-teste",
          nome: "Vaquinha Apoiada de Teste",
          link: "https://www.vakinha.com.br/exemplo-apoiada",
          descricao: "Exemplo de vaquinha apoiada para build",
          valorArrecadado: "R$ 10.500,00",
          valorArrecadadoNum: 10500,
          meta: "R$ 15.000,00",
          metaNum: 15000,
          progresso: 70,
          fetchedAt: new Date().toISOString(),
          build: true
        }
      ],
      cached: true,
      lastFetch: Date.now(),
      nextFetch: Date.now(),
    });
  }

  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get("refresh") === "true";
  const now = Date.now();

  // Verifica se o cache é válido (menos de 1 dia) e não é forçado atualizar
  if (cachedData && now - lastFetch < CACHE_DURATION && !forceRefresh) {
    return NextResponse.json({
      vaquinhas: cachedData,
      cached: true,
      lastFetch: lastFetch,
      nextFetch: lastFetch + CACHE_DURATION,
      cacheAge: Math.floor((now - lastFetch) / 1000 / 60),
    });
  }

  // Busca vaquinhas do banco
  const vaquinhasDb = await prisma.vaquinhaApoiada.findMany();

  // Faz scraping de cada uma (em paralelo)
  const vaquinhasComDados = await Promise.all(
    vaquinhasDb.map(async (v) => {
      const scraped = await scrapeVaquinha(v.link);
      return {
        id: v.id,
        nome: v.nome,
        link: v.link,
        descricao: v.descricao,
        videoUrl: v.videoUrl,
        ...scraped,
        // Usar chavePix do banco se existir (prioridade sobre scraper)
        chavePix: v.chavePix || scraped.chavePix,
      } as VaquinhaScrapedData;
    })
  );

  cachedData = vaquinhasComDados;
  lastFetch = now;

  return NextResponse.json({
    vaquinhas: vaquinhasComDados,
    cached: false,
    lastFetch: lastFetch,
    nextFetch: lastFetch + CACHE_DURATION,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const vaquinha = await prisma.vaquinhaApoiada.create({
      data: {
        nome: body.nome,
        link: body.link,
        descricao: body.descricao || null,
      },
    });

    // Limpa cache para forçar novo scraping
    cachedData = null;
    lastFetch = 0;

    return NextResponse.json(vaquinha, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro" }, { status: 500 });
  }
}
