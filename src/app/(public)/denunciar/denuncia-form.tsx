"use client";

import { useState, useRef } from "react";
import { Loader2, CheckCircle, Upload, X, Camera } from "lucide-react";

export function DenunciaForm() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    perfilFalso: "",
    plataforma: "",
    descricao: "",
    imagemUrl: "",
    contato: "",
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

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
        alert("Erro ao fazer upload");
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/denuncias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setEnviado(true);
        setForm({ perfilFalso: "", plataforma: "", descricao: "", imagemUrl: "", contato: "" });
        setPreviewUrl(null);
      } else {
        alert("Erro ao enviar. Tente novamente.");
      }
    } catch {
      alert("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Denúncia Enviada!</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
          Obrigado por nos ajudar.
        </p>
        <button
          onClick={() => setEnviado(false)}
          className="text-blue-400 text-sm hover:underline"
        >
          Enviar outra
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--card-bg)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
          <Camera className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Enviar Denúncia</h3>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Nos ajude a combater golpistas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Perfil Falso */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>@ ou link do perfil falso *</label>
          <input
            type="text"
            value={form.perfilFalso}
            onChange={(e) => setForm({ ...form, perfilFalso: e.target.value })}
            placeholder="Ex: @perfil_falso ou https://instagram.com/perfil_falso"
            required
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--foreground)' }}
          />
        </div>

        {/* Plataforma */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>Plataforma *</label>
          <select
            value={form.plataforma}
            onChange={(e) => setForm({ ...form, plataforma: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 appearance-none cursor-pointer"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--foreground)' }}
          >
            <option value="" style={{ backgroundColor: 'var(--surface)' }}>Selecione...</option>
            <option value="instagram" style={{ backgroundColor: 'var(--surface)' }}>Instagram</option>
            <option value="tiktok" style={{ backgroundColor: 'var(--surface)' }}>TikTok</option>
            <option value="facebook" style={{ backgroundColor: 'var(--surface)' }}>Facebook</option>
            <option value="youtube" style={{ backgroundColor: 'var(--surface)' }}>YouTube</option>
            <option value="kwai" style={{ backgroundColor: 'var(--surface)' }}>Kwai</option>
            <option value="whatsapp" style={{ backgroundColor: 'var(--surface)' }}>WhatsApp</option>
            <option value="telegram" style={{ backgroundColor: 'var(--surface)' }}>Telegram</option>
            <option value="outro" style={{ backgroundColor: 'var(--surface)' }}>Outro</option>
          </select>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>O que aconteceu? *</label>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            placeholder="Descreva como você encontrou o perfil falso e o que ele estava fazendo..."
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--foreground)' }}
          />
        </div>

        {/* Upload de Imagem */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>Print da conversa</label>
          {previewUrl || form.imagemUrl ? (
            <div className="relative inline-block">
              <img
                src={previewUrl || form.imagemUrl}
                alt="Preview"
                className="h-32 rounded-xl object-cover"
                style={{ border: '1px solid var(--border)' }}
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-400 transition-colors"
              >
                <X size={14} />
              </button>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                  <Loader2 className="animate-spin text-white" size={20} />
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 w-full rounded-xl text-sm transition-colors justify-center"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px dashed var(--border)', color: 'var(--muted)' }}
            >
              <Upload size={18} />
              Clique para adicionar print (opcional)
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Contato */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>Seu contato</label>
          <input
            type="text"
            value={form.contato}
            onChange={(e) => setForm({ ...form, contato: e.target.value })}
            placeholder="Email ou telefone para retorno (opcional)"
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--foreground)' }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle size={18} />
              Enviar Denúncia
            </>
          )}
        </button>
      </form>
    </div>
  );
}
