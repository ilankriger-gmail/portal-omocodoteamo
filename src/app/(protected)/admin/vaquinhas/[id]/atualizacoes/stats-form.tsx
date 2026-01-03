"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface StatsFormProps {
  vaquinhaId: string;
  initialDoacoes: number;
  initialCoracoes: number;
}

export function StatsForm({ vaquinhaId, initialDoacoes, initialCoracoes }: StatsFormProps) {
  const [doacoes, setDoacoes] = useState(initialDoacoes);
  const [coracoes, setCoracoes] = useState(initialCoracoes);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/vaquinhas/${vaquinhaId}/stats`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doacoes,
          coracoes,
        }),
      });

      if (response.ok) {
        alert("Estatísticas atualizadas com sucesso!");
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao atualizar estatísticas");
      }
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error);
      alert("Erro de conexão ao atualizar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold">Estatísticas da Campanha</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Número de Doações
          </label>
          <Input
            type="number"
            min="0"
            value={doacoes}
            onChange={(e) => setDoacoes(parseInt(e.target.value) || 0)}
            className="bg-zinc-800 border-zinc-700"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Número de Corações
          </label>
          <Input
            type="number"
            min="0"
            value={coracoes}
            onChange={(e) => setCoracoes(parseInt(e.target.value) || 0)}
            className="bg-zinc-800 border-zinc-700"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Atualizar Estatísticas"}
      </button>
    </form>
  );
}