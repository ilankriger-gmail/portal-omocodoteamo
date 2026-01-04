import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DebugPage() {
  // Buscar todos os perfis
  const perfis = await prisma.perfilSocial.findMany({
    orderBy: { ordem: "asc" },
    include: {
      redesSociais: {
        orderBy: { ordem: "asc" }
      }
    }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Debug de Dados</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Perfis Sociais Cadastrados</h2>
        <p className="text-zinc-400 mb-4">Total: {perfis.length}</p>

        <div className="space-y-4">
          {perfis.map((perfil) => (
            <div key={perfil.id} className="bg-zinc-800 rounded-lg p-4">
              <h3 className="font-medium">{perfil.nome} (ID: {perfil.id})</h3>
              <p className="text-sm text-zinc-400">Ordem: {perfil.ordem}</p>
              <p className="text-sm text-zinc-400 mb-2">Redes: {perfil.redesSociais.length}</p>

              <div className="bg-black rounded p-3">
                <pre className="text-xs overflow-auto max-h-80 whitespace-pre-wrap break-all">
                  {JSON.stringify(perfil.redesSociais, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Dados Brutos (JSON)</h2>
        <div className="bg-black rounded p-3">
          <pre className="text-xs overflow-auto max-h-80 whitespace-pre-wrap break-all">
            {JSON.stringify(perfis, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}