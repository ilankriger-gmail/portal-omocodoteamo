import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusSelect } from "./status-select";
import { LocationFilter } from "./location-filter";
import { User, MapPin, Mail, Phone, Calendar, Heart, DollarSign, Link2, Users, Download, Cake, ChevronLeft, ChevronRight } from "lucide-react";

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
  searchParams: Promise<{
    status?: string;
    faixa?: string;
    necessidade?: string;
    estado?: string;
    cidade?: string;
    periodo?: string;
    page?: string;
    perPage?: string;
  }>;
}) {
  const { status, faixa, necessidade, estado, cidade, periodo, page: pageParam, perPage: perPageParam } = await searchParams;

  // Paginação
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = [10, 20, 50].includes(Number(perPageParam)) ? Number(perPageParam) : 10;
  const skip = (page - 1) * perPage;

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

  // Buscar inscrições com paginação
  const [inscricoes, totalFiltered, allInscricoes] = await Promise.all([
    prisma.inscricao.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
    }),
    prisma.inscricao.count({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    }),
    prisma.inscricao.findMany({
      select: { status: true, estado: true, cidade: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.ceil(totalFiltered / perPage);

  // Extrair estados e cidades únicos
  const estados = [...new Set(allInscricoes.map(i => i.estado))].filter(Boolean).sort();
  const cidades = estado
    ? [...new Set(allInscricoes.filter(i => i.estado === estado).map(i => i.cidade))].filter(Boolean).sort()
    : [...new Set(allInscricoes.map(i => i.cidade))].filter(Boolean).sort();

  // Contadores por status
  const countByStatus = {
    PENDENTE: allInscricoes.filter(i => i.status === "PENDENTE").length,
    ANALISANDO: allInscricoes.filter(i => i.status === "ANALISANDO").length,
    APROVADA: allInscricoes.filter(i => i.status === "APROVADA").length,
    RECUSADA: allInscricoes.filter(i => i.status === "RECUSADA").length,
  };

  // Construir query string para manter filtros
  const buildQueryString = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const allParams = { status, faixa, necessidade, estado, cidade, periodo, page: String(page), perPage: String(perPage), ...newParams };
    Object.entries(allParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
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
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-3xl font-bold">Sonhos Recebidos</h1>
        <a
          href="/api/inscricoes/export"
          download
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-base font-medium rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download size={18} />
          Exportar CSV
        </a>
      </div>
      <p className="text-zinc-400 text-lg mb-6">Gerencie as inscrições recebidas através do formulário de sonhos</p>

      {/* Filtros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6 space-y-4">
        {/* Filtros por Status */}
        <div>
          <label className="block text-base text-zinc-400 mb-2 font-medium">Status</label>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/admin/inscricoes"
              className={`px-4 py-2 rounded-lg text-sm font-medium ${!status && !faixa && !necessidade && !estado && !cidade && !periodo ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            >
              Todas ({allInscricoes.length})
            </Link>
            {(["PENDENTE", "ANALISANDO", "APROVADA", "RECUSADA"] as const).map((s) => (
              <Link
                key={s}
                href={`/admin/inscricoes${buildQueryString({ status: s, page: 1 })}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${status === s ? statusColors[s] : "bg-zinc-800 text-zinc-300 border-transparent hover:bg-zinc-700"}`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()} ({countByStatus[s]})
              </Link>
            ))}
          </div>
        </div>

        {/* Filtros por Faixa de Valor */}
        <div>
          <label className="block text-base text-zinc-400 mb-2 font-medium">Valor do Sonho</label>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/admin/inscricoes${buildQueryString({ faixa: undefined, page: 1 })}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${!faixa ? "bg-zinc-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            >
              Todos
            </Link>
            {Object.entries(faixaValorLabels).map(([key, label]) => (
              <Link
                key={key}
                href={`/admin/inscricoes${buildQueryString({ faixa: key, page: 1 })}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${faixa === key ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Filtros por Tipo de Necessidade */}
        <div>
          <label className="block text-base text-zinc-400 mb-2 font-medium">Tipo de Necessidade</label>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/admin/inscricoes${buildQueryString({ necessidade: undefined, page: 1 })}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${!necessidade ? "bg-zinc-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            >
              Todos
            </Link>
            {Object.entries(necessidadeLabels).map(([key, label]) => (
              <Link
                key={key}
                href={`/admin/inscricoes${buildQueryString({ necessidade: key, page: 1 })}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${necessidade === key ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Filtros por Período */}
        <div>
          <label className="block text-base text-zinc-400 mb-2 font-medium">Período</label>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/admin/inscricoes${buildQueryString({ periodo: undefined, page: 1 })}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${!periodo ? "bg-zinc-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            >
              Todos
            </Link>
            {Object.entries(periodoLabels).map(([key, label]) => (
              <Link
                key={key}
                href={`/admin/inscricoes${buildQueryString({ periodo: key, page: 1 })}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${periodo === key ? "bg-cyan-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Filtros por Estado e Cidade - Dropdown */}
        <LocationFilter
          estados={estados}
          cidades={cidades}
          selectedEstado={estado}
          selectedCidade={cidade}
        />

        {/* Limpar filtros */}
        {(status || faixa || necessidade || estado || cidade || periodo) && (
          <div className="pt-3 border-t border-zinc-800">
            <Link
              href="/admin/inscricoes"
              className="text-sm text-red-400 hover:text-red-300 font-medium"
            >
              Limpar todos os filtros
            </Link>
          </div>
        )}
      </div>

      {/* Filtros ativos */}
      {(status || faixa || necessidade || estado || cidade || periodo) && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-zinc-500">Filtros ativos:</span>
          {status && (
            <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 text-sm rounded-full">
              Status: {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
          )}
          {faixa && (
            <span className="px-3 py-1 bg-green-900/30 text-green-400 text-sm rounded-full">
              Valor: {faixaValorLabels[faixa]}
            </span>
          )}
          {necessidade && (
            <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-sm rounded-full">
              Tipo: {necessidadeLabels[necessidade]}
            </span>
          )}
          {periodo && (
            <span className="px-3 py-1 bg-cyan-900/30 text-cyan-400 text-sm rounded-full">
              Período: {periodoLabels[periodo]}
            </span>
          )}
          {estado && (
            <span className="px-3 py-1 bg-orange-900/30 text-orange-400 text-sm rounded-full">
              Estado: {estado}
            </span>
          )}
          {cidade && (
            <span className="px-3 py-1 bg-purple-900/30 text-purple-400 text-sm rounded-full">
              Cidade: {cidade}
            </span>
          )}
        </div>
      )}

      {/* Paginação Superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-base text-zinc-400">Exibir:</span>
          <div className="flex gap-1">
            {[10, 20, 50].map((n) => (
              <Link
                key={n}
                href={`/admin/inscricoes${buildQueryString({ perPage: n, page: 1 })}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${perPage === n ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                {n}
              </Link>
            ))}
          </div>
          <span className="text-base text-zinc-400">por página</span>
        </div>

        <div className="text-base text-zinc-300">
          Mostrando <span className="font-semibold text-white">{Math.min(skip + 1, totalFiltered)}</span> - <span className="font-semibold text-white">{Math.min(skip + perPage, totalFiltered)}</span> de <span className="font-semibold text-white">{totalFiltered}</span> inscrições
        </div>

        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link
              href={`/admin/inscricoes${buildQueryString({ page: page - 1 })}`}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-1 text-sm font-medium"
            >
              <ChevronLeft size={18} />
              Anterior
            </Link>
          ) : (
            <span className="px-3 py-2 bg-zinc-800/50 text-zinc-600 rounded-lg flex items-center gap-1 text-sm font-medium cursor-not-allowed">
              <ChevronLeft size={18} />
              Anterior
            </span>
          )}

          <span className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium">
            {page} de {totalPages || 1}
          </span>

          {page < totalPages ? (
            <Link
              href={`/admin/inscricoes${buildQueryString({ page: page + 1 })}`}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-1 text-sm font-medium"
            >
              Próximo
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span className="px-3 py-2 bg-zinc-800/50 text-zinc-600 rounded-lg flex items-center gap-1 text-sm font-medium cursor-not-allowed">
              Próximo
              <ChevronRight size={18} />
            </span>
          )}
        </div>
      </div>

      {inscricoes.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400 text-lg">
          Nenhuma inscrição encontrada com os filtros selecionados
        </div>
      ) : (
        <div className="space-y-4">
          {inscricoes.map((i) => (
            <div key={i.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <User size={24} className="text-zinc-500" />
                    <h3 className="text-2xl font-bold text-white">
                      {i.nome || <span className="text-zinc-500 italic">Nome não informado</span>}
                    </h3>
                    {i.paraQuem === "outra_pessoa" && i.nomeBeneficiado && (
                      <span className="px-4 py-1.5 bg-purple-900/50 text-purple-400 text-base font-medium rounded-full">
                        Para: {i.nomeBeneficiado}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-3 text-lg text-zinc-400">
                    <span className="flex items-center gap-2">
                      <MapPin size={18} />
                      {i.cidade && i.estado ? (
                        `${i.cidade}, ${i.estado}`
                      ) : (
                        <span className="text-zinc-500 italic">Local não informado</span>
                      )}
                    </span>
                    {i.email ? (
                      <a
                        href={`mailto:${i.email}`}
                        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                      >
                        <Mail size={18} />
                        {i.email}
                      </a>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Mail size={18} />
                        <span className="text-zinc-500 italic">Email não informado</span>
                      </span>
                    )}
                    {i.telefone && (
                      <a
                        href={`tel:${i.telefone}`}
                        className="flex items-center gap-2 hover:text-green-400 transition-colors"
                      >
                        <Phone size={18} />
                        {i.telefone}
                      </a>
                    )}
                    {i.dataNascimento && (
                      <span className="flex items-center gap-2">
                        <Cake size={18} />
                        {new Date(i.dataNascimento).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-base text-zinc-500">
                    <Calendar size={16} />
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
              <div className="flex flex-wrap gap-3 mb-5">
                {i.faixaValor && (
                  <span className="flex items-center gap-2 px-4 py-2 bg-green-900/30 text-green-400 text-base font-medium rounded-lg">
                    <DollarSign size={18} />
                    {faixaValorLabels[i.faixaValor] || i.faixaValor}
                  </span>
                )}
                {i.necessidade && i.necessidade.length > 0 && (
                  <span className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 text-blue-400 text-base font-medium rounded-lg">
                    <Heart size={18} />
                    {i.necessidade.map(n => necessidadeLabels[n] || n).join(", ")}
                  </span>
                )}
                {i.dataRealizacao && (
                  <span className="flex items-center gap-2 px-4 py-2 bg-orange-900/30 text-orange-400 text-base font-medium rounded-lg">
                    <Calendar size={18} />
                    Realizar até: {new Date(i.dataRealizacao).toLocaleDateString("pt-BR")}
                  </span>
                )}
                {i.linkMidiaSocial && (
                  <a
                    href={i.linkMidiaSocial}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 text-purple-400 text-base font-medium rounded-lg hover:bg-purple-900/50"
                  >
                    <Link2 size={18} />
                    Link de Mídia
                  </a>
                )}
                {i.paraQuem === "outra_pessoa" && (
                  <span className="flex items-center gap-2 px-4 py-2 bg-pink-900/30 text-pink-400 text-base font-medium rounded-lg">
                    <Users size={18} />
                    Para outra pessoa
                  </span>
                )}
              </div>

              {/* Conteúdo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-zinc-800 p-6 rounded-lg">
                  <h4 className="font-semibold text-lg text-zinc-400 mb-3">História / O Sonho</h4>
                  <p className="whitespace-pre-wrap text-white text-lg leading-relaxed">{i.historia || <span className="text-zinc-500 italic">Não informado</span>}</p>
                </div>
                <div className="bg-zinc-800 p-6 rounded-lg">
                  <h4 className="font-semibold text-lg text-zinc-400 mb-3">
                    Situação Atual / Por que precisa de ajuda
                  </h4>
                  <p className="whitespace-pre-wrap text-white text-lg leading-relaxed">{i.situacao || <span className="text-zinc-500 italic">Não informado</span>}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação Inferior */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={`/admin/inscricoes${buildQueryString({ page: page - 1 })}`}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-1 text-base font-medium"
            >
              <ChevronLeft size={20} />
              Anterior
            </Link>
          )}

          <span className="px-5 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg text-base font-medium">
            Página {page} de {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={`/admin/inscricoes${buildQueryString({ page: page + 1 })}`}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-1 text-base font-medium"
            >
              Próximo
              <ChevronRight size={20} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
