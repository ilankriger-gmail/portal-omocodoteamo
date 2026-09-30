import { carregarAgregadorAdmin } from "@/lib/agregador/admin";
import { AgregadorEditor } from "./agregador-editor";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function AgregadorPage() {
  try {
    const dados = await carregarAgregadorAdmin();
    return <AgregadorEditor inicial={dados} />;
  } catch (error) {
    console.error("Erro ao carregar agregador:", error);
    return (
      <div className="max-w-2xl bg-zinc-900 border border-red-900 rounded-xl p-6">
        <h1 className="text-xl font-bold mb-2">Agregador de Links</h1>
        <p className="text-zinc-300">
          Não foi possível carregar os dados. Se for a primeira vez, as tabelas ainda não
          foram criadas no banco: rode <code className="text-amber-400">npm run db:push</code>.
        </p>
      </div>
    );
  }
}
