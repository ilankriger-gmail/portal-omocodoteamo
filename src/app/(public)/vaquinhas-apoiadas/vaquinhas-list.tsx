"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ExternalLink, Heart, RefreshCw, Clock, Search, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { isValidImageUrl } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
interface VaquinhaData {
  id: string;
  nome: string;
  link: string;
  descricao: string | null;
  videoUrl?: string | null;
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
}

interface ApiResponse {
  vaquinhas: VaquinhaData[];
  cached: boolean;
  lastFetch: number;
  nextFetch: number;
  cacheAge?: number;
}

const ITEMS_PER_PAGE = 10;

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

// Função para embaralhar array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function VaquinhasList() {
  const [vaquinhas, setVaquinhas] = useState<VaquinhaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [nextFetch, setNextFetch] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);

      const url = forceRefresh
        ? "/api/vaquinhas-apoiadas?refresh=true"
        : "/api/vaquinhas-apoiadas";

      const res = await fetch(url);
      const data: ApiResponse = await res.json();

      // Embaralhar a lista
      const shuffled = shuffleArray(data.vaquinhas || []);
      setVaquinhas(shuffled);
      setLastFetch(data.lastFetch);
      setNextFetch(data.nextFetch);
      setPage(1); // Reset para página 1 ao atualizar
    } catch (error) {
      console.error("Erro ao buscar vaquinhas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar e paginar
  const filteredVaquinhas = useMemo(() => {
    if (!search.trim()) return vaquinhas;
    const searchLower = search.toLowerCase();
    return vaquinhas.filter(
      (v) =>
        v.nome?.toLowerCase().includes(searchLower) ||
        v.titulo?.toLowerCase().includes(searchLower) ||
        v.descricao?.toLowerCase().includes(searchLower)
    );
  }, [vaquinhas, search]);

  const totalPages = Math.ceil(filteredVaquinhas.length / ITEMS_PER_PAGE);
  const paginatedVaquinhas = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredVaquinhas.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVaquinhas, page]);

  // Reset página ao buscar
  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 text-[var(--foreground-tertiary)] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Busca */}
      <div className="mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar vaquinha..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--foreground)] text-sm placeholder-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
          />
        </div>
      </div>

      {/* Cache Info e Botão Atualizar */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--foreground-tertiary)]">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Atualizado: {lastFetch ? formatDate(lastFetch) : "—"}</span>
            </div>
            <div className="mt-1">
              Próxima: {nextFetch ? formatDate(nextFetch) : "—"}
            </div>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-hover)] hover:bg-[var(--border)] disabled:opacity-50 text-[var(--foreground)] text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </div>

      {filteredVaquinhas.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8 text-center">
          <Heart className="w-12 h-12 text-[var(--foreground-tertiary)] mx-auto mb-3" />
          <h3 className="text-[var(--foreground)] font-semibold text-lg mb-2">
            {search ? "Nenhuma vaquinha encontrada" : "Nenhuma vaquinha apoiada"}
          </h3>
          <p className="text-[var(--foreground-tertiary)] text-sm">
            {search ? "Tente outra busca" : "Em breve listaremos outras causas"}
          </p>
        </div>
      ) : (
        <>
          {/* Contador */}
          <div className="text-sm text-[var(--foreground-tertiary)] mb-3">
            {filteredVaquinhas.length} vaquinha{filteredVaquinhas.length !== 1 ? "s" : ""}
            {search && ` encontrada${filteredVaquinhas.length !== 1 ? "s" : ""}`}
          </div>

          {/* Seção de Ativas */}
          {paginatedVaquinhas.filter(v => v.status === "ATIVA").length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Heart size={16} className="text-green-600" />
                <h2 className="text-base font-semibold text-[var(--foreground)]">Campanhas Ativas</h2>
                <span className="text-sm text-[var(--foreground-tertiary)]">({paginatedVaquinhas.filter(v => v.status === "ATIVA").length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-md sm:max-w-none mx-auto mb-6">
                {paginatedVaquinhas.filter(v => v.status === "ATIVA").map((v) => {
                  const embedUrl = v.videoUrl ? getYouTubeEmbedUrl(v.videoUrl) : null;
                  return (
                    <div key={v.id} className="bg-[var(--card-bg)] rounded-xl overflow-hidden border border-green-500/30 hover:border-green-500/50 shadow-sm hover:shadow-md flex flex-col h-full transition-all">
                      <a href={v.link} target="_blank" rel="noopener noreferrer" className="block aspect-video relative group flex-shrink-0">
                        {isValidImageUrl(v.imagemUrl) ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={v.imagemUrl}
                              alt={v.nome}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-[var(--surface-hover)] flex items-center justify-center">
                            <Heart className="w-8 h-8 text-green-500/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-600">Ativa</div>
                        {embedUrl && (
                          <div className="absolute top-2 left-2 w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white text-sm font-bold line-clamp-2 leading-tight">{v.titulo || v.nome}</h3>
                        </div>
                      </a>
                      <div className="p-3 flex flex-col flex-grow">
                        <div className="mb-2">
                          {v.valorArrecadado && v.meta ? (
                            <>
                              <div className="flex items-baseline justify-between mb-1">
                                <span className="text-green-600 font-bold text-sm sm:text-base">{v.valorArrecadado}</span>
                                <span className="text-[var(--foreground-tertiary)] text-xs">{v.meta}</span>
                              </div>
                              <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${v.progresso || 0}%` }} />
                              </div>
                              <div className="text-center text-sm font-semibold text-[var(--foreground-tertiary)] mt-1">{Math.round(v.progresso || 0)}%</div>
                            </>
                          ) : (
                            <div className="min-h-[2rem]" />
                          )}
                        </div>
                        {v.chavePix && (
                          <div className="flex items-center gap-1 bg-[var(--surface-hover)] rounded-lg p-2 mb-2 text-xs">
                            <span className="text-[var(--foreground)] font-mono truncate flex-1">{v.chavePix}</span>
                            <CopyButton text={v.chavePix} />
                          </div>
                        )}
                        <a href={v.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-colors mt-auto">
                          Doar <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Seção de Encerradas */}
          {paginatedVaquinhas.filter(v => v.status === "ENCERRADA").length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-[var(--foreground-tertiary)]" />
                <h2 className="text-base font-semibold text-[var(--foreground)]">Campanhas Encerradas</h2>
                <span className="text-sm text-[var(--foreground-tertiary)]">({paginatedVaquinhas.filter(v => v.status === "ENCERRADA").length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-md sm:max-w-none mx-auto">
                {paginatedVaquinhas.filter(v => v.status === "ENCERRADA").map((v) => {
                  const embedUrl = v.videoUrl ? getYouTubeEmbedUrl(v.videoUrl) : null;
                  return (
                    <div key={v.id} className="bg-[var(--card-bg)] rounded-xl overflow-hidden border border-[var(--card-border)] hover:border-[var(--border)] opacity-80 hover:opacity-100 transition-all flex flex-col h-full shadow-sm">
                      <a href={v.link} target="_blank" rel="noopener noreferrer" className="block aspect-video relative group flex-shrink-0">
                        {isValidImageUrl(v.imagemUrl) ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={v.imagemUrl}
                              alt={v.nome}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover grayscale"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-[var(--surface-hover)] flex items-center justify-center">
                            <Heart className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-500">Encerrada</div>
                        {embedUrl && (
                          <div className="absolute top-2 left-2 w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white text-sm font-bold line-clamp-2 leading-tight">{v.titulo || v.nome}</h3>
                        </div>
                      </a>
                      <div className="p-3 flex flex-col flex-grow">
                        <div className="mb-2">
                          {v.valorArrecadado && v.meta ? (
                            <>
                              <div className="flex items-baseline justify-between mb-1">
                                <span className="text-[var(--foreground-secondary)] font-bold text-sm sm:text-base">{v.valorArrecadado}</span>
                                <span className="text-[var(--foreground-tertiary)] text-xs">{v.meta}</span>
                              </div>
                              <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                                <div className="h-full bg-gray-400 rounded-full" style={{ width: `${v.progresso || 0}%` }} />
                              </div>
                              <div className="text-center text-sm font-semibold text-[var(--foreground-tertiary)] mt-1">{Math.round(v.progresso || 0)}%</div>
                            </>
                          ) : (
                            <div className="min-h-[2rem]" />
                          )}
                        </div>
                        <a href={v.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-500 hover:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors mt-auto">
                          Ver Detalhes
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Sem status definido (fallback) */}
          {paginatedVaquinhas.filter(v => !v.status).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-md sm:max-w-none mx-auto">
              {paginatedVaquinhas.filter(v => !v.status).map((v) => {
                const embedUrl = v.videoUrl ? getYouTubeEmbedUrl(v.videoUrl) : null;
                return (
                  <div key={v.id} className="bg-[var(--card-bg)] rounded-xl overflow-hidden border border-green-500/30 hover:border-green-500/50 shadow-sm hover:shadow-md flex flex-col h-full transition-all">
                    <a href={v.link} target="_blank" rel="noopener noreferrer" className="block aspect-video relative group flex-shrink-0">
                      {isValidImageUrl(v.imagemUrl) ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={v.imagemUrl}
                            alt={v.nome}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[var(--surface-hover)] flex items-center justify-center">
                          <Heart className="w-8 h-8 text-green-500/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      {embedUrl && (
                        <div className="absolute top-2 left-2 w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white text-sm font-bold line-clamp-2 leading-tight">{v.titulo || v.nome}</h3>
                      </div>
                    </a>
                    <div className="p-3 flex flex-col flex-grow">
                      <div className="mb-2">
                        {v.valorArrecadado && v.meta ? (
                          <>
                            <div className="flex items-baseline justify-between mb-1">
                              <span className="text-green-600 font-bold text-sm sm:text-base">{v.valorArrecadado}</span>
                              <span className="text-[var(--foreground-tertiary)] text-xs">{v.meta}</span>
                            </div>
                            <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${v.progresso || 0}%` }} />
                            </div>
                            <div className="text-center text-sm font-semibold text-[var(--foreground-tertiary)] mt-1">{Math.round(v.progresso || 0)}%</div>
                          </>
                        ) : (
                          <div className="min-h-[2rem]" />
                        )}
                      </div>
                      {v.chavePix && (
                        <div className="flex items-center gap-1 bg-[var(--surface-hover)] rounded-lg p-2 mb-2 text-xs">
                          <span className="text-[var(--foreground)] font-mono truncate flex-1">{v.chavePix}</span>
                          <CopyButton text={v.chavePix} />
                        </div>
                      )}
                      <a href={v.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-colors mt-auto">
                        Doar <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-[var(--surface-hover)] hover:bg-[var(--border)] disabled:opacity-50 disabled:hover:bg-[var(--surface-hover)] text-[var(--foreground)] rounded-lg transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-[var(--foreground-tertiary)] text-sm font-medium px-3">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-[var(--surface-hover)] hover:bg-[var(--border)] disabled:opacity-50 disabled:hover:bg-[var(--surface-hover)] text-[var(--foreground)] rounded-lg transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
