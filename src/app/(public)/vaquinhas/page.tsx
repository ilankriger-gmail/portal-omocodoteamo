import { prisma } from "@/lib/prisma";
import { VaquinhasClientList } from "./vaquinhas-client-list";

// Definimos a página como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: "Vaquinhas | Portal da Transparência O Moço do Te Amo",
  description: "Veja todas as campanhas de doação com total transparência",
};

export default async function VaquinhasPage() {
  const vaquinhas = await prisma.vaquinha.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { atualizacoes: true } },
    },
  });

  // Converter para formato serializável
  const vaquinhasData = vaquinhas.map((v) => ({
    id: v.id,
    titulo: v.titulo,
    descricao: v.descricao,
    imagemUrl: v.imagemUrl,
    videoUrl: v.videoUrl,
    meta: v.meta,
    valorAtual: v.valorAtual,
    status: v.status,
    chavePix: v.chavePix,
    linkOriginal: v.linkOriginal,
    doacoes: v.doacoes || 0, // Adicionar campo de doações
    coracoes: v.coracoes || 0, // Adicionar campo de corações
    atualizacoesCount: v._count.atualizacoes,
    createdAt: v.createdAt.toISOString(),
  }));

  return <VaquinhasClientList vaquinhas={vaquinhasData} />;
}
