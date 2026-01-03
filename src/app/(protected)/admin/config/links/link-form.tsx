"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const icones = [
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "Twitter/X" },
  { value: "facebook", label: "Facebook" },
  { value: "twitch", label: "Twitch" },
  { value: "link", label: "Outro" },
];

export function LinkForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    url: "",
    icone: "link",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ nome: "", url: "", icone: "link" });
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
        label="Nome"
        value={form.nome}
        onChange={(e) => setForm({ ...form, nome: e.target.value })}
        placeholder="Instagram"
        required
      />

      <Input
        id="url"
        label="URL"
        type="url"
        value={form.url}
        onChange={(e) => setForm({ ...form, url: e.target.value })}
        placeholder="https://instagram.com/..."
        required
      />

      <div>
        <label className="block text-sm font-medium text-white mb-1">Ícone</label>
        <select
          value={form.icone}
          onChange={(e) => setForm({ ...form, icone: e.target.value })}
          className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {icones.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Adicionar Link
      </Button>
    </form>
  );
}
