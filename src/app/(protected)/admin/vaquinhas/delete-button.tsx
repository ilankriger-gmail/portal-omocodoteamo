"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteVaquinhaButton({ id, titulo }: { id: string; titulo: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir a vaquinha "${titulo}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/vaquinhas/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Erro ao excluir");
      }
    } catch {
      alert("Erro ao excluir");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:underline text-sm disabled:opacity-50"
    >
      {loading ? "..." : "Excluir"}
    </button>
  );
}
