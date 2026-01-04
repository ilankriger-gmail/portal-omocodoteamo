import { prisma } from "@/lib/prisma";
import { Trash2, ExternalLink, HeartHandshake } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AdicionarVaquinhaForm } from "./adicionar-form";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function getVaquinhasApoiadas() {
  return prisma.vaquinhaApoiada.findMany({
    orderBy: { nome: "asc" },
  });
}

async function createVaquinhaApoiada(data: { nome: string; link: string; descricao: string; videoUrl: string }) {
  "use server";

  // Limpar URL (remover UTM e outros parâmetros)
  const cleanLink = data.link.split("?")[0];

  // Verificar se já existe
  const existing = await prisma.vaquinhaApoiada.findFirst({
    where: { link: cleanLink },
  });

  if (existing) {
    throw new Error("Esta vaquinha já foi adicionada");
  }

  await prisma.vaquinhaApoiada.create({
    data: {
      nome: data.nome,
      link: cleanLink,
      descricao: data.descricao || null,
      videoUrl: data.videoUrl || null,
    },
  });

  revalidatePath("/admin/apoiadas");
  revalidatePath("/vaquinhas-apoiadas");
}

async function deleteVaquinhaApoiada(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;

  await prisma.vaquinhaApoiada.delete({
    where: { id },
  });

  revalidatePath("/admin/apoiadas");
  revalidatePath("/vaquinhas-apoiadas");
}

export default async function VaquinhasApoiadasPage() {
  const vaquinhas = await getVaquinhasApoiadas();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Vaquinhas Apoiadas</h1>
          <p className="text-zinc-400 text-sm">Gerencie as vaquinhas que você apoia</p>
        </div>
      </div>

      {/* Formulário para adicionar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <HeartHandshake className="text-red-500" size={20} />
          <h2 className="text-lg font-semibold text-white">Adicionar Vaquinha</h2>
        </div>

        <AdicionarVaquinhaForm onAdd={createVaquinhaApoiada} />
      </div>

      {/* Lista de vaquinhas apoiadas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">
            Vaquinhas ({vaquinhas.length})
          </h2>
        </div>

        {vaquinhas.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            Nenhuma vaquinha apoiada cadastrada
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {vaquinhas.map((vaquinha) => (
              <div
                key={vaquinha.id}
                className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white">{vaquinha.nome}</h3>
                  {vaquinha.descricao && (
                    <p className="text-zinc-400 text-sm truncate">{vaquinha.descricao}</p>
                  )}
                  <a
                    href={vaquinha.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 text-xs hover:underline flex items-center gap-1 mt-1"
                  >
                    <ExternalLink size={12} />
                    {vaquinha.link}
                  </a>
                </div>

                <form action={deleteVaquinhaApoiada}>
                  <input type="hidden" name="id" value={vaquinha.id} />
                  <button
                    type="submit"
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
