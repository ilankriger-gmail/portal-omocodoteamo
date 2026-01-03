"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AtualizarSeguidoresButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    sucesso: boolean;
    mensagem: string;
  } | null>(null);

  const handleAtualizar = async () => {
    setLoading(true);
    setResultado(null);

    try {
      const response = await fetch("/api/admin/atualizar-seguidores", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResultado({
          sucesso: true,
          mensagem: `Atualizado: ${data.sucessos} sucesso, ${data.falhas} falhas`,
        });
        router.refresh();
      } else {
        setResultado({
          sucesso: false,
          mensagem: data.error || "Erro ao atualizar",
        });
      }
    } catch (error) {
      setResultado({
        sucesso: false,
        mensagem: "Erro de conexão",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {resultado && (
        <span
          className={`text-xs ${
            resultado.sucesso ? "text-green-500" : "text-red-500"
          }`}
        >
          {resultado.mensagem}
        </span>
      )}
      <Button variant="secondary" onClick={handleAtualizar} disabled={loading}>
        <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Atualizando..." : "Atualizar Seguidores"}
      </Button>
    </div>
  );
}
