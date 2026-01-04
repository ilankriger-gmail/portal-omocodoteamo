import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Image, Video, FileCheck, MessageSquare, Images } from "lucide-react";
import { NovaAtualizacaoForm } from "./nova-form";
import { DeleteAtualizacaoButton } from "./delete-button";
import { StatsForm } from "./stats-form";
import { ImageCarousel } from "@/components/ui/image-carousel";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Extrai o ID do vídeo do YouTube de várias URLs possíveis
function getYoutubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return null;
}

export default async function AtualizacoesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vaquinha = await prisma.vaquinha.findUnique({
    where: { id },
    include: {
      atualizacoes: {
        orderBy: { createdAt: "desc" },
        include: {
          imagens: {
            orderBy: { ordem: "asc" },
          }
        }
      },
    },
  });

  if (!vaquinha) {
    notFound();
  }

  const tipoIcon = {
    TEXTO: MessageSquare,
    FOTO: Image,
    VIDEO: Video,
    COMPROVANTE: FileCheck,
    GALERIA: Images,
  };

  const tipoLabel = {
    TEXTO: "Texto",
    FOTO: "Foto",
    VIDEO: "Vídeo",
    COMPROVANTE: "Comprovante",
    GALERIA: "Galeria",
  };

  return (
    <div>
      <Link
        href={`/admin/vaquinhas/${id}`}
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4"
      >
        <ArrowLeft size={20} />
        Voltar para edição
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{vaquinha.titulo}</h1>
        <div className="flex flex-wrap gap-4 mt-1">
          <p className="text-zinc-400">Thread de atualizações</p>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="bg-blue-900/20 text-blue-400 p-1 rounded-md">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.3.67-4.47 2.7C10.85 3.67 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </span>
              <span className="text-zinc-300 font-medium">{vaquinha.coracoes || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="bg-green-900/20 text-green-400 p-1 rounded-md">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
              <span className="text-zinc-300 font-medium">{vaquinha.doacoes || 0} doações</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Histórico</h2>

          {vaquinha.atualizacoes.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-400">
              Nenhuma atualização publicada ainda
            </div>
          ) : (
            <div className="space-y-4">
              {vaquinha.atualizacoes.map((att) => {
                const Icon = tipoIcon[att.tipo];
                return (
                  <div key={att.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`p-1.5 rounded-lg ${
                            att.tipo === "COMPROVANTE"
                              ? "bg-green-900 text-green-400"
                              : att.tipo === "VIDEO"
                              ? "bg-red-900 text-red-400"
                              : att.tipo === "FOTO"
                              ? "bg-blue-900 text-blue-400"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          <Icon size={16} />
                        </span>
                        <span className="text-sm text-zinc-400">{tipoLabel[att.tipo]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500">
                          {new Date(att.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <DeleteAtualizacaoButton id={att.id} vaquinhaId={id} />
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap">{att.conteudo}</p>

                    {/* Exibição de carrossel para o tipo GALERIA */}
                    {att.tipo === "GALERIA" && att.imagens && att.imagens.length > 0 && (
                      <div className="mt-3 max-w-md">
                        <ImageCarousel
                          images={att.imagens.map(img => ({
                            id: img.id,
                            url: img.url,
                            legenda: img.legenda || undefined,
                          }))}
                          showCaptions={true}
                        />
                      </div>
                    )}

                    {/* Manter suporte para imagem única do tipo FOTO ou COMPROVANTE */}
                    {(att.tipo === "FOTO" || att.tipo === "COMPROVANTE") && att.imagemUrl && (
                      <img
                        src={att.imagemUrl}
                        alt="Imagem"
                        className="mt-3 rounded-lg max-w-md"
                      />
                    )}

                    {att.videoUrl && (
                      <div className="mt-3 space-y-2">
                        {getYoutubeEmbedUrl(att.videoUrl) ? (
                          <div className="aspect-video max-w-md">
                            <iframe
                              src={getYoutubeEmbedUrl(att.videoUrl)}
                              title="Vídeo"
                              className="w-full h-full rounded-lg"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <a
                            href={att.videoUrl}
                            target="_blank"
                            className="inline-flex items-center gap-2 text-red-600 hover:underline"
                          >
                            <Video size={16} />
                            Ver vídeo no YouTube
                          </a>
                        )}
                        <div className="text-xs text-zinc-500">
                          <a
                            href={att.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Link original: {att.videoUrl}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Estatísticas</h2>
            <StatsForm vaquinhaId={id} initialDoacoes={vaquinha.doacoes} initialCoracoes={vaquinha.coracoes} />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Nova Atualização</h2>
            <NovaAtualizacaoForm vaquinhaId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
