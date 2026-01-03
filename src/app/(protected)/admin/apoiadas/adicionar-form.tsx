"use client";

import { useState } from "react";
import { Plus, Loader2, Search, Youtube } from "lucide-react";

interface Props {
  onAdd: (data: { nome: string; link: string; descricao: string; videoUrl: string }) => Promise<void>;
}

export function AdicionarVaquinhaForm({ onAdd }: Props) {
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [form, setForm] = useState({
    link: "",
    nome: "",
    descricao: "",
    videoUrl: "",
  });

  const handleScrape = async () => {
    if (!form.link) {
      alert("Cole o link da vaquinha primeiro");
      return;
    }

    setScraping(true);
    try {
      const res = await fetch("/api/scrape-vakinha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.link }),
      });

      if (res.ok) {
        const data = await res.json();
        setForm({
          ...form,
          nome: data.titulo || form.nome,
          descricao: data.descricao || form.descricao,
        });
      } else {
        alert("Erro ao carregar dados. Verifique o link.");
      }
    } catch {
      alert("Erro ao carregar dados");
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.link) return;

    setLoading(true);
    try {
      await onAdd(form);
      setForm({ link: "", nome: "", descricao: "", videoUrl: "" });
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro ao adicionar vaquinha");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Link com botão de carregar */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Link da vaquinha *
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            required
            placeholder="https://www.vakinha.com.br/vaquinha/..."
            className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="button"
            onClick={handleScrape}
            disabled={scraping || !form.link}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg transition-colors"
          >
            {scraping ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            Carregar
          </button>
        </div>
        <p className="text-zinc-500 text-xs mt-1">
          Cole o link e clique em &quot;Carregar&quot; para puxar os dados automaticamente
        </p>
      </div>

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Nome da vaquinha *
        </label>
        <input
          type="text"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
          placeholder="Nome será preenchido automaticamente"
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Descrição (opcional)
        </label>
        <textarea
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          rows={2}
          placeholder="Descrição será preenchida automaticamente"
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
      </div>

      {/* Vídeo do YouTube */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          <span className="flex items-center gap-2">
            <Youtube size={16} className="text-red-500" />
            Vídeo do YouTube (opcional)
          </span>
        </label>
        <input
          type="url"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          placeholder="https://youtube.com/shorts/... ou https://youtu.be/..."
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <p className="text-zinc-500 text-xs mt-1">
          Cole o link de um vídeo vertical do YouTube para destacar a campanha
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !form.nome || !form.link}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Plus size={18} />
        )}
        Adicionar
      </button>
    </form>
  );
}
