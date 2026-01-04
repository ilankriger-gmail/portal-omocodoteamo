import { prisma } from "@/lib/prisma";
import { Heart, Users, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
async function getStats() {
  const [
    vaquinhasAtivas,
    vaquinhasTotal,
    inscricoesPendentes,
    totalArrecadado,
  ] = await Promise.all([
    prisma.vaquinha.count({ where: { status: "ATIVA" } }),
    prisma.vaquinha.count(),
    prisma.inscricao.count({ where: { status: "PENDENTE" } }),
    prisma.vaquinha.aggregate({ _sum: { valorAtual: true } }),
  ]);

  return {
    vaquinhasAtivas,
    vaquinhasTotal,
    inscricoesPendentes,
    totalArrecadado: totalArrecadado._sum.valorAtual || 0,
  };
}

async function getRecentVaquinhas() {
  return prisma.vaquinha.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });
}

async function getRecentInscricoes() {
  return prisma.inscricao.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminDashboard() {
  const [stats, vaquinhas, inscricoes] = await Promise.all([
    getStats(),
    getRecentVaquinhas(),
    getRecentInscricoes(),
  ]);

  const cards = [
    {
      label: "Vaquinhas Ativas",
      value: stats.vaquinhasAtivas,
      icon: Heart,
      color: "bg-green-500",
      href: "/admin/vaquinhas?status=ATIVA",
    },
    {
      label: "Total Arrecadado",
      value: `R$ ${stats.totalArrecadado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "bg-blue-500",
      href: "/admin/vaquinhas",
    },
    {
      label: "Inscrições Pendentes",
      value: stats.inscricoesPendentes,
      icon: Users,
      color: "bg-yellow-500",
      href: "/admin/inscricoes?status=PENDENTE",
    },
    {
      label: "Total de Campanhas",
      value: stats.vaquinhasTotal,
      icon: Clock,
      color: "bg-purple-500",
      href: "/admin/vaquinhas",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-lg flex-shrink-0`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-zinc-400 text-sm">{card.label}</p>
                  <p className={`font-bold text-white truncate ${typeof card.value === "string" && card.value.length > 10 ? "text-xl" : "text-2xl"}`}>
                    {card.value}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Vaquinhas Recentes</h2>
            <Link href="/admin/vaquinhas" className="text-red-500 text-sm hover:underline">
              Ver todas
            </Link>
          </div>
          {vaquinhas.length === 0 ? (
            <p className="text-zinc-500">Nenhuma vaquinha cadastrada</p>
          ) : (
            <div className="space-y-3">
              {vaquinhas.map((v) => (
                <Link
                  key={v.id}
                  href={`/admin/vaquinhas/${v.id}`}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700"
                >
                  <div>
                    <p className="font-medium text-white">{v.titulo}</p>
                    <p className="text-sm text-zinc-400">
                      {v.status === "ATIVA" ? "Ativa" : "Encerrada"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-500">
                      R$ {v.valorAtual.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm text-zinc-400">
                      de R$ {v.meta.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Inscrições Recentes</h2>
            <Link href="/admin/inscricoes" className="text-red-500 text-sm hover:underline">
              Ver todas
            </Link>
          </div>
          {inscricoes.length === 0 ? (
            <p className="text-zinc-500">Nenhuma inscrição recebida</p>
          ) : (
            <div className="space-y-3">
              {inscricoes.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white">{i.nome}</p>
                    <p className="text-sm text-zinc-400">
                      {i.cidade}, {i.estado}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      i.status === "PENDENTE"
                        ? "bg-yellow-900/50 text-yellow-400"
                        : i.status === "APROVADA"
                        ? "bg-green-900/50 text-green-400"
                        : i.status === "ANALISANDO"
                        ? "bg-blue-900/50 text-blue-400"
                        : "bg-red-900/50 text-red-400"
                    }`}
                  >
                    {i.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
