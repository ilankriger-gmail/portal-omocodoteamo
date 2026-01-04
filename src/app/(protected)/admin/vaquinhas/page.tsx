import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteVaquinhaButton } from "./delete-button";
import { SearchForm } from "./search-form";
import { Pagination } from "./pagination";
import { isValidImageUrl } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function VaquinhasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;
  const ITEMS_PER_PAGE = 20; // Number of items per page for closed vaquinhas

  // Base query with search if provided
  const baseWhereClause: Record<string, unknown> = {};
  if (q) {
    baseWhereClause.OR = [
      { titulo: { contains: q, mode: "insensitive" } },
      { descricao: { contains: q, mode: "insensitive" } },
    ];
  }

  // Separate queries for active and closed vaquinhas
  let vaquinhasAtivas = [];
  let vaquinhasEncerradas = [];
  let totalEncerradas = 0;

  // Get all active vaquinhas (without pagination)
  if (!status || status === "ATIVA") {
    vaquinhasAtivas = await prisma.vaquinha.findMany({
      where: {
        ...baseWhereClause,
        status: "ATIVA",
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { atualizacoes: true } },
      },
    });
  }

  // Get closed vaquinhas with pagination
  if (!status || status === "ENCERRADA") {
    // Get total count for pagination
    totalEncerradas = await prisma.vaquinha.count({
      where: {
        ...baseWhereClause,
        status: "ENCERRADA",
      },
    });

    // Get paginated closed vaquinhas
    vaquinhasEncerradas = await prisma.vaquinha.findMany({
      where: {
        ...baseWhereClause,
        status: "ENCERRADA",
      },
      orderBy: { createdAt: "desc" },
      skip: status === "ENCERRADA" ? (currentPage - 1) * ITEMS_PER_PAGE : 0,
      take: status === "ENCERRADA" ? ITEMS_PER_PAGE : undefined,
      include: {
        _count: { select: { atualizacoes: true } },
      },
    });
  }

  // Combine results based on filter
  const vaquinhas = status === "ATIVA" ? vaquinhasAtivas :
                   status === "ENCERRADA" ? vaquinhasEncerradas :
                   [...vaquinhasAtivas, ...vaquinhasEncerradas];

  // Calculate pagination info
  const totalPages = Math.ceil(totalEncerradas / ITEMS_PER_PAGE);
  const showPagination = status === "ENCERRADA" && totalPages > 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vaquinhas</h1>
        <Link href="/admin/vaquinhas/nova">
          <Button>
            <Plus size={20} className="mr-2" />
            Nova Vaquinha
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex gap-2 flex-wrap">
          <Link
            href={q ? `/admin/vaquinhas?q=${q}` : "/admin/vaquinhas"}
            className={`px-4 py-2 rounded-lg ${
              !status ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300"
            }`}
          >
            Todas
          </Link>
          <Link
            href={q ? `/admin/vaquinhas?status=ATIVA&q=${q}` : "/admin/vaquinhas?status=ATIVA"}
            className={`px-4 py-2 rounded-lg ${
              status === "ATIVA" ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-300"
            }`}
          >
            Ativas
          </Link>
          <Link
            href={q ? `/admin/vaquinhas?status=ENCERRADA&q=${q}` : "/admin/vaquinhas?status=ENCERRADA"}
            className={`px-4 py-2 rounded-lg ${
              status === "ENCERRADA" ? "bg-zinc-600 text-white" : "bg-zinc-800 text-zinc-300"
            }`}
          >
            Encerradas
          </Link>
        </div>

        <div className="flex-1">
          <SearchForm />
        </div>
      </div>

      {vaquinhas.length === 0 ? (
        <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center">
          <p className="text-zinc-300 mb-4">Nenhuma vaquinha encontrada</p>
          <Link href="/admin/vaquinhas/nova">
            <Button className="bg-red-600 hover:bg-red-700 transition-colors">
              Criar primeira vaquinha
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl">
            {status === "ENCERRADA" && (
              <div className="px-6 py-3 bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-700">
                <p className="text-zinc-300 text-sm">
                  Mostrando vaquinhas encerradas {totalEncerradas > 0 ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, totalEncerradas)} de ${totalEncerradas}` : '0'}
                </p>
              </div>
            )}
            <table className="w-full">
              <thead className="bg-zinc-800/80 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase">
                    Vaquinha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase">
                    Atualizações
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {vaquinhas.map((v) => {
                  const progress = Math.min((v.valorAtual / v.meta) * 100, 100);
                  return (
                    <tr key={v.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {isValidImageUrl(v.imagemUrl) && (
                            <img
                              src={v.imagemUrl}
                              alt={v.titulo}
                              className="w-12 h-12 rounded-lg object-cover shadow-md"
                            />
                          )}
                          <div>
                            <p className="font-medium text-white">{v.titulo}</p>
                            <a
                              href={v.linkOriginal}
                              target="_blank"
                              className="text-sm text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 transition-colors"
                            >
                              Link original <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">R$ {v.valorAtual.toLocaleString("pt-BR")}</span>
                            <span className="text-zinc-300">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-3 bg-zinc-800/80 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">
                            Meta: R$ {v.meta.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            v.status === "ATIVA"
                              ? "bg-green-900/50 text-green-400"
                              : "bg-zinc-700/60 text-zinc-300"
                          }`}
                        >
                          {v.status === "ATIVA" ? "Ativa" : "Encerrada"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-red-900/50 text-red-400 px-2 py-1 rounded-full text-sm">
                          {v._count.atualizacoes}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/admin/vaquinhas/${v.id}`}
                          className="text-red-400 hover:text-red-300 hover:underline text-sm transition-colors"
                        >
                          Editar
                        </Link>
                        <Link
                          href={`/admin/vaquinhas/${v.id}/atualizacoes`}
                          className="text-green-400 hover:text-green-300 hover:underline text-sm transition-colors"
                        >
                          Thread
                        </Link>
                        <DeleteVaquinhaButton id={v.id} titulo={v.titulo} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {showPagination && (
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          )}
        </>
      )}
    </div>
  );
}
