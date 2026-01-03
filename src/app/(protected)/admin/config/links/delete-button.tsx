"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteButton({ id, type }: { id: string; type: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Excluir este item?")) return;

    try {
      await fetch(`/api/${type}/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Erro ao excluir");
    }
  };

  return (
    <button onClick={handleDelete} className="text-zinc-500 hover:text-red-500">
      <Trash2 size={18} />
    </button>
  );
}
