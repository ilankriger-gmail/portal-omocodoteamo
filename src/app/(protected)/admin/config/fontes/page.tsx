import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FonteForm } from "./fonte-form";
import { DeleteButton } from "../links/delete-button";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export default async function FontesPage() {
  const fontes = await prisma.fonteRenda.findMany();

  return (
    <div>
      <Link
        href="/admin/config"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4"
      >
        <ArrowLeft size={20} />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold mb-6">Fontes de Renda</h1>
      <p className="text-zinc-400 mb-6">
        Configure de onde vem o dinheiro usado nos prêmios e doações
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Fontes Cadastradas</h2>

          {fontes.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-400">
              Nenhuma fonte cadastrada
            </div>
          ) : (
            <div className="space-y-3">
              {fontes.map((fonte) => (
                <div
                  key={fonte.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-white">{fonte.nome}</p>
                      {fonte.percentual && (
                        <span className="bg-red-900 text-red-400 px-2 py-0.5 rounded text-sm">
                          {fonte.percentual}%
                        </span>
                      )}
                    </div>
                    {fonte.descricao && (
                      <p className="text-sm text-zinc-400">{fonte.descricao}</p>
                    )}
                  </div>
                  <DeleteButton id={fonte.id} type="fontes" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Adicionar Fonte</h2>
          <FonteForm />
        </div>
      </div>
    </div>
  );
}
