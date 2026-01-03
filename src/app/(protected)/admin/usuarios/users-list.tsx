"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Pencil, Trash2, Plus, X, Save, Eye, EyeOff } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  nome: string | null;
  createdAt: Date;
}

interface UsersListProps {
  users: UserData[];
  currentUserEmail: string;
}

export function UsersList({ users: initialUsers, currentUserEmail }: UsersListProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [newUser, setNewUser] = useState({ email: "", nome: "", password: "" });
  const [editUser, setEditUser] = useState({ email: "", nome: "", password: "" });

  const handleAdd = async () => {
    if (!newUser.email || !newUser.password) {
      setError("Email e senha são obrigatórios");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar usuário");
        return;
      }

      setUsers([data, ...users]);
      setNewUser({ email: "", nome: "", password: "" });
      setIsAdding(false);
      router.refresh();
    } catch {
      setError("Erro ao criar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editUser.email) {
      setError("Email é obrigatório");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editUser.email,
          nome: editUser.nome,
          password: editUser.password || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao atualizar usuário");
        return;
      }

      setUsers(users.map((u) => (u.id === id ? data : u)));
      setEditingId(null);
      setEditUser({ email: "", nome: "", password: "" });
      router.refresh();
    } catch {
      setError("Erro ao atualizar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao excluir usuário");
        return;
      }

      setUsers(users.filter((u) => u.id !== id));
      router.refresh();
    } catch {
      setError("Erro ao excluir usuário");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: UserData) => {
    setEditingId(user.id);
    setEditUser({ email: user.email, nome: user.nome || "", password: "" });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditUser({ email: "", nome: "", password: "" });
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewUser({ email: "", nome: "", password: "" });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Botão Adicionar */}
      {!isAdding && (
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          Adicionar Administrador
        </button>
      )}

      {/* Formulário de Adicionar */}
      {isAdding && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="font-medium mb-4 text-white">Novo Administrador</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Nome</label>
              <input
                type="text"
                value={newUser.nome}
                onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                placeholder="Nome (opcional)"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email *</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Senha *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white pr-10"
                  placeholder="Senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={cancelAdd}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Usuários */}
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            {editingId === user.id ? (
              // Modo de Edição
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Nome</label>
                    <input
                      type="text"
                      value={editUser.nome}
                      onChange={(e) => setEditUser({ ...editUser, nome: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                      placeholder="Nome (opcional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Email *</label>
                    <input
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={editUser.password}
                        onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white pr-10"
                        placeholder="Deixe vazio para manter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user.id)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save size={14} />
                    {loading ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // Modo de Visualização
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-900/50 text-red-500 p-2 rounded-lg">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {user.nome || user.email}
                      {user.email === currentUserEmail && (
                        <span className="ml-2 text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded-full">
                          Você
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                    <p className="text-xs text-zinc-500">
                      Criado em {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(user)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  {user.email !== currentUserEmail && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={loading}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
          Nenhum usuário encontrado
        </div>
      )}
    </div>
  );
}
