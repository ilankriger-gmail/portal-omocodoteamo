"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, RefreshCw, Youtube } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { isValidImageUrl } from "@/lib/utils";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
type Vaquinha = {
  id: string;
  titulo: string;
  descricao: string;
  linkOriginal: string;
  chavePix: string;
  imagemUrl: string | null;
  videoUrl: string | null;
  meta: number;
  valorAtual: number;
  status: "ATIVA" | "ENCERRADA";
};

export function EditVaquinhaForm({ vaquinha }: { vaquinha: Vaquinha }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({
    titulo: vaquinha.titulo,
    descricao: vaquinha.descricao,
    linkOriginal: vaquinha.linkOriginal,
    chavePix: vaquinha.chavePix,
    imagemUrl: vaquinha.imagemUrl,  // Already typed as string | null in the Vaquinha type
    videoUrl: vaquinha.videoUrl,    // Already typed as string | null in the Vaquinha type
    meta: vaquinha.meta.toString(),
    valorAtual: vaquinha.valorAtual.toString(),
    status: vaquinha.status,
  });

  const handleSync = async () => {
    setSyncing(true);
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
          meta: data.meta?.toString() || prev.meta,
          valorAtual: data.valorAtual?.toString() || prev.valorAtual,
          chavePix: data.chavePix || prev.chavePix,
        }));
        alert(`Sincronizado!\nMeta: R$ ${data.meta || "N/A"}\nArrecadado: R$ ${data.valorAtual || "N/A"}\nPIX: ${data.chavePix || "N/A"}`);
      } else {
        alert("Não foi possível sincronizar os dados");
      }
    } catch {
      alert("Erro ao sincronizar");
    } finally {
      setSyncing(false);
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
      const res = await fetch(`/api/vaquinhas/${vaquinha.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });

      if (res.ok) {
        router.push("/admin/vaquinhas");
        router.refresh();
      } else {
        alert("Erro ao atualizar");
      }
    } catch {
      alert("Erro ao atualizar");
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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Editar Vaquinha</h1>
        <Link
          href={`/admin/vaquinhas/${vaquinha.id}/atualizacoes`}
          className="text-red-500 hover:underline"
        >
          Ver thread de atualizações
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <Input
          id="linkOriginal"
          label="Link Original"
          type="url"
          value={form.linkOriginal}
          onChange={(e) => setForm({ ...form, linkOriginal: e.target.value })}
          required
        />

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
          label="Chave PIX"
          value={form.chavePix}
          onChange={(e) => setForm({ ...form, chavePix: e.target.value })}
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

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Valor Atual (R$)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={form.valorAtual}
                onChange={(e) => setForm({ ...form, valorAtual: e.target.value })}
                className="flex-1 px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Button type="button" variant="secondary" onClick={handleSync} disabled={syncing}>
                <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>
        </div>

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
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
