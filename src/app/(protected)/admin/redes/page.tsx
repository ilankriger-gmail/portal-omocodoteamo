import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PerfilCard } from "./perfil-card";

export const dynamic = 'force-dynamic';

export default async function RedesSociaisPage() {
  const perfis = await prisma.perfilSocial.findMany({
    orderBy: { ordem: "asc" },
    include: {
      redesSociais: {
        orderBy: { ordem: "asc" }
      }
    }
  });

  // Buscar todas as redes sociais
  const todasRedes = perfis.flatMap(p => p.redesSociais);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Redes Sociais</h1>
        <div className="flex gap-2">
          <Link href="/admin/redes/novo-perfil">
            <Button>
              <Plus size={20} className="mr-2" />
              Novo Perfil
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-zinc-400 mb-6">
        Gerencie os perfis e suas redes sociais que aparecem na página inicial
      </p>

      {perfis.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-zinc-400 mb-4">Nenhum perfil cadastrado</p>
          <Link href="/admin/redes/novo-perfil">
            <Button>Criar primeiro perfil</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {perfis.map((perfil) => (
            <PerfilCard key={perfil.id} perfil={perfil} />
          ))}
        </div>
      )}
    </div>
  );
}
