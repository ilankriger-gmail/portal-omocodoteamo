"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function FonteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    percentual: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/fontes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ nome: "", descricao: "", percentual: "" });
        router.refresh();
      } else {
        alert("Erro ao adicionar");
      }
    } catch {
      alert("Erro ao adicionar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
      <Input
        id="nome"
        label="Nome da Fonte"
        value={form.nome}
        onChange={(e) => setForm({ ...form, nome: e.target.value })}
        placeholder="AdSense, Patrocinador X..."
        required
      />

      <Textarea
        id="descricao"
        label="Descrição"
        value={form.descricao}
        onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        placeholder="Como essa fonte de renda funciona..."
        rows={3}
      />

      <Input
        id="percentual"
        label="Percentual (%)"
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={form.percentual}
        onChange={(e) => setForm({ ...form, percentual: e.target.value })}
        placeholder="Ex: 60"
      />

      <Button type="submit" loading={loading} className="w-full">
        Adicionar Fonte
      </Button>
    </form>
  );
}