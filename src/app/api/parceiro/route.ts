import { NextResponse } from "next/server";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Verifica se estamos no ambiente de build da Vercel
const isBuild = process.env.NODE_ENV === "production" &&
                process.env.NEXT_PHASE === "phase-production-build";

// Cache em memória
let cachedData: ParceiroData | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 dia em ms

interface ParceiroData {
  nome: string;
  localizacao: string;
  ativoDesde: string;
  avatarUrl: string;
  valorArrecadado: string;
  valorArrecadadoNum: number;
  vaquinhasCriadas: number;
  pessoasImpactadas: number;
  causas: string[];
  redesSociais: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  fetchedAt: string;
}

async function scrapeVakinha(): Promise<ParceiroData> {
  try {
    const res = await fetch("https://www.vakinha.com.br/parceiros/ilan-kriger", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await res.text();

    // Extrair dados usando regex (a página não tem API)
    // Pegar todos os valores R$ e encontrar o maior (total arrecadado)
    const valorRegex = /R\$\s*([\d.]+,\d{2})/g;
    let maiorValor = 0;
    let maiorValorStr = "R$ 1.013.242,93";
    let valorMatch;
    while ((valorMatch = valorRegex.exec(html)) !== null) {
      const valor = parseFloat(valorMatch[1].replace(/\./g, "").replace(",", "."));
      if (valor > maiorValor) {
        maiorValor = valor;
        maiorValorStr = valorMatch[0];
      }
    }

    const vaquinhasMatch = html.match(/(\d+)\s*vaquinhas?\s*criadas?/i) || html.match(/<strong[^>]*>(\d+)<\/strong>\s*vaquinhas/i);
    const pessoasMatch = html.match(/([\d.]+)\s*pessoas?\s*impactadas?/i) || html.match(/<strong[^>]*>([\d.]+)<\/strong>\s*pessoas/i);
    const avatarMatch = html.match(/https:\/\/static\.vakinha\.com\.br\/uploads\/user\/avatar\/[^"'\s]+/);

    // Valores padrão baseados nos dados conhecidos
    const data: ParceiroData = {
      nome: "NextlevelDJ | O Moço do Te Amo",
      localizacao: "Curitiba, PR",
      ativoDesde: "Dezembro de 2022",
      avatarUrl: avatarMatch?.[0] || "https://static.vakinha.com.br/uploads/user/avatar/11299153/experimentos.png",
      valorArrecadado: maiorValorStr,
      valorArrecadadoNum: maiorValor || 1013242.93,
      vaquinhasCriadas: parseInt(vaquinhasMatch?.[1] || "116"),
      pessoasImpactadas: parseInt(pessoasMatch?.[1]?.replace(/\./g, "") || "34216"),
      causas: ["Saúde / Tratamentos", "Sonhos / Outros", "Fome / Desnutrição"],
      redesSociais: {
        facebook: "https://facebook.com/nextleveldjajuda",
        instagram: "https://instagram.com/omocodoteamo",
        youtube: "https://youtube.com/channel/UCumJc10FZDVTnOQwnaTX66w",
      },
      fetchedAt: new Date().toISOString(),
    };

    return data;
  } catch (error) {
    console.error("Erro ao buscar dados do parceiro:", error);
    // Retorna dados padrão em caso de erro
    return {
      nome: "NextlevelDJ | O Moço do Te Amo",
      localizacao: "Curitiba, PR",
      ativoDesde: "Dezembro de 2022",
      avatarUrl: "/uploads/nextleveldj-avatar.jpg",
      valorArrecadado: "R$ 1.013.242,93",
      valorArrecadadoNum: 1013242.93,
      vaquinhasCriadas: 116,
      pessoasImpactadas: 34216,
      causas: ["Saúde / Tratamentos", "Sonhos / Outros", "Fome / Desnutrição"],
      redesSociais: {
        facebook: "https://facebook.com/nextleveldjajuda",
        instagram: "https://instagram.com/omocodoteamo",
        youtube: "https://youtube.com/channel/UCumJc10FZDVTnOQwnaTX66w",
      },
      fetchedAt: new Date().toISOString(),
    };
  }
}

export async function GET() {
  // Durante o build, retorna uma resposta mock estática
  if (isBuild) {
    console.log("[Parceiro] Ignorando execução durante o build da Vercel");
    return NextResponse.json({
      nome: "NextlevelDJ | O Moço do Te Amo",
      localizacao: "Curitiba, PR",
      ativoDesde: "Dezembro de 2022",
      avatarUrl: "/uploads/nextleveldj-avatar.jpg",
      valorArrecadado: "R$ 1.013.242,93",
      valorArrecadadoNum: 1013242.93,
      vaquinhasCriadas: 116,
      pessoasImpactadas: 34216,
      causas: ["Saúde / Tratamentos", "Sonhos / Outros", "Fome / Desnutrição"],
      redesSociais: {
        facebook: "https://facebook.com/nextleveldjajuda",
        instagram: "https://instagram.com/omocodoteamo",
        youtube: "https://youtube.com/channel/UCumJc10FZDVTnOQwnaTX66w",
      },
      fetchedAt: new Date().toISOString(),
      build: true,
    });
  }

  const now = Date.now();

  // Verifica se o cache é válido (menos de 1 dia)
  if (cachedData && now - lastFetch < CACHE_DURATION) {
    return NextResponse.json({
      ...cachedData,
      cached: true,
      cacheAge: Math.floor((now - lastFetch) / 1000 / 60), // minutos
    });
  }

  // Busca novos dados
  const data = await scrapeVakinha();
  cachedData = data;
  lastFetch = now;

  return NextResponse.json({
    ...data,
    cached: false,
  });
}
