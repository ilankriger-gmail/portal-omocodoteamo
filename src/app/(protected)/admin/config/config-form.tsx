"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

type Vaquinha = {
  id: string;
  titulo: string;
};

type Config = {
  id: string;
  biografia: string;
  avatarUrl: string | null;
  bannerTexto: string | null;
  bannerLink: string | null;
  bannerImageUrl: string | null;
  bannerAtivo: boolean;
  vaquinhaFixadaId: string | null;
  googleAnalyticsId: string | null;
  googleAdSenseId: string | null;
  adsAtivado: boolean;
};

type Props = {
  config: Config;
  vaquinhas: Vaquinha[];
};

export function ConfigForm({ config, vaquinhas }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    biografia: config.biografia,
    avatarUrl: config.avatarUrl || "",
    bannerTexto: config.bannerTexto || "",
    bannerLink: config.bannerLink || "",
    bannerImageUrl: config.bannerImageUrl || "",
    bannerAtivo: config.bannerAtivo,
    vaquinhaFixadaId: config.vaquinhaFixadaId || "",
    googleAnalyticsId: config.googleAnalyticsId || "",
    googleAdSenseId: config.googleAdSenseId || "",
    adsAtivado: config.adsAtivado || false,
  });

  const handleFileUpload = async (file: File, type: "avatar" | "banner") => {
    const setUploading = type === "avatar" ? setUploadingAvatar : setUploadingBanner;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (type === "avatar") {
          setForm((prev) => ({ ...prev, avatarUrl: data.url }));
        } else {
          setForm((prev) => ({ ...prev, bannerImageUrl: data.url }));
        }
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao fazer upload");
      }
    } catch {
      alert("Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.refresh();
        alert("Configurações salvas!");
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro de conexão ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
      {/* Seção: Perfil */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Perfil</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Avatar</label>
            <div className="flex items-center gap-4">
              {form.avatarUrl ? (
                <div className="relative">
                  <img
                    src={form.avatarUrl}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, avatarUrl: "" })}
                    className="absolute -top-1 -right-1 bg-red-600 rounded-full p-1 hover:bg-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-600 flex items-center justify-center">
                  <Upload size={24} className="text-zinc-500" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "avatar");
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-white disabled:opacity-50"
                >
                  {uploadingAvatar ? "Enviando..." : "Escolher imagem"}
                </button>
                <p className="text-xs text-zinc-500">Formato quadrado, máx 5MB</p>
              </div>
            </div>
          </div>

          <Textarea
            id="biografia"
            label="Biografia"
            value={form.biografia}
            onChange={(e) => setForm({ ...form, biografia: e.target.value })}
            placeholder="Escreva sua biografia..."
            rows={6}
          />
        </div>
      </div>

      {/* Seção: Banner */}
      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Banner da Home</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="bannerAtivo"
              checked={form.bannerAtivo}
              onChange={(e) => setForm({ ...form, bannerAtivo: e.target.checked })}
              className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="bannerAtivo" className="text-white text-sm font-medium">
              Ativar banner na home
            </label>
          </div>

          {/* Upload de imagem do banner */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Imagem do Banner</label>
            {form.bannerImageUrl ? (
              <div className="relative">
                <img
                  src={form.bannerImageUrl}
                  alt="Banner"
                  className="w-full max-w-xl rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, bannerImageUrl: "" })}
                  className="absolute top-2 right-2 bg-red-600 rounded-full p-1 hover:bg-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => bannerInputRef.current?.click()}
                className="w-full max-w-xl h-32 bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500"
              >
                <Upload size={32} className="text-zinc-500 mb-2" />
                <span className="text-zinc-500 text-sm">Clique para enviar</span>
              </div>
            )}
            <input
              type="file"
              ref={bannerInputRef}
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "banner");
              }}
              className="hidden"
            />
            {!form.bannerImageUrl && (
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
                className="mt-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-white disabled:opacity-50"
              >
                {uploadingBanner ? "Enviando..." : "Escolher imagem"}
              </button>
            )}
            <p className="text-xs text-zinc-500 mt-1">Tamanho recomendado: 1200x400px, máx 5MB</p>
          </div>

          <Input
            id="bannerTexto"
            label="Texto do Banner"
            type="text"
            value={form.bannerTexto}
            onChange={(e) => setForm({ ...form, bannerTexto: e.target.value })}
            placeholder="Conheça o meu trabalho"
          />

          <Input
            id="bannerLink"
            label="Link do Banner (opcional)"
            type="url"
            value={form.bannerLink}
            onChange={(e) => setForm({ ...form, bannerLink: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Seção: Campanha Fixada */}
      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Campanha em Destaque</h3>
        <div className="space-y-2">
          <label htmlFor="vaquinhaFixadaId" className="block text-zinc-400 text-sm">
            Fixar uma campanha no destaque
          </label>
          <select
            id="vaquinhaFixadaId"
            value={form.vaquinhaFixadaId}
            onChange={(e) => setForm({ ...form, vaquinhaFixadaId: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Aleatório (nenhuma fixada)</option>
            {vaquinhas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.titulo}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500">
            Se nenhuma campanha for fixada, uma será escolhida aleatoriamente.
          </p>
        </div>
      </div>

      {/* Seção: Google Analytics */}
      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Google Analytics</h3>
        <div className="space-y-2">
          <Input
            id="googleAnalyticsId"
            label="ID do Google Analytics"
            type="text"
            value={form.googleAnalyticsId}
            onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })}
            placeholder="G-XXXXXXXXXX"
          />
          <p className="text-xs text-zinc-500">
            Insira o ID de medição do Google Analytics 4 (formato G-XXXXXXXXXX)
          </p>
        </div>
      </div>

      {/* Seção: Google AdSense */}
      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Google AdSense</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="adsAtivado"
              checked={form.adsAtivado}
              onChange={(e) => setForm({ ...form, adsAtivado: e.target.checked })}
              className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="adsAtivado" className="text-white text-sm font-medium">
              Ativar anúncios no site
            </label>
          </div>

          <Input
            id="googleAdSenseId"
            label="ID do Google AdSense"
            type="text"
            value={form.googleAdSenseId}
            onChange={(e) => setForm({ ...form, googleAdSenseId: e.target.value })}
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
          />
          <p className="text-xs text-zinc-500">
            Insira o ID do Google AdSense (formato ca-pub-XXXXXXXXXXXXXXXX)
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <Button type="submit" loading={loading}>
          Salvar Configurações
        </Button>
      </div>
    </form>
  );
}
