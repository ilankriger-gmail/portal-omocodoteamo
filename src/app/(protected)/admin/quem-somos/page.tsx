import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DollarSign } from "lucide-react";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
async function getFontesCount() {
  const count = await prisma.fonteRenda.count();
  return count;
}

export default async function QuemSomosPage() {
  const fontesCount = await getFontesCount();

  const subPages = [
    {
      href: "/admin/quem-somos/fontes",
      label: "Fontes de Renda",
      count: fontesCount,
      icon: DollarSign,
      description: "De onde vem o dinheiro dos prêmios",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quem Somos</h1>
      <p className="text-zinc-400 mb-6">
        Configurações sobre a página "Quem Somos" do portal
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subPages.map((page) => {
          const Icon = page.icon;
          return (
            <Link
              key={page.href}
              href={page.href}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-800 transition-colors group"
            >
              <div className="flex items-center gap-4 mb-3">
                <span className="p-3 bg-red-500/10 text-red-500 rounded-lg">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-medium text-white group-hover:text-red-400 transition-colors">
                    {page.label}
                  </h3>
                  <p className="text-sm text-zinc-500">{page.description}</p>
                </div>
              </div>

              {page.count !== undefined && (
                <div className="ml-14 bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded inline-block">
                  {page.count} {page.count === 1 ? "item" : "itens"}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}