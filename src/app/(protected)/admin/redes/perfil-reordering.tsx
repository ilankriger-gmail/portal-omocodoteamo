"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import { PerfilCard } from "./perfil-card";

type Perfil = {
  id: string;
  nome: string;
  descricao?: string;
  avatarUrl?: string | null;
  ordem: number;
  redesSociais: any[];
};

export function PerfilReordering({ perfis: initialPerfis }: { perfis: Perfil[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleReorderPerfil = async (perfilId: string, direction: "up" | "down") => {
    const currentIndex = initialPerfis.findIndex((p) => p.id === perfilId);
    if (currentIndex === -1) return;

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === initialPerfis.length - 1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentPerfil = initialPerfis[currentIndex];
    const swapPerfil = initialPerfis[swapIndex];

    setLoading(perfilId);

    try {
      await Promise.all([
        fetch(`/api/perfis/${currentPerfil.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ordem: swapPerfil.ordem }),
        }),
        fetch(`/api/perfis/${swapPerfil.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ordem: currentPerfil.ordem }),
        }),
      ]);

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao reordenar perfis");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
      {initialPerfis.map((perfil, index) => (
        <div key={perfil.id} className="relative group">
          {/* Botões de reordenação visíveis no hover */}
          <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleReorderPerfil(perfil.id, "up")}
              disabled={index === 0 || loading !== null}
              className="p-1.5 bg-zinc-800 rounded-full text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mover para cima"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => handleReorderPerfil(perfil.id, "down")}
              disabled={index === initialPerfis.length - 1 || loading !== null}
              className="p-1.5 bg-zinc-800 rounded-full text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mover para baixo"
            >
              <ChevronDown size={16} />
            </button>
          </div>
          <PerfilCard perfil={perfil} />
        </div>
      ))}
    </div>
  );
}