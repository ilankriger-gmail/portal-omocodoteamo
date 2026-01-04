"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Plus, ExternalLink, ChevronUp, ChevronDown, Pencil, X, AlertCircle, Clock, User, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateSocialUrl } from "@/lib/utils";
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaWhatsapp,
  FaXTwitter,
  FaThreads,
  FaTelegram,
} from "react-icons/fa6";

// Ícone customizado do Kwai
const KwaiIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
    <text x="7" y="17" fontSize="12" fontWeight="bold" fill="black">K</text>
  </svg>
);

type RedeSocial = {
  id: string;
  plataforma: string;
  usuario: string;
  url: string;
  seguidores: number | null;
  ordem: number;
  tipo: string;
  seguidoresAtualizadoEm: Date | null;
  erroAtualizacao: string | null;
};

type Perfil = {
  id: string;
  nome: string;
  descricao?: string;
  avatarUrl?: string | null;
  ordem?: number;
  redesSociais: RedeSocial[];
};

const plataformaConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  instagram: { icon: FaInstagram, color: "text-white", bgColor: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500", label: "Instagram" },
  tiktok: { icon: FaTiktok, color: "text-white", bgColor: "bg-zinc-800", label: "TikTok" },
  youtube: { icon: FaYoutube, color: "text-white", bgColor: "bg-red-600", label: "YouTube" },
  facebook: { icon: FaFacebook, color: "text-white", bgColor: "bg-blue-600", label: "Facebook" },
  kwai: { icon: KwaiIcon, color: "text-white", bgColor: "bg-orange-500", label: "Kwai" },
  whatsapp: { icon: FaWhatsapp, color: "text-white", bgColor: "bg-green-600", label: "WhatsApp" },
  x: { icon: FaXTwitter, color: "text-white", bgColor: "bg-black", label: "X (Twitter)" },
  threads: { icon: FaThreads, color: "text-white", bgColor: "bg-zinc-900", label: "Threads" },
  telegram: { icon: FaTelegram, color: "text-white", bgColor: "bg-blue-500", label: "Telegram" },
};

const plataformas = ["instagram", "tiktok", "youtube", "facebook", "kwai", "whatsapp", "x", "threads", "telegram"];

export function PerfilCard({ perfil }: { perfil: Perfil }) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingRede, setEditingRede] = useState<RedeSocial | null>(null);
  const [newRede, setNewRede] = useState({
    plataforma: "instagram",
    usuario: "",
    url: "",
    seguidores: "",
    tipo: "oficial",
  });

  // Preview das URLs geradas
  const [previewUrl, setPreviewUrl] = useState("");
  const [editPreviewUrl, setEditPreviewUrl] = useState("");

  // Atualizar preview URL quando mudar plataforma ou usuário (novo formulário)
  useEffect(() => {
    if (newRede.usuario) {
      setPreviewUrl(generateSocialUrl(newRede.plataforma, newRede.usuario));
    } else {
      setPreviewUrl("");
    }
  }, [newRede.plataforma, newRede.usuario]);

  // Atualizar preview URL quando mudar plataforma ou usuário (edição)
  useEffect(() => {
    if (editingRede?.usuario) {
      setEditPreviewUrl(generateSocialUrl(editingRede.plataforma, editingRede.usuario));
    } else {
      setEditPreviewUrl("");
    }
  }, [editingRede?.plataforma, editingRede?.usuario]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho e tipo
    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo deve ter no máximo 5MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "perfil-social");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro no upload");

      const { url } = await res.json();

      // Atualizar o avatar do perfil via API
      await fetch(`/api/perfis/${perfil.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      });

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Separar redes por tipo
  const redesOficiais = [...perfil.redesSociais]
    .filter((r) => r.tipo === "oficial" || !r.tipo)
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  const redesReserva = [...perfil.redesSociais]
    .filter((r) => r.tipo === "reserva")
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  const handleAddRede = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gerar URL automaticamente
      const generatedUrl = generateSocialUrl(newRede.plataforma, newRede.usuario);

      await fetch("/api/redes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perfilId: perfil.id,
          ...newRede,
          url: generatedUrl, // Usar URL gerada automaticamente
          seguidores: newRede.seguidores ? parseInt(newRede.seguidores) : null,
        }),
      });
      setShowAddForm(false);
      setNewRede({ plataforma: "instagram", usuario: "", url: "", seguidores: "", tipo: "oficial" });
      router.refresh();
    } catch {
      alert("Erro ao adicionar rede");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRede = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRede) return;
    setLoading(true);
    try {
      // Gerar URL automaticamente
      const generatedUrl = generateSocialUrl(editingRede.plataforma, editingRede.usuario);

      await fetch(`/api/redes/${editingRede.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plataforma: editingRede.plataforma,
          usuario: editingRede.usuario,
          url: generatedUrl, // Usar URL gerada automaticamente
          seguidores: editingRede.seguidores,
          tipo: editingRede.tipo,
        }),
      });
      setEditingRede(null);
      router.refresh();
    } catch {
      alert("Erro ao editar rede");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRede = async (redeId: string) => {
    if (!confirm("Remover esta rede social?")) return;
    try {
      await fetch(`/api/redes/${redeId}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Erro ao remover");
    }
  };

  const handleDeletePerfil = async () => {
    if (!confirm(`Remover o perfil "${perfil.nome}" e todas as suas redes?`)) return;
    try {
      await fetch(`/api/perfis/${perfil.id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Erro ao remover");
    }
  };

  const handleReorder = async (redeId: string, direction: "up" | "down", redes: RedeSocial[]) => {
    const currentIndex = redes.findIndex((r) => r.id === redeId);

    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === redes.length - 1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentRede = redes[currentIndex];
    const swapRede = redes[swapIndex];

    try {
      await Promise.all([
        fetch(`/api/redes/${currentRede.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ordem: swapRede.ordem || swapIndex }),
        }),
        fetch(`/api/redes/${swapRede.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ordem: currentRede.ordem || currentIndex }),
        }),
      ]);
      router.refresh();
    } catch {
      alert("Erro ao reordenar");
    }
  };

  const formatSeguidores = (num: number | null) => {
    if (!num) return "-";
    return num.toLocaleString("pt-BR");
  };

  const renderRedeItem = (rede: RedeSocial, index: number, redes: RedeSocial[]) => {
    const config = plataformaConfig[rede.plataforma] || plataformaConfig.instagram;
    const Icon = config.icon;
    const isFirst = index === 0;
    const isLast = index === redes.length - 1;

    return (
      <div
        key={rede.id}
        className="flex items-center justify-between bg-zinc-800 rounded-lg p-3"
      >
        <div className="flex items-center gap-3">
          {/* Botões de reordenação */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => handleReorder(rede.id, "up", redes)}
              disabled={isFirst}
              className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={() => handleReorder(rede.id, "down", redes)}
              disabled={isLast}
              className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500"
            >
              <ChevronDown size={14} />
            </button>
          </div>
          <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white font-medium">{config.label}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                rede.tipo === "reserva"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-green-500/20 text-green-400"
              }`}>
                {rede.tipo === "reserva" ? "Reserva" : "Oficial"}
              </span>
            </div>
            <p className="text-zinc-400 text-sm">{rede.usuario}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-zinc-400 text-sm block">
              {formatSeguidores(rede.seguidores)} seguidores
            </span>
            {rede.erroAtualizacao ? (
              <span className="text-[10px] text-red-400 flex items-center gap-1 justify-end" title={rede.erroAtualizacao}>
                <AlertCircle size={10} /> Erro
              </span>
            ) : rede.seguidoresAtualizadoEm ? (
              <span className="text-[10px] text-zinc-500 flex items-center gap-1 justify-end">
                <Clock size={10} /> {new Date(rede.seguidoresAtualizadoEm).toLocaleDateString("pt-BR")}
              </span>
            ) : null}
          </div>
          <a
            href={rede.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-white"
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={() => setEditingRede(rede)}
            className="text-zinc-500 hover:text-blue-400"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDeleteRede(rede.id)}
            className="text-zinc-500 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Avatar com fallback */}
            <div className={`h-14 w-14 rounded-full flex items-center justify-center overflow-hidden bg-zinc-800 border border-zinc-700 ${uploadingAvatar ? 'opacity-50' : ''}`}>
              {perfil.avatarUrl ? (
                <Image
                  src={perfil.avatarUrl}
                  alt={perfil.nome}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              ) : (
                <User size={24} className="text-zinc-500" />
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Botão de upload escondido sobre o avatar */}
            <input
              type="file"
              id={`avatar-upload-${perfil.id}`}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
            />
            <label
              htmlFor={`avatar-upload-${perfil.id}`}
              className="absolute inset-0 cursor-pointer rounded-full hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
              title="Alterar imagem do perfil"
            >
              <Camera size={16} className="text-white" />
            </label>
          </div>
          <h3 className="text-lg font-semibold text-white">{perfil.nome}</h3>
        </div>
        <button
          onClick={handleDeletePerfil}
          className="text-zinc-500 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Modal de Edição */}
      {editingRede && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Editar Rede Social</h4>
              <button onClick={() => setEditingRede(null)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditRede} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Plataforma</label>
                <select
                  value={editingRede.plataforma}
                  onChange={(e) => setEditingRede({ ...editingRede, plataforma: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white"
                >
                  {plataformas.map((p) => (
                    <option key={p} value={p}>
                      {plataformaConfig[p].label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Usuário"
                value={editingRede.usuario}
                onChange={(e) => setEditingRede({ ...editingRede, usuario: e.target.value })}
                placeholder={editingRede.plataforma === "whatsapp" ? "https://chat.whatsapp.com/..." : "@usuario"}
                required
              />
              {editingRede.plataforma === "whatsapp" && (
                <div className="text-xs text-yellow-500 mt-1">
                  <span className="font-semibold">Atenção:</span> Insira apenas links de grupo do WhatsApp no formato:
                  <span className="block mt-1 text-zinc-400">https://chat.whatsapp.com/AbCdEfGhIjKl...</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-white mb-1">URL (gerada automaticamente)</label>
                <div className="px-3 py-2 bg-black/50 border border-zinc-700 rounded-lg text-zinc-500 text-sm truncate">
                  {editPreviewUrl || 'URL será gerada automaticamente'}
                </div>
              </div>
              <Input
                label="Seguidores"
                type="number"
                value={editingRede.seguidores?.toString() || ""}
                onChange={(e) => setEditingRede({ ...editingRede, seguidores: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Ex: 150000"
              />
              <div>
                <label className="block text-sm font-medium text-white mb-1">Tipo</label>
                <select
                  value={editingRede.tipo || "oficial"}
                  onChange={(e) => setEditingRede({ ...editingRede, tipo: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white"
                >
                  <option value="oficial">Oficial</option>
                  <option value="reserva">Reserva</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" loading={loading}>
                  Salvar
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditingRede(null)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Canais Oficiais */}
      {redesOficiais.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">
            Canais Oficiais
          </h4>
          <div className="space-y-2">
            {redesOficiais.map((rede, index) => renderRedeItem(rede, index, redesOficiais))}
          </div>
        </div>
      )}

      {/* Canais Reserva */}
      {redesReserva.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-2">
            Canais Reserva
          </h4>
          <div className="space-y-2">
            {redesReserva.map((rede, index) => renderRedeItem(rede, index, redesReserva))}
          </div>
        </div>
      )}

      {showAddForm ? (
        <form onSubmit={handleAddRede} className="bg-zinc-800 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Plataforma</label>
              <select
                value={newRede.plataforma}
                onChange={(e) => setNewRede({ ...newRede, plataforma: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white"
              >
                {plataformas.map((p) => (
                  <option key={p} value={p}>
                    {plataformaConfig[p].label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Usuário"
              value={newRede.usuario}
              onChange={(e) => setNewRede({ ...newRede, usuario: e.target.value })}
              placeholder={newRede.plataforma === "whatsapp" ? "https://chat.whatsapp.com/..." : "@usuario"}
              required
            />
            {newRede.plataforma === "whatsapp" && (
              <div className="text-xs text-yellow-500 mt-1">
                <span className="font-semibold">Atenção:</span> Insira apenas links de grupo do WhatsApp no formato:
                <span className="block mt-1 text-zinc-400">https://chat.whatsapp.com/AbCdEfGhIjKl...</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white mb-1">URL (gerada automaticamente)</label>
              <div className="px-3 py-2 bg-black/50 border border-zinc-700 rounded-lg text-zinc-500 text-sm truncate">
                {previewUrl || 'URL será gerada automaticamente'}
              </div>
            </div>
            <Input
              label="Seguidores"
              type="number"
              value={newRede.seguidores}
              onChange={(e) => setNewRede({ ...newRede, seguidores: e.target.value })}
              placeholder="Ex: 150000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Tipo</label>
            <select
              value={newRede.tipo}
              onChange={(e) => setNewRede({ ...newRede, tipo: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white"
            >
              <option value="oficial">Oficial</option>
              <option value="reserva">Reserva</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={loading}>
              Adicionar
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <Plus size={18} />
          Adicionar rede social
        </button>
      )}
    </div>
  );
}
