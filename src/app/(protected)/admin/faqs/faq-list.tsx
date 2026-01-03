"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  X,
  Image,
  Youtube,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQ {
  id: string;
  pergunta: string;
  resposta: string;
  imagemUrl: string | null;
  videoUrl: string | null;
  botaoTexto: string | null;
  botaoLink: string | null;
  ordem: number;
  ativo: boolean;
}

interface FAQListProps {
  initialFaqs: FAQ[];
}

export function FAQList({ initialFaqs }: FAQListProps) {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFaq, setNewFaq] = useState({
    pergunta: "",
    resposta: "",
    imagemUrl: "",
    videoUrl: "",
    botaoTexto: "",
    botaoLink: "",
  });
  const [editForm, setEditForm] = useState({
    pergunta: "",
    resposta: "",
    imagemUrl: "",
    videoUrl: "",
    botaoTexto: "",
    botaoLink: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newFaq.pergunta.trim() || !newFaq.resposta.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newFaq,
          imagemUrl: newFaq.imagemUrl || null,
          videoUrl: newFaq.videoUrl || null,
          botaoTexto: newFaq.botaoTexto || null,
          botaoLink: newFaq.botaoLink || null,
        }),
      });

      if (res.ok) {
        setNewFaq({ pergunta: "", resposta: "", imagemUrl: "", videoUrl: "", botaoTexto: "", botaoLink: "" });
        setShowAddForm(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao adicionar FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta: editForm.pergunta,
          resposta: editForm.resposta,
          imagemUrl: editForm.imagemUrl || null,
          videoUrl: editForm.videoUrl || null,
          botaoTexto: editForm.botaoTexto || null,
          botaoLink: editForm.botaoLink || null,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao salvar FAQ");
      }
    } catch (error) {
      console.error("Erro ao editar FAQ:", error);
      alert("Erro ao salvar FAQ. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta FAQ?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao excluir FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    try {
      const res = await fetch(`/api/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativo }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const handleMoveUp = async (id: string, currentOrdem: number) => {
    const currentIndex = faqs.findIndex((f) => f.id === id);
    if (currentIndex <= 0) return;

    const prevFaq = faqs[currentIndex - 1];

    try {
      await Promise.all([
        fetch(`/api/faqs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ordem: prevFaq.ordem }),
        }),
        fetch(`/api/faqs/${prevFaq.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ordem: currentOrdem }),
        }),
      ]);
      router.refresh();
    } catch (error) {
      console.error("Erro ao reordenar:", error);
    }
  };

  const handleMoveDown = async (id: string, currentOrdem: number) => {
    const currentIndex = faqs.findIndex((f) => f.id === id);
    if (currentIndex >= faqs.length - 1) return;

    const nextFaq = faqs[currentIndex + 1];

    try {
      await Promise.all([
        fetch(`/api/faqs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ordem: nextFaq.ordem }),
        }),
        fetch(`/api/faqs/${nextFaq.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ordem: currentOrdem }),
        }),
      ]);
      router.refresh();
    } catch (error) {
      console.error("Erro ao reordenar:", error);
    }
  };

  const startEditing = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditForm({
      pergunta: faq.pergunta,
      resposta: faq.resposta,
      imagemUrl: faq.imagemUrl || "",
      videoUrl: faq.videoUrl || "",
      botaoTexto: faq.botaoTexto || "",
      botaoLink: faq.botaoLink || "",
    });
  };

  return (
    <div className="space-y-4">
      {/* Botão Adicionar */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} className="mb-4">
          <Plus size={16} className="mr-2" />
          Adicionar FAQ
        </Button>
      )}

      {/* Formulário de Adicionar */}
      {showAddForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <h3 className="text-lg font-semibold mb-4">Nova FAQ</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Pergunta</label>
              <input
                type="text"
                value={newFaq.pergunta}
                onChange={(e) => setNewFaq({ ...newFaq, pergunta: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                placeholder="Digite a pergunta..."
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Resposta</label>
              <textarea
                value={newFaq.resposta}
                onChange={(e) => setNewFaq({ ...newFaq, resposta: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none"
                rows={4}
                placeholder="Digite a resposta..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  <Image size={14} className="inline mr-1" />
                  Imagem (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-white"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];

                        // Validar tamanho (máximo 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          alert("Arquivo muito grande. Máximo 5MB.");
                          return;
                        }

                        const formData = new FormData();
                        formData.append("file", file);
                        formData.append("type", "faq");

                        try {
                          const res = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                          });

                          if (res.ok) {
                            const data = await res.json();
                            setNewFaq({ ...newFaq, imagemUrl: data.url });
                          } else {
                            const error = await res.json();
                            alert(error.error || "Erro ao fazer upload da imagem");
                          }
                        } catch (error) {
                          console.error("Erro no upload:", error);
                          alert("Erro ao fazer upload da imagem");
                        }
                      }
                    }}
                  />
                  {newFaq.imagemUrl && (
                    <button
                      type="button"
                      onClick={() => setNewFaq({ ...newFaq, imagemUrl: "" })}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                      title="Remover imagem"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {newFaq.imagemUrl && (
                  <input
                    type="text"
                    value={newFaq.imagemUrl}
                    onChange={(e) => setNewFaq({ ...newFaq, imagemUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mt-2"
                    placeholder="URL da imagem"
                    readOnly
                  />
                )}
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  <Youtube size={14} className="inline mr-1" />
                  Link do YouTube (opcional)
                </label>
                <input
                  type="url"
                  value={newFaq.videoUrl}
                  onChange={(e) => setNewFaq({ ...newFaq, videoUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  <Link2 size={14} className="inline mr-1" />
                  Texto do Botão (opcional)
                </label>
                <input
                  type="text"
                  value={newFaq.botaoTexto}
                  onChange={(e) => setNewFaq({ ...newFaq, botaoTexto: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  placeholder="Saiba mais"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  <Link2 size={14} className="inline mr-1" />
                  Link do Botão (opcional)
                </label>
                <input
                  type="url"
                  value={newFaq.botaoLink}
                  onChange={(e) => setNewFaq({ ...newFaq, botaoLink: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  placeholder="https://..."
                />
              </div>
            </div>
            {newFaq.imagemUrl && (
              <div className="mt-2">
                <img
                  src={newFaq.imagemUrl}
                  alt="Preview"
                  className="max-h-32 rounded-lg object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading}>
                <Save size={16} className="mr-2" />
                Salvar
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setNewFaq({ pergunta: "", resposta: "", imagemUrl: "", videoUrl: "", botaoTexto: "", botaoLink: "" });
                }}
              >
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de FAQs */}
      {faqs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
          Nenhuma FAQ cadastrada. Clique em &quot;Adicionar FAQ&quot; para criar a primeira.
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={`bg-zinc-900 border rounded-xl p-4 ${
                faq.ativo ? "border-zinc-800" : "border-zinc-800 opacity-60"
              }`}
            >
              {editingId === faq.id ? (
                // Modo de edição
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Pergunta</label>
                    <input
                      type="text"
                      value={editForm.pergunta}
                      onChange={(e) =>
                        setEditForm({ ...editForm, pergunta: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Resposta</label>
                    <textarea
                      value={editForm.resposta}
                      onChange={(e) =>
                        setEditForm({ ...editForm, resposta: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">
                        <Image size={14} className="inline mr-1" />
                        Imagem (opcional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-white"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];

                              // Validar tamanho (máximo 5MB)
                              if (file.size > 5 * 1024 * 1024) {
                                alert("Arquivo muito grande. Máximo 5MB.");
                                return;
                              }

                              const formData = new FormData();
                              formData.append("file", file);
                              formData.append("type", "faq");

                              try {
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  body: formData,
                                });

                                if (res.ok) {
                                  const data = await res.json();
                                  setEditForm({ ...editForm, imagemUrl: data.url });
                                } else {
                                  const error = await res.json();
                                  alert(error.error || "Erro ao fazer upload da imagem");
                                }
                              } catch (error) {
                                console.error("Erro no upload:", error);
                                alert("Erro ao fazer upload da imagem");
                              }
                            }
                          }}
                        />
                        {editForm.imagemUrl && (
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, imagemUrl: "" })}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                            title="Remover imagem"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      {editForm.imagemUrl && (
                        <input
                          type="text"
                          value={editForm.imagemUrl}
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mt-2"
                          placeholder="URL da imagem"
                          readOnly
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">
                        <Youtube size={14} className="inline mr-1" />
                        Link do YouTube (opcional)
                      </label>
                      <input
                        type="url"
                        value={editForm.videoUrl}
                        onChange={(e) =>
                          setEditForm({ ...editForm, videoUrl: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">
                        <Link2 size={14} className="inline mr-1" />
                        Texto do Botão (opcional)
                      </label>
                      <input
                        type="text"
                        value={editForm.botaoTexto}
                        onChange={(e) =>
                          setEditForm({ ...editForm, botaoTexto: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        placeholder="Saiba mais"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">
                        <Link2 size={14} className="inline mr-1" />
                        Link do Botão (opcional)
                      </label>
                      <input
                        type="url"
                        value={editForm.botaoLink}
                        onChange={(e) =>
                          setEditForm({ ...editForm, botaoLink: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  {editForm.imagemUrl && (
                    <div className="mt-2">
                      <img
                        src={editForm.imagemUrl}
                        alt="Preview"
                        className="max-h-32 rounded-lg object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(faq.id)} disabled={loading}>
                      <Save size={16} className="mr-2" />
                      Salvar
                    </Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>
                      <X size={16} className="mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                // Modo de visualização
                <div className="flex items-start gap-4">
                  {/* Botões de ordenação */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveUp(faq.id, faq.ordem)}
                      disabled={index === 0}
                      className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(faq.id, faq.ordem)}
                      disabled={index === faqs.length - 1}
                      className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">{faq.pergunta}</h3>
                      {faq.imagemUrl && (
                        <span className="text-blue-400" title="Tem imagem">
                          <Image size={14} />
                        </span>
                      )}
                      {faq.videoUrl && (
                        <span className="text-red-400" title="Tem vídeo">
                          <Youtube size={14} />
                        </span>
                      )}
                      {faq.botaoTexto && faq.botaoLink && (
                        <span className="text-green-400" title="Tem botão">
                          <Link2 size={14} />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{faq.resposta}</p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAtivo(faq.id, faq.ativo)}
                      className={`p-2 rounded-lg ${
                        faq.ativo
                          ? "text-green-400 hover:bg-green-900/30"
                          : "text-zinc-500 hover:bg-zinc-800"
                      }`}
                      title={faq.ativo ? "Desativar" : "Ativar"}
                    >
                      {faq.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => startEditing(faq)}
                      className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
