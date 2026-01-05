"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, Search, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { isValidImageUrl } from "@/lib/utils";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
interface VaquinhaData {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  imagemUrl: string | null;
  videoUrl: string | null;
  meta: number;
  valorAtual: number;
  status: string;
  chavePix: string;
  linkOriginal: string;
  doacoes: number; // Adicionar campo de doações
  coracoes: number; // Adicionar campo de corações
  atualizacoesCount: number;
  createdAt: string;
}

interface Props {
  vaquinhas: VaquinhaData[];
}

const ITEMS_PER_PAGE = 10;

// Função para embaralhar array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function VaquinhasClientList({ vaquinhas: initialVaquinhas }: Props) {
  const [vaquinhas, setVaquinhas] = useState<VaquinhaData[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Embaralhar ao montar
  useEffect(() => {
    setVaquinhas(shuffleArray(initialVaquinhas));
  }, [initialVaquinhas]);

  // Contadores
  const ativasCount = initialVaquinhas.filter((v) => v.status === "ATIVA").length;
  const encerradasCount = initialVaquinhas.filter((v) => v.status === "ENCERRADA").length;

  // Filtrar
  const filteredVaquinhas = useMemo(() => {
    let result = vaquinhas;

    // Filtro por status
    if (statusFilter) {
      result = result.filter((v) => v.status === statusFilter);
    }

    // Filtro por busca
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.titulo?.toLowerCase().includes(searchLower) ||
          v.descricao?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [vaquinhas, statusFilter, search]);

  const totalPages = Math.ceil(filteredVaquinhas.length / ITEMS_PER_PAGE);
  const paginatedVaquinhas = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredVaquinhas.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVaquinhas, page]);

  // Reset página ao filtrar
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="w-6 h-6 text-green-500" />
        </div>
        <h1 className="text-lg font-semibold text-white mb-1">Minhas Vaquinhas</h1>
        <p className="text-zinc-300 text-sm leading-relaxed max-w-sm mx-auto">
          Campanhas selecionadas pela ONG do Te Amo ou solicitadas por seguidores
          após nossos vídeos. Transparência total em cada doação.
        </p>
      </div>

      {/* Busca */}
      <div className="mb-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar vaquinha..."
            className="w-full pl-9 pr-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            !statusFilter
              ? "bg-green-600 text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          Todas ({initialVaquinhas.length})
        </button>
        <button
          onClick={() => setStatusFilter("ATIVA")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
            statusFilter === "ATIVA"
              ? "bg-green-600 text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          <Heart size={10} />
          Ativas ({ativasCount})
        </button>
        <button
          onClick={() => setStatusFilter("ENCERRADA")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
            statusFilter === "ENCERRADA"
              ? "bg-zinc-600 text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          <Clock size={10} />
          Encerradas ({encerradasCount})
        </button>
      </div>

      {/* Contador */}
      {filteredVaquinhas.length > 0 && (
        <div className="text-xs text-zinc-300 mb-2">
          {filteredVaquinhas.length} vaquinha{filteredVaquinhas.length !== 1 ? "s" : ""}
          {search && ` encontrada${filteredVaquinhas.length !== 1 ? "s" : ""}`}
        </div>
      )}

      {/* Lista */}
      {filteredVaquinhas.length === 0 ? (
        <div className="bg-zinc-900/50 rounded-xl p-8 text-center">
          <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">
            {search ? "Nenhuma vaquinha encontrada" : "Nenhuma vaquinha"}
          </h3>
          <p className="text-zinc-500 text-sm">
            {search ? "Tente outra busca" : "Em breve teremos campanhas"}
          </p>
        </div>
      ) : (
        <>
          {/* Seção de Ativas */}
          {!statusFilter && paginatedVaquinhas.filter(v => v.status === "ATIVA").length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Heart size={14} className="text-green-500" />
                <h2 className="text-sm font-semibold text-white">Campanhas Ativas</h2>
                <span className="text-xs text-zinc-400">({paginatedVaquinhas.filter(v => v.status === "ATIVA").length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {paginatedVaquinhas.filter(v => v.status === "ATIVA").map((v) => {
                  const progress = Math.min((v.valorAtual / v.meta) * 100, 100);
                  return (
                    <Link
                      key={v.id}
                      href={`/vaquinhas/${v.slug}`}
                      className="bg-zinc-900/50 rounded-xl overflow-hidden border border-green-500/20 flex flex-col h-full"
                    >
                      <div className="aspect-[4/3] relative flex-shrink-0">
                        {isValidImageUrl(v.imagemUrl) ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={v.imagemUrl}
                              alt={v.titulo}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <Heart className="w-8 h-8 text-green-500/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
                          Ativa
                        </div>
                        {v.videoUrl && (
                          <div className="absolute top-2 left-2 w-5 h-5 bg-green-600 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white text-lg font-bold line-clamp-2 min-h-[3.5rem]">{v.titulo}</h3>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex justify-between text-base mb-2 min-h-[1.5rem]">
                          <span className="text-green-400">
                            {v.atualizacoesCount > 0 ? `${v.atualizacoesCount} atualização${v.atualizacoesCount !== 1 ? "ões" : ""}` : ""}
                          </span>
                          <div className="flex items-center gap-3">
                            {v.doacoes > 0 &&
                              <span className="flex items-center gap-1 text-green-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                                {v.doacoes}
                              </span>
                            }
                            {v.coracoes > 0 &&
                              <span className="flex items-center gap-1 text-red-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.3.67-4.47 2.7C10.85 3.67 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                                {v.coracoes}
                              </span>
                            }
                          </div>
                        </div>
                        <div className="mb-4 flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-green-400 font-bold text-xl">R$ {v.valorAtual.toLocaleString("pt-BR")}</span>
                            <span className="text-zinc-300 text-base">R$ {v.meta.toLocaleString("pt-BR")}</span>
                          </div>
                          <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="text-center text-base font-semibold text-zinc-300 mt-2">{Math.round(progress)}%</div>
                        </div>
                        <div className="w-full py-3 bg-green-600 hover:bg-green-500 text-white text-base font-bold rounded-lg text-center transition-colors mt-auto">
                          Quero Ajudar
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Seção de Encerradas */}
          {!statusFilter && paginatedVaquinhas.filter(v => v.status === "ENCERRADA").length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-zinc-500" />
                <h2 className="text-base font-semibold text-white">Campanhas Encerradas</h2>
                <span className="text-sm text-zinc-400">({paginatedVaquinhas.filter(v => v.status === "ENCERRADA").length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedVaquinhas.filter(v => v.status === "ENCERRADA").map((v) => {
                  const progress = Math.min((v.valorAtual / v.meta) * 100, 100);
                  return (
                    <Link
                      key={v.id}
                      href={`/vaquinhas/${v.slug}`}
                      className="bg-zinc-900/50 rounded-xl overflow-hidden opacity-75 hover:opacity-100 transition-opacity flex flex-col h-full"
                    >
                      <div className="aspect-[4/3] relative flex-shrink-0">
                        {isValidImageUrl(v.imagemUrl) ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={v.imagemUrl}
                              alt={v.titulo}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover grayscale"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <Heart className="w-8 h-8 text-zinc-500/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-sm font-medium bg-zinc-500/20 text-zinc-300">
                          Encerrada
                        </div>
                        {v.videoUrl && (
                          <div className="absolute top-2 left-2 w-5 h-5 bg-zinc-600 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white text-lg font-bold line-clamp-2 min-h-[3.5rem]">{v.titulo}</h3>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex justify-between text-base mb-2 min-h-[1.5rem]">
                          <span className="text-zinc-300">
                            {v.atualizacoesCount > 0 ? `${v.atualizacoesCount} atualização${v.atualizacoesCount !== 1 ? "ões" : ""}` : ""}
                          </span>
                          <div className="flex items-center gap-3">
                            {v.doacoes > 0 &&
                              <span className="flex items-center gap-1 text-zinc-300">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                                {v.doacoes}
                              </span>
                            }
                            {v.coracoes > 0 &&
                              <span className="flex items-center gap-1 text-zinc-300">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.3.67-4.47 2.7C10.85 3.67 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                                {v.coracoes}
                              </span>
                            }
                          </div>
                        </div>
                        <div className="mb-4 flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-zinc-300 font-bold text-xl">R$ {v.valorAtual.toLocaleString("pt-BR")}</span>
                            <span className="text-zinc-400 text-base">R$ {v.meta.toLocaleString("pt-BR")}</span>
                          </div>
                          <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-zinc-600" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="text-center text-base font-semibold text-zinc-300 mt-2">{Math.round(progress)}%</div>
                        </div>
                        <div className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-white text-base font-bold rounded-lg text-center transition-colors mt-auto">
                          Ver Detalhes
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Lista quando há filtro ativo (mantém comportamento original) */}
          {statusFilter && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedVaquinhas.map((v) => {
                const progress = Math.min((v.valorAtual / v.meta) * 100, 100);
                return (
                  <Link
                    key={v.id}
                    href={`/vaquinhas/${v.slug}`}
                    className="bg-zinc-900/50 rounded-xl overflow-hidden flex flex-col h-full"
                  >
                    <div className="aspect-[4/3] relative flex-shrink-0">
                      {isValidImageUrl(v.imagemUrl) ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={v.imagemUrl}
                            alt={v.titulo}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className={`object-cover ${v.status === "ENCERRADA" ? "grayscale" : ""}`}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Heart className="w-8 h-8 text-green-500/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-sm font-medium ${
                        v.status === "ATIVA" ? "bg-green-500/20 text-green-400" : "bg-zinc-500/20 text-zinc-300"
                      }`}>
                        {v.status === "ATIVA" ? "Ativa" : "Encerrada"}
                      </div>
                      {v.videoUrl && (
                        <div className="absolute top-2 left-2 w-5 h-5 bg-green-600 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-lg font-bold line-clamp-2 min-h-[3.5rem]">{v.titulo}</h3>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex justify-between text-base mb-2 min-h-[1.5rem]">
                        <span className={v.status === "ATIVA" ? "text-green-400" : "text-zinc-300"}>
                          {v.atualizacoesCount > 0 ? `${v.atualizacoesCount} atualização${v.atualizacoesCount !== 1 ? "ões" : ""}` : ""}
                        </span>
                        <div className="flex items-center gap-3">
                          {v.doacoes > 0 &&
                            <span className={v.status === "ATIVA" ? "text-green-400 flex items-center gap-1" : "text-zinc-300 flex items-center gap-1"}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              </svg>
                              {v.doacoes}
                            </span>
                          }
                          {v.coracoes > 0 &&
                            <span className={v.status === "ATIVA" ? "text-red-400 flex items-center gap-1" : "text-zinc-300 flex items-center gap-1"}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.3.67-4.47 2.7C10.85 3.67 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                              </svg>
                              {v.coracoes}
                            </span>
                          }
                        </div>
                      </div>
                      <div className="mb-4 flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-400 font-bold text-xl">R$ {v.valorAtual.toLocaleString("pt-BR")}</span>
                          <span className="text-zinc-300 text-base">R$ {v.meta.toLocaleString("pt-BR")}</span>
                        </div>
                        <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${v.status === "ATIVA" ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-zinc-600"}`} style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-center text-base font-semibold text-zinc-300 mt-2">{Math.round(progress)}%</div>
                      </div>
                      <div className="w-full py-3 bg-green-600 hover:bg-green-500 text-white text-base font-bold rounded-lg text-center transition-colors mt-auto">
                        {v.status === "ATIVA" ? "Quero Ajudar" : "Ver Detalhes"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 text-white rounded-lg transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-zinc-300 text-sm">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 text-white rounded-lg transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
