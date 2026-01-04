import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import { isValidImageUrl } from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
  Video,
  FileCheck,
  MessageSquare,
  Heart,
  Images,
} from "lucide-react";
import { ImageCarousel } from "@/components/ui/image-carousel";

import { CopyPixButton } from "./copy-pix";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vaquinha = await prisma.vaquinha.findUnique({ where: { slug } });

  if (!vaquinha) return { title: "Vaquinha não encontrada" };

  return {
    title: `${vaquinha.titulo} | Portal da Transparência`,
    description: vaquinha.descricao,
  };
}

export default async function VaquinhaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const vaquinha = await prisma.vaquinha.findUnique({
    where: { slug },
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

  const progress = Math.min((vaquinha.valorAtual / vaquinha.meta) * 100, 100);
  const embedUrl = vaquinha.videoUrl ? getYouTubeEmbedUrl(vaquinha.videoUrl) : null;

  const tipoIcon = {
    TEXTO: MessageSquare,
    FOTO: ImageIcon,
    VIDEO: Video,
    COMPROVANTE: FileCheck,
    GALERIA: Images,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <Link
        href="/vaquinhas"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6"
      >
        <ArrowLeft size={18} />
        Voltar
      </Link>

      {/* Vídeo principal */}
      {embedUrl && (
        <div className="rounded-2xl overflow-hidden mb-4 bg-black">
          <div className="aspect-[9/16] max-h-[450px] mx-auto">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Image (se não tiver vídeo) */}
      {!embedUrl && isValidImageUrl(vaquinha.imagemUrl) && (
        <div className="rounded-2xl overflow-hidden mb-4">
          <div className="relative w-full aspect-video">
            <NextImage
              src={vaquinha.imagemUrl}
              alt={vaquinha.titulo}
              fill
              sizes="(max-width: 640px) 100vw, 800px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
          <div className="p-[2px] rounded-full bg-black">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <Heart className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-white font-semibold text-sm">{vaquinha.titulo}</h1>
          <span
            className={`text-xs ${
              vaquinha.status === "ATIVA" ? "text-green-400" : "text-zinc-500"
            }`}
          >
            {vaquinha.status === "ATIVA" ? "Campanha Ativa" : "Encerrada"}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-zinc-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
        {vaquinha.descricao}
      </p>

      {/* Progress Card */}
      <div className="bg-zinc-900/50 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between text-sm mb-3">
          <div>
            <p className="text-zinc-500 text-xs">Arrecadado</p>
            <p className="text-green-400 font-semibold">
              R$ {vaquinha.valorAtual.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-xs">Meta</p>
            <p className="text-white font-semibold">
              R$ {vaquinha.meta.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-zinc-500 text-xs text-right">{progress.toFixed(0)}%</p>
      </div>

      {/* PIX */}
      {vaquinha.status === "ATIVA" && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Chave PIX
          </p>
          <div className="bg-zinc-900/50 rounded-xl p-3 mb-3">
            <p className="text-zinc-300 text-sm font-mono break-all">
              {vaquinha.chavePix}
            </p>
          </div>
          <CopyPixButton chavePix={vaquinha.chavePix} />
        </div>
      )}

      {/* Link Original */}
      <a
        href={vaquinha.linkOriginal}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-transparent border border-zinc-800 hover:bg-zinc-900 text-zinc-400 rounded-xl text-sm transition-colors mb-6"
      >
        <ExternalLink size={16} />
        Ver na Vakinha.com.br
      </a>

      {/* Divider */}
      {vaquinha.atualizacoes.length > 0 && (
        <>
          <div className="border-t border-zinc-800 my-6" />

          {/* Timeline */}
          <div>
            <div className="flex flex-wrap justify-between items-center mb-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Atualizações ({vaquinha.atualizacoes.length})
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="bg-blue-500/20 text-blue-400 p-1 rounded-md">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.3.67-4.47 2.7C10.85 3.67 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </span>
                  <span className="text-zinc-300">{vaquinha.coracoes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="bg-green-500/20 text-green-400 p-1 rounded-md">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </span>
                  <span className="text-zinc-300">{vaquinha.doacoes || 0} doações</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {vaquinha.atualizacoes.map((att) => {
                const Icon = tipoIcon[att.tipo];

                return (
                  <div
                    key={att.id}
                    className="bg-zinc-900/50 rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`p-1.5 rounded-lg ${
                          att.tipo === "COMPROVANTE"
                            ? "bg-green-500/10 text-green-400"
                            : att.tipo === "VIDEO"
                            ? "bg-red-500/10 text-red-400"
                            : att.tipo === "FOTO"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        <Icon size={14} />
                      </span>
                      <span className="text-zinc-500 text-xs">
                        {new Date(att.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">
                      {att.conteudo}
                    </p>

                    {/* Exibição de carrossel para o tipo GALERIA */}
                    {att.tipo === "GALERIA" && att.imagens && att.imagens.length > 0 && (
                      <div className="mt-3 rounded-xl overflow-hidden relative">
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
                    {(att.tipo === "FOTO" || att.tipo === "COMPROVANTE") && isValidImageUrl(att.imagemUrl) && (
                      <div className="mt-3 rounded-xl overflow-hidden relative">
                        <div className="relative w-full aspect-video">
                          <NextImage
                            src={att.imagemUrl}
                            alt="Atualização"
                            fill
                            sizes="(max-width: 640px) 100vw, 600px"
                            className="object-contain"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}

                    {att.videoUrl && (
                      <div className="mt-3 space-y-2">
                        {getYouTubeEmbedUrl(att.videoUrl) ? (
                          <div className="aspect-video w-full">
                            <iframe
                              src={getYouTubeEmbedUrl(att.videoUrl)}
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
                            className="inline-flex items-center gap-2 text-red-400 text-sm hover:underline"
                          >
                            <Video size={14} />
                            Assistir vídeo
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}