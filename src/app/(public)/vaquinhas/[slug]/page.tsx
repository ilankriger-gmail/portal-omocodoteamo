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
  Instagram,
} from "lucide-react";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { SocialMediaViewer } from "@/components/ui/social-media-viewer";
import { InstagramEmbed } from "@/components/ui/instagram-embed";

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

function getInstagramEmbedUrl(url: string): string | null {
  const patterns = [
    /instagram\.com\/(p|reel|reels)\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[2]) {
      return `https://www.instagram.com/p/${match[2]}/embed`;
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
    INSTAGRAM: Instagram,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <Link
        href="/vaquinhas"
        className="inline-flex items-center gap-2 text-sm mb-6"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft size={18} />
        Voltar
      </Link>

      {/* Vídeo principal */}
      {embedUrl && (
        <div className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: 'var(--background)' }}>
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
          <div className="p-[2px] rounded-full" style={{ backgroundColor: 'var(--background)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
              <Heart className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{vaquinha.titulo}</h1>
          <span
            className={`text-sm ${
              vaquinha.status === "ATIVA" ? "text-green-400" : ""
            }`}
            style={vaquinha.status !== "ATIVA" ? { color: 'var(--muted)' } : {}}
          >
            {vaquinha.status === "ATIVA" ? "Campanha Ativa" : "Encerrada"}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-base leading-relaxed mb-6 whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>
        {vaquinha.descricao}
      </p>

      {/* Progress Card */}
      <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="flex items-center justify-between text-sm mb-3">
          <div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Arrecadado</p>
            <p className="text-green-400 font-semibold text-lg">
              R$ {vaquinha.valorAtual.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Meta</p>
            <p className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
              R$ {vaquinha.meta.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--surface)' }}>
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-right" style={{ color: 'var(--muted)' }}>{progress.toFixed(0)}%</p>

        {/* Estatísticas de engajamento */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <span className="bg-red-500/20 text-red-400 p-1.5 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.3.67-4.47 2.7C10.85 3.67 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{vaquinha.coracoes || 0}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>corações</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-green-500/20 text-green-400 p-1.5 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{vaquinha.doacoes || 0}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>doações</p>
            </div>
          </div>
        </div>
      </div>

      {/* PIX */}
      {vaquinha.status === "ATIVA" && (
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            Chave PIX
          </p>
          <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: 'var(--card-bg)' }}>
            <p className="text-base font-mono break-all" style={{ color: 'var(--muted)' }}>
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
        className="flex items-center justify-center gap-2 w-full py-3 bg-transparent rounded-xl text-sm transition-colors mb-6"
        style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        <ExternalLink size={16} />
        Ver na Vakinha.com.br
      </a>

      {/* Divider */}
      {vaquinha.atualizacoes.length > 0 && (
        <>
          <div className="my-6" style={{ borderTop: '1px solid var(--border)' }} />

          {/* Timeline */}
          <div>
            <div className="flex flex-wrap justify-between items-center mb-4">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Atualizações ({vaquinha.atualizacoes.length})
              </p>
            </div>

            <div className="space-y-4">
              {vaquinha.atualizacoes.map((att) => {
                const Icon = tipoIcon[att.tipo];

                return (
                  <div
                    key={att.id}
                    className="rounded-2xl p-4"
                    style={{ backgroundColor: 'var(--card-bg)' }}
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
                            : att.tipo === "INSTAGRAM"
                            ? "bg-pink-500/10 text-pink-400"
                            : ""
                        }`}
                        style={!["COMPROVANTE", "VIDEO", "FOTO", "INSTAGRAM"].includes(att.tipo) ? { backgroundColor: 'var(--surface)', color: 'var(--muted)' } : {}}
                      >
                        <Icon size={14} />
                      </span>
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>
                        {new Date(att.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-base whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--muted)' }}>
                      {att.conteudo}
                    </p>

                    {/* Exibição de grid/carrossel para o tipo GALERIA */}
                    {att.tipo === "GALERIA" && att.imagens && att.imagens.length > 0 && (
                      <div className="mt-3 rounded-xl overflow-hidden relative">
                        <SocialMediaViewer
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
                        <div className="relative w-full aspect-[4/5]">
                          <NextImage
                            src={att.imagemUrl}
                            alt="Atualização"
                            fill
                            sizes="(max-width: 640px) 100vw, 600px"
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}

                    {/* Embed do Instagram */}
                    {att.tipo === "INSTAGRAM" && att.videoUrl && (
                      <div className="mt-3">
                        <InstagramEmbed url={att.videoUrl} />
                      </div>
                    )}

                    {/* Embed do YouTube */}
                    {att.tipo === "VIDEO" && att.videoUrl && (
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
