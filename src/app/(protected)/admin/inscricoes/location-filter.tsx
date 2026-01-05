"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface LocationFilterProps {
  estados: string[];
  cidades: string[];
  selectedEstado?: string;
  selectedCidade?: string;
}

export function LocationFilter({ estados, cidades, selectedEstado, selectedCidade }: LocationFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildQueryString = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset page when changing filters
    params.set("page", "1");

    const str = params.toString();
    return str ? `?${str}` : "";
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    router.push(`/admin/inscricoes${buildQueryString({ estado: value || undefined, cidade: undefined })}`);
  };

  const handleCidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    router.push(`/admin/inscricoes${buildQueryString({ cidade: value || undefined })}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-base text-zinc-400 mb-2 font-medium">Estado</label>
        <select
          value={selectedEstado || ""}
          onChange={handleEstadoChange}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Todos os estados</option>
          {estados.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-base text-zinc-400 mb-2 font-medium">
          Cidade {selectedEstado && `(${selectedEstado})`}
        </label>
        <select
          value={selectedCidade || ""}
          onChange={handleCidadeChange}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Todas as cidades</option>
          {cidades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
