import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isPlataforma, type Plataforma } from "./icons";
import { garantirTabelas, sugestaoInicial } from "./inicial";

export const AGREGADOR_TAG = "agregador";

export type AgregadorDados = {
  nome: string;
  bio: string | null;
  avatarUrl: string | null;
  links: { id: string; titulo: string; url: string; destaque: boolean }[];
  redes: { plataforma: Plataforma; url: string }[];
  gaId: string | null;
};

// Conteúdo de reserva: só aparece se o banco estiver fora do ar E esta
// instância ainda não tiver nenhuma versão boa em memória.
const RESERVA: AgregadorDados = {
  nome: "O Moço do Te Amo",
  bio: null,
  avatarUrl: null,
  links: [
    { id: "portal", titulo: "Portal da Transparência", url: "https://portal.omocodoteamo.com.br", destaque: true },
    { id: "vaquinhas", titulo: "Vaquinhas ativas", url: "https://portal.omocodoteamo.com.br/vaquinhas", destaque: false },
  ],
  redes: [],
  gaId: null,
};

async function buscarNoBanco(): Promise<AgregadorDados> {
  await garantirTabelas();
  const [perfil, links, redes, config] = await Promise.all([
    prisma.agregadorPerfil.findFirst(),
    prisma.agregadorLink.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
      select: { id: true, titulo: true, url: true, destaque: true },
    }),
    prisma.agregadorRede.findMany({ orderBy: { ordem: "asc" } }),
    prisma.config.findFirst({ select: { googleAnalyticsId: true } }),
  ]);

  // Nada publicado ainda: mostra a sugestão montada com os dados do portal
  if (!perfil) {
    const sugestao = await sugestaoInicial();
    return {
      nome: sugestao.nome,
      bio: sugestao.bio || null,
      avatarUrl: sugestao.avatarUrl || null,
      links: sugestao.links.map((l, i) => ({ id: `padrao-${i}`, titulo: l.titulo, url: l.url, destaque: l.destaque })),
      redes: sugestao.redes,
      gaId: config?.googleAnalyticsId || null,
    };
  }

  return {
    nome: perfil.nome || RESERVA.nome,
    bio: perfil.bio || null,
    avatarUrl: perfil.avatarUrl || null,
    links,
    redes: redes.flatMap((r) =>
      isPlataforma(r.plataforma) ? [{ plataforma: r.plataforma, url: r.url }] : []
    ),
    gaId: config?.googleAnalyticsId || null,
  };
}

// Cache de dados do Next: o banco é consultado no máximo 1x a cada 5 min
// (ou imediatamente após uma edição no admin, via revalidateTag).
const buscarComCache = unstable_cache(buscarNoBanco, ["agregador-dados-v1"], {
  tags: [AGREGADOR_TAG],
  revalidate: 300,
});

// Última versão boa conhecida por esta instância do servidor.
let ultimaVersaoBoa: AgregadorDados | null = null;

export async function getAgregadorDados(): Promise<{ dados: AgregadorDados; degradado: boolean }> {
  try {
    const dados = await buscarComCache();
    ultimaVersaoBoa = dados;
    return { dados, degradado: false };
  } catch (error) {
    console.error("[agregador] Falha ao buscar dados, usando reserva:", error);
    return { dados: ultimaVersaoBoa ?? RESERVA, degradado: true };
  }
}
