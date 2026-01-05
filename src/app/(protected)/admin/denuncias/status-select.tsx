"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statuses = [
  { value: "PENDENTE", label: "Pendente", color: "bg-yellow-900/50 text-yellow-400" },
  { value: "ANALISANDO", label: "Analisando", color: "bg-blue-900/50 text-blue-400" },
  { value: "RESOLVIDA", label: "Resolvida", color: "bg-green-900/50 text-green-400" },
  { value: "DESCARTADA", label: "Descartada", color: "bg-zinc-700/50 text-zinc-400" },
];

export function StatusSelect({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await fetch(`/api/denuncias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch {
      alert("Erro ao atualizar status");
    } finally {
      setLoading(false);
    }
  };

  const current = statuses.find((s) => s.value === currentStatus);

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${current?.color} disabled:opacity-50`}
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
