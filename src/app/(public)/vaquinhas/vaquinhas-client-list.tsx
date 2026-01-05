"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, Search, ChevronLeft, ChevronRight, TrendingUp, ExternalLink } from "lucide-react";
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
  doacoes: number;
  coracoes: number;
  atualizacoesCount: number;
  createdAt: string;
}

interface Props {
  vaquinhas: VaquinhaData[];
}

const ITEMS_PER_PAGE = 12;

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

  // Card component para evitar repetição
  const VaquinhaCard = ({ v, isEncerrada = false }: { v: VaquinhaData; isEncerrada?: boolean }) => {
    const progress = Math.min((v.valorAtual / v.meta) * 100, 100);
    const isAtiva = v.status === "ATIVA";

    return (
      <Link
        href={`/vaquinhas/${v.slug}`}
        className={`bg-zinc-900/50 rounded-xl overflow-hidden border ${isAtiva ? "border-green-500/20 hover:border-green-500/40" : "border-zinc-800 hover:border-zinc-700"} flex flex-col h-full transition-all ${isEncerrada ? "opacity-80 hover:opacity-100" : ""}`}
      >
        {/* Imagem */}
        <div className="aspect-video relative flex-shrink-0">
          {isValidImageUrl(v.imagemUrl) ? (
            <Image
              src={v.imagemUrl}
              alt={v.titulo}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover ${isEncerrada ? "grayscale" : ""}`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <Heart className={`w-8 h-8 ${isAtiva ? "text-green-500/30" : "text-zinc-600"}`} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Badge de status */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${isAtiva ? "bg-green-500/20 text-green-400" : "bg-zinc-700/80 text-zinc-300"}`}>
            {isAtiva ? "Ativa" : "Encerrada"}
          </div>

          {/* Badge de vídeo */}
          {v.videoUrl && (
            <div className={`absolute top-2 left-2 w-6 h-6 ${isAtiva ? "bg-green-600" : "bg-zinc-600"} rounded flex items-center justify-center`}>
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          )}

          {/* Título sobre a imagem */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white text-sm font-bold line-clamp-2 leading-tight">{v.titulo}</h3>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-3 flex flex-col flex-grow">
          {/* Valores */}
          <div className="mb-2">
            <div className="flex items-baseline justify-between mb-1">
              <span className={`font-bold text-lg ${isAtiva ? "text-green-400" : "text-zinc-300"}`}>
                R$ {v.valorAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-zinc-500 text-xs">
                R$ {v.meta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Barra de progresso */}
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isAtiva ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-zinc-600"}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Porcentagem */}
            <div className="text-center text-sm font-semibold text-zinc-400 mt-1">{Math.round(progress)}%</div>
          </div>

          {/* Info extra */}
          {(v.linkOriginal || v.atualizacoesCount > 0) && (
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
              <span>
                {v.atualizacoesCount > 0 && `${v.atualizacoesCount} atualização${v.atualizacoesCount !== 1 ? "ões" : ""}`}
              </span>
              {v.linkOriginal && (
                <span className="flex items-center gap-1 text-zinc-500">
                  <ExternalLink size={10} />
                  vakinha.com.br
                </span>
              )}
            </div>
          )}

          {/* Botão */}
          <div className={`w-full py-2.5 ${isAtiva ? "bg-green-600 hover:bg-green-500" : "bg-zinc-700 hover:bg-zinc-600"} text-white text-sm font-semibold rounded-lg text-center transition-colors mt-auto flex items-center justify-center gap-2`}>
            {isAtiva ? (
              <>Doar <ExternalLink size={14} /></>
            ) : (
              "Ver Detalhes"
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="w-6 h-6 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Minhas Vaquinhas</h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          Campanhas selecionadas pela ONG do Te Amo ou solicitadas por seguidores após nossos vídeos
        </p>
      </div>

      {/* Busca */}
      <div className="mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar vaquinha..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            !statusFilter
              ? "bg-green-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Todas ({initialVaquinhas.length})
        </button>
        <button
          onClick={() => setStatusFilter("ATIVA")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            statusFilter === "ATIVA"
              ? "bg-green-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          <Heart size={14} />
          Ativas ({ativasCount})
        </button>
        <button
          onClick={() => setStatusFilter("ENCERRADA")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            statusFilter === "ENCERRADA"
              ? "bg-zinc-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          <Clock size={14} />
          Encerradas ({encerradasCount})
        </button>
      </div>

      {/* Contador */}
      {filteredVaquinhas.length > 0 && (
        <div className="text-sm text-zinc-500 mb-3">
          {filteredVaquinhas.length} vaquinha{filteredVaquinhas.length !== 1 ? "s" : ""}
          {search && ` encontrada${filteredVaquinhas.length !== 1 ? "s" : ""}`}
        </div>
      )}

      {/* Lista */}
      {filteredVaquinhas.length === 0 ? (
        <div className="bg-zinc-900/50 rounded-xl p-8 text-center">
          <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">
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
                <Heart size={16} className="text-green-500" />
                <h2 className="text-base font-semibold text-white">Campanhas Ativas</h2>
                <span className="text-sm text-zinc-500">({paginatedVaquinhas.filter(v => v.status === "ATIVA").length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {paginatedVaquinhas.filter(v => v.status === "ATIVA").map((v) => (
                  <VaquinhaCard key={v.id} v={v} />
                ))}
              </div>
            </>
          )}

          {/* Seção de Encerradas */}
          {!statusFilter && paginatedVaquinhas.filter(v => v.status === "ENCERRADA").length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-zinc-500" />
                <h2 className="text-base font-semibold text-white">Campanhas Encerradas</h2>
                <span className="text-sm text-zinc-500">({paginatedVaquinhas.filter(v => v.status === "ENCERRADA").length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {paginatedVaquinhas.filter(v => v.status === "ENCERRADA").map((v) => (
                  <VaquinhaCard key={v.id} v={v} isEncerrada />
                ))}
              </div>
            </>
          )}

          {/* Lista quando há filtro ativo */}
          {statusFilter && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {paginatedVaquinhas.map((v) => (
                <VaquinhaCard key={v.id} v={v} isEncerrada={v.status === "ENCERRADA"} />
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 text-white rounded-lg transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-zinc-400 text-sm font-medium px-3">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 text-white rounded-lg transition-colors"
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
