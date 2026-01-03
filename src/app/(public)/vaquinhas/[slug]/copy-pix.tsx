"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyPixButton({ chavePix }: { chavePix: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chavePix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Não foi possível copiar. Copie manualmente.");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
        copied
          ? "bg-green-600 text-white"
          : "bg-green-500 hover:bg-green-400 text-white"
      }`}
    >
      {copied ? (
        <>
          <Check size={18} />
          Copiado!
        </>
      ) : (
        <>
          <Copy size={18} />
          Copiar Chave PIX
        </>
      )}
    </button>
  );
}