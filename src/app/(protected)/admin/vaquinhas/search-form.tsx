"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const currentStatus = searchParams.get("status");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (currentStatus) params.set("status", currentStatus);
    // Reset to page 1 when searching
    params.set("page", "1");

    router.push(`/admin/vaquinhas?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery("");

    const params = new URLSearchParams();
    if (currentStatus) params.set("status", currentStatus);
    // Reset to page 1 when clearing search
    params.set("page", "1");

    router.push(`/admin/vaquinhas?${params.toString()}`);
  };

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar vaquinhas..."
        className="w-full px-4 py-2 pl-10 pr-10 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
        aria-label="Buscar vaquinhas"
      />
      <Search
        size={16}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Limpar busca"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}