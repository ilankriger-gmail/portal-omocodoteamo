"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `/admin/vaquinhas?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Link
        href={currentPage > 1 ? createPageURL(currentPage - 1) : "#"}
        className={`p-2 rounded-lg transition-colors ${
          currentPage > 1
            ? "bg-zinc-800 hover:bg-zinc-700 text-white"
            : "bg-zinc-900 text-zinc-500 cursor-not-allowed"
        }`}
        onClick={(e) => {
          if (currentPage <= 1) e.preventDefault();
        }}
        aria-label="Página anterior"
      >
        <ChevronLeft size={18} />
      </Link>

      <span className="text-zinc-400 text-sm">
        Página {currentPage} de {totalPages}
      </span>

      <Link
        href={currentPage < totalPages ? createPageURL(currentPage + 1) : "#"}
        className={`p-2 rounded-lg transition-colors ${
          currentPage < totalPages
            ? "bg-zinc-800 hover:bg-zinc-700 text-white"
            : "bg-zinc-900 text-zinc-500 cursor-not-allowed"
        }`}
        onClick={(e) => {
          if (currentPage >= totalPages) e.preventDefault();
        }}
        aria-label="Próxima página"
      >
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}