import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusSelect } from "./status-select";
import { User, MapPin, Mail, Phone, Calendar, Heart, DollarSign, Link2, Users } from "lucide-react";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
const faixaValorLabels: Record<string, string> = {
  ate_1000: "Até R$ 1.000",
  ate_5000: "Até R$ 5.000",
  ate_10000: "Até R$ 10.000",
  ate_50000: "Até R$ 50.000",
  ate_100000: "Até R$ 100.000",
  mais_100000: "Mais de R$ 100.000",
};

const necessidadeLabels: Record<string, string> = {
  dinheiro: "Dinheiro",
  presenca: "Presença",
  conhecimento: "Conhecimento",
  apoio: "Apoio",
};

const periodoLabels: Record<string, string> = {
  hoje: "Hoje",
  "7dias": "Últimos 7 dias",
  "30dias": "Últimos 30 dias",
  mes: "Este mês",
  mes_passado: "Mês passado",
};

function getDateRange(periodo: string): { gte: Date; lte?: Date } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (periodo) {
    case "hoje":
      return { gte: today };
    case "7dias":
      const dias7 = new Date(today);
      dias7.setDate(dias7.getDate() - 7);
      return { gte: dias7 };
    case "30dias":
      const dias30 = new Date(today);
      dias30.setDate(dias30.getDate() - 30);
      return { gte: dias30 };
    case "mes":
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      return { gte: inicioMes };
    case "mes_passado":
      const inicioMesPassado = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const fimMesPassado = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { gte: inicioMesPassado, lte: fimMesPassado };
    default:
      return null;
  }
}

export default async function InscricoesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; faixa?: string; necessidade?: string; estado?: string; cidade?: string; periodo?: string }>;
}) {
  const { status, faixa, necessidade, estado, cidade, periodo } = await searchParams;

  // Buscar todas as inscrições para construir os filtros
  const allInscricoes = await prisma.inscricao.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Extrair estados e cidades únicos
  const estados = [...new Set(allInscricoes.map(i => i.estado))].sort();
  const cidades = estado
    ? [...new Set(allInscricoes.filter(i => i.estado === estado).map(i => i.cidade))].sort()
    : [...new Set(allInscricoes.map(i => i.cidade))].sort();

  // Construir filtro
  const whereClause: Record<string, unknown> = {};
  if (status) {
    whereClause.status = status as "PENDENTE" | "ANALISANDO" | "APROVADA" | "RECUSADA";
  }
  if (faixa) {
    whereClause.faixaValor = faixa;
  }
  if (estado) {
    whereClause.estado = estado;
  }
  if (cidade) {
    whereClause.cidade = cidade;
  }
  if (necessidade) {
    whereClause.necessidade = { has: necessidade };
  }
  if (periodo) {
    const dateRange = getDateRange(periodo);
    if (dateRange) {
      whereClause.createdAt = dateRange;
    }
  }

  const inscricoes = await prisma.inscricao.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    orderBy: { createdAt: "desc" },
  });

  // Contadores por status
  const countByStatus = {
    PENDENTE: allInscricoes.filter(i => i.status === "PENDENTE").length,
    ANALISANDO: allInscricoes.filter(i => i.status === "ANALISANDO").length,
    APROVADA: allInscricoes.filter(i => i.status === "APROVADA").length,
    RECUSADA: allInscricoes.filter(i => i.status === "RECUSADA").length,
  };

  // Construir query string para manter filtros
  const buildQueryString = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const allParams = { status, faixa, necessidade, estado, cidade, periodo, ...newParams };
    Object.entries(allParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const str = params.toString();
    return str ? `?${str}` : "";
  };

  const statusColors = {
    PENDENTE: "bg-yellow-900/50 text-yellow-400 border-yellow-500/30",
    ANALISANDO: "bg-blue-900/50 text-blue-400 border-blue-500/30",
    APROVADA: "bg-green-900/50 text-green-400 border-green-500/30",
    RECUSADA: "bg-red-900/50 text-red-400 border-red-500/30",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Envie seu Sonho</h1>
      <p className="text-zinc-400 text-sm mb-6">Gerencie as inscrições recebidas através do formulário de sonhos</p>

      {/* Filtros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 space-y-4">
        {/* Filtros por Status */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Status</label>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/admin/inscricoes"
              className={`px-3 py-1.5 rounded-lg text-xs ${!status && !faixa && !necessidade && !estado && !cidade && !periodo ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            >
              Todas ({allInscricoes.length})
            </Link>
            {(["PENDENTE", "ANALISANDO", "APROVADA", "RECUSADA"] as const).map((s) => (
              <Link
                key={s}
                href={`/admin/inscricoes${buildQueryString({ status: s })}`}
                className={`px-3 py-1.5 rounded-lg text-xs border ${status === s ? statusColors[s] : "bg-zinc-800 text-zinc-300 border-transparent hover:bg-zinc-700"}`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()} ({countByStatus[s]})
              </Link>
            ))}
          </div>
        </div>

        {/* Filtros por Faixa de Valor */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Valor do Sonho</label>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/admin/inscricoes${buildQueryString({ faixa: undefined })}`}
              className={`px-3 py-1.5 rounded-lg text-xs ${!faixa ? "bg-zinc-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            >
              Todos
            </Link>
            {Object.entries(faixaValorLabels).map(([key, label]) => (
              <Link
                key={key}
                href={`/admin/inscricoes${buildQueryString({ faixa: key })}`}
                className={`px-3 py-1.5 rounded-lg text-xs ${faixa === key ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Filtros por Tipo de Necessidade */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Tipo de Necessidade</label>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/admin/inscricoes${buildQueryString({ necessidade: undefined })}`}
              className={`px-3 py-1.5 rounded-lg text-xs ${!necessidade ? "bg-zinc-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            >
              Todos
            </Link>
            {Object.entries(necessidadeLabels).map(([key, label]) => (
              <Link
                key={key}
                href={`/admin/inscricoes${buildQueryString({ necessidade: key })}`}
                className={`px-3 py-1.5 rounded-lg text-xs ${necessidade === key ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Filtros por Período */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Período</label>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/admin/inscricoes${buildQueryString({ periodo: undefined })}`}
              className={`px-3 py-1.5 rounded-lg text-xs ${!periodo ? "bg-zinc-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            >
              Todos
            </Link>
            {Object.entries(periodoLabels).map(([key, label]) => (
              <Link
                key={key}
                href={`/admin/inscricoes${buildQueryString({ periodo: key })}`}
                className={`px-3 py-1.5 rounded-lg text-xs ${periodo === key ? "bg-cyan-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Filtros por Estado e Cidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Estado</label>
            <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto">
              <Link
                href={`/admin/inscricoes${buildQueryString({ estado: undefined, cidade: undefined })}`}
                className={`px-3 py-1.5 rounded-lg text-xs ${!estado ? "bg-zinc-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                Todos
              </Link>
              {estados.map((e) => (
                <Link
                  key={e}
                  href={`/admin/inscricoes${buildQueryString({ estado: e, cidade: undefined })}`}
                  className={`px-3 py-1.5 rounded-lg text-xs ${estado === e ? "bg-orange-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
                >
                  {e}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Cidade {estado && `(${estado})`}</label>
            <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto">
              <Link
                href={`/admin/inscricoes${buildQueryString({ cidade: undefined })}`}
                className={`px-3 py-1.5 rounded-lg text-xs ${!cidade ? "bg-zinc-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                Todas
              </Link>
              {cidades.map((c) => (
                <Link
                  key={c}
                  href={`/admin/inscricoes${buildQueryString({ cidade: c })}`}
                  className={`px-3 py-1.5 rounded-lg text-xs ${cidade === c ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Limpar filtros */}
        {(status || faixa || necessidade || estado || cidade || periodo) && (
          <div className="pt-2 border-t border-zinc-800">
            <Link
              href="/admin/inscricoes"
              className="text-xs text-red-400 hover:text-red-300"
            >
              Limpar todos os filtros
            </Link>
          </div>
        )}
      </div>

      {/* Filtros ativos */}
      {(status || faixa || necessidade || estado || cidade || periodo) && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-zinc-500">Filtros ativos:</span>
          {status && (
            <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">
              Status: {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
          )}
          {faixa && (
            <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded-full">
              Valor: {faixaValorLabels[faixa]}
            </span>
          )}
          {necessidade && (
            <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded-full">
              Tipo: {necessidadeLabels[necessidade]}
            </span>
          )}
          {periodo && (
            <span className="px-2 py-0.5 bg-cyan-900/30 text-cyan-400 text-xs rounded-full">
              Período: {periodoLabels[periodo]}
            </span>
          )}
          {estado && (
            <span className="px-2 py-0.5 bg-orange-900/30 text-orange-400 text-xs rounded-full">
              Estado: {estado}
            </span>
          )}
          {cidade && (
            <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded-full">
              Cidade: {cidade}
            </span>
          )}
        </div>
      )}

      {/* Contador de resultados */}
      <div className="text-xs text-zinc-500 mb-4">
        {inscricoes.length} inscrição{inscricoes.length !== 1 ? "ões" : ""} encontrada{inscricoes.length !== 1 ? "s" : ""}
      </div>

      {inscricoes.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
          Nenhuma inscrição encontrada com os filtros selecionados
        </div>
      ) : (
        <div className="space-y-4">
          {inscricoes.map((i) => (
            <div key={i.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} className="text-zinc-500" />
                    <h3 className="text-lg font-semibold text-white">{i.nome}</h3>
                    {i.paraQuem === "outra_pessoa" && (
                      <span className="px-2 py-0.5 bg-purple-900/50 text-purple-400 text-xs rounded-full">
                        Para: {i.nomeBeneficiado}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {i.cidade}, {i.estado}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {i.email}
                    </span>
                    {i.telefone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {i.telefone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                    <Calendar size={12} />
                    Enviado em{" "}
                    {new Date(i.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <StatusSelect id={i.id} currentStatus={i.status} />
              </div>

              {/* Badges de informações */}
              <div className="flex flex-wrap gap-2 mb-4">
                {i.faixaValor && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-lg">
                    <DollarSign size={12} />
                    {faixaValorLabels[i.faixaValor] || i.faixaValor}
                  </span>
                )}
                {i.necessidade && i.necessidade.length > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-lg">
                    <Heart size={12} />
                    {i.necessidade.map(n => necessidadeLabels[n] || n).join(", ")}
                  </span>
                )}
                {i.dataRealizacao && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-orange-900/30 text-orange-400 text-xs rounded-lg">
                    <Calendar size={12} />
                    Realizar até: {new Date(i.dataRealizacao).toLocaleDateString("pt-BR")}
                  </span>
                )}
                {i.linkMidiaSocial && (
                  <a
                    href={i.linkMidiaSocial}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded-lg hover:bg-purple-900/50"
                  >
                    <Link2 size={12} />
                    Link de Mídia
                  </a>
                )}
                {i.paraQuem === "outra_pessoa" && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-pink-900/30 text-pink-400 text-xs rounded-lg">
                    <Users size={12} />
                    Para outra pessoa
                  </span>
                )}
              </div>

              {/* Conteúdo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="font-medium text-sm text-zinc-400 mb-2">História / O Sonho</h4>
                  <p className="whitespace-pre-wrap text-white text-sm">{i.historia}</p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="font-medium text-sm text-zinc-400 mb-2">
                    Situação Atual / Por que precisa de ajuda
                  </h4>
                  <p className="whitespace-pre-wrap text-white text-sm">{i.situacao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
