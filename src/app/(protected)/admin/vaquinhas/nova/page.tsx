"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Loader2, Youtube } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { isValidImageUrl } from "@/lib/utils";

export default function NovaVaquinhaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [form, setForm] = useState({
    linkOriginal: "",
    titulo: "",
    descricao: "",
    imagemUrl: null as string | null,
    videoUrl: null as string | null,
    chavePix: "",
    meta: "",
    valorAtual: "0",
    status: "ATIVA" as "ATIVA" | "ENCERRADA",
  });

  const handleScrape = async () => {
    if (!form.linkOriginal) return;

    setScraping(true);
    try {
      const res = await fetch("/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.linkOriginal }),
      });

      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          titulo: data.titulo || prev.titulo,
          descricao: data.descricao || prev.descricao,
          imagemUrl: data.imagemUrl && data.imagemUrl.trim() !== "" ? data.imagemUrl : prev.imagemUrl,
          videoUrl: data.videoUrl && data.videoUrl.trim() !== "" ? data.videoUrl : prev.videoUrl,
          chavePix: data.chavePix || prev.chavePix,
          meta: data.meta?.toString() || prev.meta,
          valorAtual: data.valorAtual?.toString() || prev.valorAtual,
        }));
        alert(`Dados extraídos!\nMeta: R$ ${data.meta || "N/A"}\nArrecadado: R$ ${data.valorAtual || "N/A"}\nPIX: ${data.chavePix || "N/A"}`);
      } else {
        alert("Não foi possível extrair dados do link");
      }
    } catch {
      alert("Erro ao buscar dados");
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Sanitize form data before sending to API
    const sanitizedData = {
      ...form,
      imagemUrl: form.imagemUrl?.trim() || null,
      videoUrl: form.videoUrl?.trim() || null,
      meta: parseFloat(form.meta) || 0,
      valorAtual: parseFloat(form.valorAtual) || 0,
    };

    try {
      const res = await fetch("/api/vaquinhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });

      if (res.ok) {
        router.push("/admin/vaquinhas");
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.message || "Erro ao criar vaquinha");
      }
    } catch {
      alert("Erro ao criar vaquinha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/vaquinhas"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4"
      >
        <ArrowLeft size={20} />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold mb-6">Nova Vaquinha</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Link da Vakinha.com.br
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={form.linkOriginal}
              onChange={(e) => setForm({ ...form, linkOriginal: e.target.value })}
              placeholder="https://vakinha.com.br/..."
              className="flex-1 px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <Button type="button" onClick={handleScrape} disabled={scraping} variant="secondary">
              {scraping ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              <span className="ml-2">{scraping ? "Buscando..." : "Puxar dados"}</span>
            </Button>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Cole o link e clique em &quot;Puxar dados&quot; para preencher automaticamente
          </p>
        </div>

        <Input
          id="titulo"
          label="Título"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          required
        />

        <Textarea
          id="descricao"
          label="Descrição"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          required
        />

        <Input
          id="imagemUrl"
          label="URL da Imagem"
          type="url"
          value={form.imagemUrl}
          onChange={(e) => setForm({ ...form, imagemUrl: e.target.value })}
        />

        {isValidImageUrl(form.imagemUrl) && (
          <div className="relative w-48 h-32 rounded-lg overflow-hidden">
            <Image
              src={form.imagemUrl}
              alt="Preview"
              fill
              sizes="192px"
              className="object-cover"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-1">
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
            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-sm text-zinc-500 mt-1">
            Cole o link de um vídeo vertical do YouTube para destacar a campanha
          </p>
        </div>

        <Input
          id="chavePix"
          label="Chave PIX para doação"
          value={form.chavePix}
          onChange={(e) => setForm({ ...form, chavePix: e.target.value })}
          placeholder="email@exemplo.com ou CPF"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="meta"
            label="Meta (R$)"
            type="number"
            step="0.01"
            value={form.meta}
            onChange={(e) => setForm({ ...form, meta: e.target.value })}
            required
          />

          <Input
            id="valorAtual"
            label="Valor Atual (R$)"
            type="number"
            step="0.01"
            value={form.valorAtual}
            onChange={(e) => setForm({ ...form, valorAtual: e.target.value })}
          />
        </div>

        {/* Campo de status */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as "ATIVA" | "ENCERRADA" })}
            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ATIVA">Ativa</option>
            <option value="ENCERRADA">Encerrada</option>
          </select>
        </div>

        <div className="pt-4">
          <Button type="submit" loading={loading} className="w-full">
            Criar Vaquinha
          </Button>
        </div>
      </form>
    </div>
  );
}
