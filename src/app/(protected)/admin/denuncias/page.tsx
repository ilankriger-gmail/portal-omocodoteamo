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
  telegram: "https://cdn-icons-png.flaticon.com/512/2111/2111646.png",
  kwai: "https://cdn-icons-png.flaticon.com/512/6422/6422202.png",
};

const plataformaLabels: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  twitter: "X/Twitter",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  kwai: "Kwai",
  outro: "Outro",
};

// Gera link para o perfil na plataforma
const getProfileUrl = (plataforma: string, perfil: string): string | null => {
  const cleanPerfil = perfil.replace(/^@/, "").trim();
  switch (plataforma.toLowerCase()) {
    case "instagram":
      return `https://instagram.com/${cleanPerfil}`;
    case "tiktok":
      return `https://tiktok.com/@${cleanPerfil}`;
    case "facebook":
      return `https://facebook.com/${cleanPerfil}`;
    case "youtube":
      return `https://youtube.com/@${cleanPerfil}`;
    case "twitter":
      return `https://x.com/${cleanPerfil}`;
    case "kwai":
      return `https://kwai.com/@${cleanPerfil}`;
    default:
      return null;
  }
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
          {denuncias.map((d) => {
            const profileUrl = getProfileUrl(d.plataforma, d.perfilFalso);
            return (
            <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-start gap-4">
                  {/* Ícone da plataforma - clicável */}
                  {profileUrl ? (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 hover:bg-zinc-700 transition-colors"
                      title={`Abrir perfil no ${plataformaLabels[d.plataforma.toLowerCase()] || d.plataforma}`}
                    >
                      {plataformaIcons[d.plataforma.toLowerCase()] ? (
                        <Image
                          src={plataformaIcons[d.plataforma.toLowerCase()]}
                          alt={d.plataforma}
                          width={32}
                          height={32}
                          className="rounded"
                        />
                      ) : (
                        <ShieldAlert size={28} className="text-zinc-500" />
                      )}
                    </a>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      {plataformaIcons[d.plataforma.toLowerCase()] ? (
                        <Image
                          src={plataformaIcons[d.plataforma.toLowerCase()]}
                          alt={d.plataforma}
                          width={32}
                          height={32}
                          className="rounded"
                        />
                      ) : (
                        <ShieldAlert size={28} className="text-zinc-500" />
                      )}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {/* @ clicável */}
                      {profileUrl ? (
                        <a
                          href={profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl font-bold text-red-400 hover:text-red-300 hover:underline transition-colors flex items-center gap-2"
                        >
                          @{d.perfilFalso}
                          <ExternalLink size={16} />
                        </a>
                      ) : (
                        <h3 className="text-xl font-bold text-white">@{d.perfilFalso}</h3>
                      )}
                      <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-sm rounded-full">
                        {plataformaLabels[d.plataforma.toLowerCase()] || d.plataforma}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-base text-zinc-500">
                      <Calendar size={16} />
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
              <div className="bg-zinc-800 p-5 rounded-lg mb-5">
                <div className="flex items-center gap-2 text-base text-zinc-400 mb-3">
                  <MessageSquare size={18} />
                  <span className="font-medium">Descrição da denúncia</span>
                </div>
                <p className="whitespace-pre-wrap text-white text-lg leading-relaxed">{d.descricao}</p>
              </div>

              {/* Ações rápidas */}
              <div className="flex flex-wrap gap-3">
                {/* Link direto para o perfil */}
                {profileUrl && (
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-900/30 text-red-400 rounded-lg text-base font-medium hover:bg-red-900/50 transition-colors"
                  >
                    <ExternalLink size={18} />
                    Abrir perfil no {plataformaLabels[d.plataforma.toLowerCase()] || d.plataforma}
                  </a>
                )}

                {d.contato && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 rounded-lg text-base">
                    <User size={18} className="text-zinc-500" />
                    <span className="text-zinc-400">Contato:</span>
                    <span className="text-white font-medium">{d.contato}</span>
                  </div>
                )}

                {d.imagemUrl && (
                  <a
                    href={d.imagemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-900/30 text-purple-400 rounded-lg text-base font-medium hover:bg-purple-900/50 transition-colors"
                  >
                    <ExternalLink size={18} />
                    Ver evidência/screenshot
                  </a>
                )}
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
