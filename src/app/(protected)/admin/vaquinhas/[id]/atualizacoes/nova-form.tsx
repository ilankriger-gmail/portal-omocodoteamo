"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2 } from "lucide-react";

const tipos = [
  { value: "TEXTO", label: "Texto" },
  { value: "FOTO", label: "Foto" },
  { value: "VIDEO", label: "Vídeo (YouTube)" },
  { value: "COMPROVANTE", label: "Comprovante" },
];

export function NovaAtualizacaoForm({ vaquinhaId }: { vaquinhaId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    tipo: "TEXTO",
    conteudo: "",
    imagemUrl: "",
    videoUrl: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload para o servidor
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, imagemUrl: data.url }));
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao fazer upload");
        setPreviewUrl(null);
      }
    } catch {
      alert("Erro ao fazer upload");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, imagemUrl: "" }));
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/vaquinhas/${vaquinhaId}/atualizacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ tipo: "TEXTO", conteudo: "", imagemUrl: "", videoUrl: "" });
        setPreviewUrl(null);
        router.refresh();
      } else {
        alert("Erro ao publicar");
      }
    } catch {
      alert("Erro ao publicar");
    } finally {
      setLoading(false);
    }
  };

  const showImageUpload = form.tipo === "FOTO" || form.tipo === "COMPROVANTE";

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-1">Tipo</label>
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {tipos.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <Textarea
        id="conteudo"
        label="Conteúdo"
        value={form.conteudo}
        onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
        placeholder="Escreva a atualização..."
        required
      />

      {showImageUpload && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {form.tipo === "COMPROVANTE" ? "Comprovante" : "Foto"}
          </label>

          {previewUrl || form.imagemUrl ? (
            <div className="relative inline-block">
              <img
                src={previewUrl || form.imagemUrl}
                alt="Preview"
                className="max-w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500"
              >
                <X size={16} />
              </button>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <Loader2 className="animate-spin text-white" size={32} />
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-zinc-600 transition-colors"
            >
              <Upload className="mx-auto text-zinc-500 mb-2" size={32} />
              <p className="text-zinc-400 text-sm">Clique para selecionar uma imagem</p>
              <p className="text-zinc-600 text-xs mt-1">JPG, PNG, GIF ou WEBP (máx. 5MB)</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {form.tipo === "VIDEO" && (
        <Input
          id="videoUrl"
          label="Link do YouTube"
          type="url"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
        />
      )}

      <Button type="submit" loading={loading} disabled={uploading} className="w-full">
        Publicar Atualização
      </Button>
    </form>
  );
}
