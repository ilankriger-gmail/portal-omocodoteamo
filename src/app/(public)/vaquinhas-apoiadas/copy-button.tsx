"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  text: string;
}

export function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1 rounded transition-colors flex-shrink-0 ${
        copied
          ? "bg-green-600"
          : "bg-green-500 hover:bg-green-400"
      }`}
      title="Copiar PIX"
    >
      {copied ? (
        <Check size={12} className="text-white" />
      ) : (
        <Copy size={12} className="text-white" />
      )}
    </button>
  );
}
