"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NovoPerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/perfis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (res.ok) {
        router.push("/admin/redes");
        router.refresh();
      } else {
        alert("Erro ao criar perfil");
      }
    } catch {
      alert("Erro ao criar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/redes"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4"
      >
        <ArrowLeft size={20} />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold mb-6">Novo Perfil</h1>

      <form onSubmit={handleSubmit} className="max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <Input
          id="nome"
          label="Nome do Perfil"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: NextlevelDJ, O Moço do Te Amo"
          required
        />

        <Button type="submit" loading={loading}>
          Criar Perfil
        </Button>
      </form>
    </div>
  );
}
