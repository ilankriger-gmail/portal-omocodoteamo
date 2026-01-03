import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, GripVertical } from "lucide-react";
import { LinkForm } from "./link-form";
import { DeleteButton } from "./delete-button";

export default async function LinksPage() {
  const links = await prisma.linkSocial.findMany({
    orderBy: { ordem: "asc" },
  });

  return (
    <div>
      <Link
        href="/admin/config"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4"
      >
        <ArrowLeft size={20} />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold mb-6">Links Sociais</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Links Cadastrados</h2>

          {links.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-400">
              Nenhum link cadastrado
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
              {links.map((link) => (
                <div key={link.id} className="p-4 flex items-center gap-4">
                  <GripVertical className="text-zinc-500" size={20} />
                  <div className="flex-1">
                    <p className="font-medium text-white">{link.nome}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      className="text-sm text-red-500 hover:underline"
                    >
                      {link.url}
                    </a>
                  </div>
                  <DeleteButton id={link.id} type="links" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Adicionar Link</h2>
          <LinkForm />
        </div>
      </div>
    </div>
  );
}
