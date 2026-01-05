"use client";

import { useState } from "react";
import { Pencil, X, Loader2, Save, Youtube, Key } from "lucide-react";

interface VaquinhaApoiada {
  id: string;
  nome: string;
  link: string;
  descricao: string | null;
  videoUrl: string | null;
  chavePix: string | null;
}

interface Props {
  vaquinha: VaquinhaApoiada;
  onUpdate: (data: { id: string; nome: string; link: string; descricao: string; videoUrl: string; chavePix: string }) => Promise<void>;
}

export function EditarVaquinhaForm({ vaquinha, onUpdate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: vaquinha.nome,
    link: vaquinha.link,
    descricao: vaquinha.descricao || "",
    videoUrl: vaquinha.videoUrl || "",
    chavePix: vaquinha.chavePix || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.link) return;

    setLoading(true);
    try {
      await onUpdate({
        id: vaquinha.id,
        ...form,
      });
      setIsOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro ao atualizar vaquinha");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-500 hover:text-blue-500 hover:bg-zinc-800 rounded-lg transition-colors"
        title="Editar"
      >
        <Pencil size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Editar Vaquinha</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Link da vaquinha *
                </label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  required
                  placeholder="https://www.vakinha.com.br/vaquinha/..."
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
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
                  placeholder="Nome da vaquinha"
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
                  rows={3}
                  placeholder="Descrição da vaquinha"
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
              </div>

              {/* Chave PIX */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  <span className="flex items-center gap-2">
                    <Key size={16} className="text-green-500" />
                    Chave PIX (opcional)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.chavePix}
                  onChange={(e) => setForm({ ...form, chavePix: e.target.value })}
                  placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-zinc-500 text-xs mt-1">
                  Se o sistema não encontrar automaticamente, cole a chave PIX aqui
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.nome || !form.link}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
