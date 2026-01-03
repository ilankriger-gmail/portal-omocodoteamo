"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteAtualizacaoButton({
  id,
  vaquinhaId,
}: {
  id: string;
  vaquinhaId: string;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Excluir esta atualização?")) return;

    try {
      const res = await fetch(`/api/vaquinhas/${vaquinhaId}/atualizacoes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("Erro ao excluir");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-zinc-500 hover:text-red-500 transition-colors"
    >
      <Trash2 size={16} />
    </button>
  );
}
