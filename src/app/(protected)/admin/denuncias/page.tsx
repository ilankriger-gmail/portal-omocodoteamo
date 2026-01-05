import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { StatusSelect } from "./status-select";
import { ShieldAlert, User, Calendar, MessageSquare, ExternalLink, Trash2, Download } from "lucide-react";
import { DeleteButton } from "./delete-button";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const plataformaIcons: Record<string, string> = {
  instagram: "https://cdn-icons-png.flaticon.com/512/174/174855.png",
  tiktok: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png",
  facebook: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
  youtube: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
  twitter: "https://cdn-icons-png.flaticon.com/512/733/733579.png",
  whatsapp: "https://cdn-icons-png.flaticon.com/512/733/733585.png",
};

const plataformaLabels: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  twitter: "X/Twitter",
  whatsapp: "WhatsApp",
  outro: "Outro",
};

export default async function DenunciasPage({
  searchParams,
}: {
  searchParams: Promise<{ plataforma?: string; status?: string }>;
}) {
  const { plataforma, status } = await searchParams;

  // Buscar todas as denúncias
  const allDenuncias = await prisma.denuncia.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Construir filtro
  const whereClause: Record<string, unknown> = {};
  if (plataforma) {
    whereClause.plataforma = plataforma;
  }
  if (status) {
    whereClause.status = status;
  }

  const denuncias = await prisma.denuncia.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    orderBy: { createdAt: "desc" },
  });

  // Contadores por plataforma
  const countByPlataforma = allDenuncias.reduce((acc, d) => {
    const p = d.plataforma.toLowerCase();
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Contadores por status
  const countByStatus = {
    PENDENTE: allDenuncias.filter(d => d.status === "PENDENTE").length,
    ANALISANDO: allDenuncias.filter(d => d.status === "ANALISANDO").length,
    RESOLVIDA: allDenuncias.filter(d => d.status === "RESOLVIDA").length,
    DESCARTADA: allDenuncias.filter(d => d.status === "DESCARTADA").length,
  };

  // Construir query string
  const buildQueryString = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const allParams = { plataforma, status, ...newParams };
    Object.entries(allParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const str = params.toString();
    return str ? `?${str}` : "";
  };

  const statusColors = {
    PENDENTE: "bg-yellow-900/50 text-yellow-400 border-yellow-500/30",
    ANALISANDO: "bg-blue-900/50 text-blue-400 border-blue-500/30",
    RESOLVIDA: "bg-green-900/50 text-green-400 border-green-500/30",
    DESCARTADA: "bg-zinc-700/50 text-zinc-400 border-zinc-500/30",
  };

  // Plataformas únicas
  const plataformas = [...new Set(allDenuncias.map(d => d.plataforma.toLowerCase()))].sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Denúncias</h1>
        <a
          href="/api/denuncias/export"
          download
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download size={16} />
          Exportar CSV
        </a>
      </div>
      <p className="text-zinc-400 text-sm mb-6">
        Gerencie as denúncias de perfis falsos recebidas através do formulário
      </p>

      {/* Filtros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 space-y-4">
        {/* Filtros por Plataforma */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Plataforma</label>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/admin/denuncias"
              className={`px-3 py-1.5 rounded-lg text-xs ${!plataforma && !status ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            >
              Todas ({allDenuncias.length})
            </Link>
            {plataformas.map((p) => (
              <Link
                key={p}
                href={`/admin/denuncias${buildQueryString({ plataforma: p })}`}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ${plataforma === p ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                {plataformaIcons[p] && (
                  <Image src={plataformaIcons[p]} alt={p} width={14} height={14} className="rounded" />
                )}
                {plataformaLabels[p] || p} ({countByPlataforma[p] || 0})
              </Link>
            ))}
          </div>
        </div>

        {/* Filtros por Status */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Status</label>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/admin/denuncias${buildQueryString({ status: undefined })}`}
              className={`px-3 py-1.5 rounded-lg text-xs ${!status ? "bg-zinc-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            >
              Todos
            </Link>
            {(["PENDENTE", "ANALISANDO", "RESOLVIDA", "DESCARTADA"] as const).map((s) => (
              <Link
                key={s}
                href={`/admin/denuncias${buildQueryString({ status: s })}`}
                className={`px-3 py-1.5 rounded-lg text-xs border ${status === s ? statusColors[s] : "bg-zinc-800 text-zinc-300 border-transparent hover:bg-zinc-700"}`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()} ({countByStatus[s]})
              </Link>
            ))}
          </div>
        </div>

        {/* Limpar filtros */}
        {(plataforma || status) && (
          <div className="pt-2 border-t border-zinc-800">
            <Link
              href="/admin/denuncias"
              className="text-xs text-red-400 hover:text-red-300"
            >
              Limpar todos os filtros
            </Link>
          </div>
        )}
      </div>

      {/* Filtros ativos */}
      {(plataforma || status) && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-zinc-500">Filtros ativos:</span>
          {plataforma && (
            <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded-full">
              Plataforma: {plataformaLabels[plataforma] || plataforma}
            </span>
          )}
          {status && (
            <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">
              Status: {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
          )}
        </div>
      )}

      {/* Contador de resultados */}
      <div className="text-xs text-zinc-500 mb-4">
        {denuncias.length} denúncia{denuncias.length !== 1 ? "s" : ""} encontrada{denuncias.length !== 1 ? "s" : ""}
      </div>

      {denuncias.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
          <ShieldAlert size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhuma denúncia encontrada com os filtros selecionados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {denuncias.map((d) => (
            <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {/* Ícone da plataforma */}
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    {plataformaIcons[d.plataforma.toLowerCase()] ? (
                      <Image
                        src={plataformaIcons[d.plataforma.toLowerCase()]}
                        alt={d.plataforma}
                        width={28}
                        height={28}
                        className="rounded"
                      />
                    ) : (
                      <ShieldAlert size={24} className="text-zinc-500" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">@{d.perfilFalso}</h3>
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-full">
                        {plataformaLabels[d.plataforma.toLowerCase()] || d.plataforma}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Calendar size={12} />
                      Denunciado em{" "}
                      {new Date(d.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusSelect id={d.id} currentStatus={d.status} />
                  <DeleteButton id={d.id} perfilFalso={d.perfilFalso} />
                </div>
              </div>

              {/* Descrição */}
              <div className="bg-zinc-800 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                  <MessageSquare size={14} />
                  <span className="font-medium">Descrição da denúncia</span>
                </div>
                <p className="whitespace-pre-wrap text-white text-sm">{d.descricao}</p>
              </div>

              {/* Contato e Imagem */}
              <div className="flex flex-wrap gap-4">
                {d.contato && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg text-sm">
                    <User size={14} className="text-zinc-500" />
                    <span className="text-zinc-400">Contato:</span>
                    <span className="text-white">{d.contato}</span>
                  </div>
                )}

                {d.imagemUrl && (
                  <a
                    href={d.imagemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-purple-900/30 text-purple-400 rounded-lg text-sm hover:bg-purple-900/50 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Ver evidência/screenshot
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
