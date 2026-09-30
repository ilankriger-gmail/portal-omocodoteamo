"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { DropzoneUploadSingle } from "@/components/admin/dropzone-upload-single";
import { PLATAFORMAS, type Plataforma } from "@/lib/agregador/icons";
import type { AgregadorAdmin } from "@/lib/agregador/admin";

type LinkItem = AgregadorAdmin["links"][number] & { _k: number };
type RedeItem = AgregadorAdmin["redes"][number] & { _k: number };

const LIMITE_LINKS_RECOMENDADO = 7;
const LIMITE_BIO_RECOMENDADO = 160;

let chave = 0;
const comChave = <T,>(itens: T[]) => itens.map((i) => ({ ...i, _k: ++chave }));

function mover<T>(lista: T[], de: number, para: number): T[] {
  if (para < 0 || para >= lista.length) return lista;
  const nova = [...lista];
  const [item] = nova.splice(de, 1);
  nova.splice(para, 0, item);
  return nova;
}

const inputCls =
  "w-full px-3 py-2.5 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base md:text-sm";

function IconeBotao({
  onClick,
  label,
  children,
  ativo,
  perigo,
  disabled,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  ativo?: boolean;
  perigo?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        perigo
          ? "border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-800"
          : ativo
          ? "border-amber-500/60 bg-amber-500/15 text-amber-400"
          : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
      }`}
    >
      {children}
    </button>
  );
}

export function AgregadorEditor({ inicial }: { inicial: AgregadorAdmin }) {
  const [perfil, setPerfil] = useState(inicial.perfil);
  const [links, setLinks] = useState<LinkItem[]>(() => comChave(inicial.links));
  const [redes, setRedes] = useState<RedeItem[]>(() => comChave(inicial.redes));
  const [alterado, setAlterado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  // Avisa antes de sair da página com alterações não publicadas
  useEffect(() => {
    if (!alterado) return;
    const aviso = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [alterado]);

  const marcar = () => {
    setAlterado(true);
    setMensagem(null);
  };

  const atualizarLink = (i: number, dados: Partial<LinkItem>) => {
    setLinks((l) => l.map((item, idx) => (idx === i ? { ...item, ...dados } : item)));
    marcar();
  };

  const atualizarRede = (i: number, dados: Partial<RedeItem>) => {
    setRedes((r) => r.map((item, idx) => (idx === i ? { ...item, ...dados } : item)));
    marcar();
  };

  const publicar = async () => {
    setSalvando(true);
    setMensagem(null);
    try {
      const res = await fetch("/api/agregador", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perfil,
          links: links.map(({ _k, ...l }) => l),
          redes: redes.map(({ _k, ...r }) => r),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMensagem({ tipo: "erro", texto: data.message || "Erro ao publicar" });
        return;
      }
      setAlterado(false);
      setMensagem({ tipo: "ok", texto: "Publicado! A página pública atualiza em até 1 minuto." });
    } catch {
      setMensagem({ tipo: "erro", texto: "Sem conexão. Tente de novo." });
    } finally {
      setSalvando(false);
    }
  };

  const ativos = links.filter((l) => l.ativo).length;
  const destaques = links.filter((l) => l.ativo && l.destaque).length;

  return (
    <div className="max-w-3xl pb-28">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Agregador de Links</h1>
          <p className="text-zinc-400 text-sm mt-1">links.omocodoteamo.com.br</p>
        </div>
        <a
          href="/links"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-700 text-sm hover:border-zinc-500"
        >
          <ExternalLink size={16} /> Ver página
        </a>
      </div>

      {/* Perfil */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Perfil</h2>
        <div className="grid md:grid-cols-[180px_1fr] gap-5">
          <div>
            <p className="text-sm font-medium mb-2">Foto</p>
            <DropzoneUploadSingle
              initialImage={perfil.avatarUrl}
              onImageChange={(url) => {
                setPerfil((p) => ({ ...p, avatarUrl: url }));
                marcar();
              }}
              onUploadStart={() => setEnviandoFoto(true)}
              onUploadComplete={() => setEnviandoFoto(false)}
            />
            <p className="text-xs text-zinc-500 mt-2">Quadrada, rosto centralizado.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="ag-nome" className="block text-sm font-medium mb-1">Nome</label>
              <input
                id="ag-nome"
                className={inputCls}
                value={perfil.nome}
                maxLength={80}
                onChange={(e) => {
                  setPerfil({ ...perfil, nome: e.target.value });
                  marcar();
                }}
              />
            </div>
            <div>
              <label htmlFor="ag-bio" className="block text-sm font-medium mb-1">Mini bio</label>
              <textarea
                id="ag-bio"
                rows={3}
                className={inputCls}
                value={perfil.bio}
                maxLength={300}
                placeholder="Uma ou duas frases sobre você"
                onChange={(e) => {
                  setPerfil({ ...perfil, bio: e.target.value });
                  marcar();
                }}
              />
              <p
                className={`text-xs mt-1 ${
                  perfil.bio.length > LIMITE_BIO_RECOMENDADO ? "text-amber-400" : "text-zinc-500"
                }`}
              >
                {perfil.bio.length}/{LIMITE_BIO_RECOMENDADO} recomendados — curta lê melhor no celular
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="font-semibold text-lg">Links</h2>
          <button
            type="button"
            onClick={() => {
              setLinks((l) => [
                { titulo: "", url: "https://", destaque: false, ativo: true, _k: ++chave },
                ...l,
              ]);
              marcar();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>
        <p className={`text-xs mb-4 ${ativos > LIMITE_LINKS_RECOMENDADO || destaques > 1 ? "text-amber-400" : "text-zinc-500"}`}>
          {ativos} ativo{ativos === 1 ? "" : "s"} · {destaques} em destaque. Ideal: até {LIMITE_LINKS_RECOMENDADO} links
          e só 1 destaque (<Star size={11} className="inline -mt-0.5" />) — menos opções, mais cliques.
        </p>

        {links.length === 0 && (
          <p className="text-zinc-500 text-sm py-6 text-center">Nenhum link ainda.</p>
        )}

        <ul className="space-y-3">
          {links.map((link, i) => (
            <li
              key={link._k}
              className={`rounded-lg border p-3 ${
                link.destaque && link.ativo ? "border-amber-500/40 bg-amber-500/5" : "border-zinc-800 bg-black/40"
              } ${link.ativo ? "" : "opacity-60"}`}
            >
              <div className="grid gap-2">
                <input
                  className={inputCls}
                  value={link.titulo}
                  maxLength={100}
                  placeholder="Título do botão (ex: Vaquinha da Dona Maria)"
                  aria-label="Título"
                  onChange={(e) => atualizarLink(i, { titulo: e.target.value })}
                />
                <input
                  className={`${inputCls} font-mono text-sm`}
                  value={link.url}
                  type="url"
                  inputMode="url"
                  autoCapitalize="off"
                  autoCorrect="off"
                  placeholder="https://..."
                  aria-label="Endereço"
                  onChange={(e) => atualizarLink(i, { url: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <IconeBotao
                  label={link.destaque ? "Remover destaque" : "Destacar"}
                  ativo={link.destaque}
                  onClick={() => atualizarLink(i, { destaque: !link.destaque })}
                >
                  <Star size={18} fill={link.destaque ? "currentColor" : "none"} />
                </IconeBotao>
                <IconeBotao
                  label={link.ativo ? "Ocultar" : "Mostrar"}
                  onClick={() => atualizarLink(i, { ativo: !link.ativo })}
                >
                  {link.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
                </IconeBotao>
                <div className="flex-1" />
                <IconeBotao label="Subir" disabled={i === 0} onClick={() => { setLinks((l) => mover(l, i, i - 1)); marcar(); }}>
                  <ArrowUp size={18} />
                </IconeBotao>
                <IconeBotao label="Descer" disabled={i === links.length - 1} onClick={() => { setLinks((l) => mover(l, i, i + 1)); marcar(); }}>
                  <ArrowDown size={18} />
                </IconeBotao>
                <IconeBotao
                  label="Excluir"
                  perigo
                  onClick={() => {
                    if (!confirm(`Excluir "${link.titulo || "link sem título"}"?`)) return;
                    setLinks((l) => l.filter((_, idx) => idx !== i));
                    marcar();
                  }}
                >
                  <Trash2 size={18} />
                </IconeBotao>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Redes sociais */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-lg">Redes sociais</h2>
            <p className="text-xs text-zinc-500">Aparecem como ícones no rodapé.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const usadas = new Set(redes.map((r) => r.plataforma));
              const proxima =
                (Object.keys(PLATAFORMAS) as Plataforma[]).find((p) => !usadas.has(p)) ?? "site";
              setRedes((r) => [...r, { plataforma: proxima, url: "https://", _k: ++chave }]);
              marcar();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>

        {redes.length === 0 && (
          <p className="text-zinc-500 text-sm py-6 text-center">Nenhuma rede ainda.</p>
        )}

        <ul className="space-y-3">
          {redes.map((rede, i) => (
            <li key={rede._k} className="rounded-lg border border-zinc-800 bg-black/40 p-3">
              <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
                <select
                  className={inputCls}
                  value={rede.plataforma}
                  aria-label="Rede"
                  onChange={(e) => atualizarRede(i, { plataforma: e.target.value })}
                >
                  {(Object.keys(PLATAFORMAS) as Plataforma[]).map((p) => (
                    <option key={p} value={p}>
                      {PLATAFORMAS[p].nome}
                    </option>
                  ))}
                </select>
                <input
                  className={`${inputCls} font-mono text-sm`}
                  value={rede.url}
                  type="url"
                  inputMode="url"
                  autoCapitalize="off"
                  autoCorrect="off"
                  placeholder="https://instagram.com/..."
                  aria-label="Endereço"
                  onChange={(e) => atualizarRede(i, { url: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 mt-2 justify-end">
                <IconeBotao label="Mover para a esquerda" disabled={i === 0} onClick={() => { setRedes((r) => mover(r, i, i - 1)); marcar(); }}>
                  <ArrowUp size={18} />
                </IconeBotao>
                <IconeBotao label="Mover para a direita" disabled={i === redes.length - 1} onClick={() => { setRedes((r) => mover(r, i, i + 1)); marcar(); }}>
                  <ArrowDown size={18} />
                </IconeBotao>
                <IconeBotao
                  label="Excluir"
                  perigo
                  onClick={() => {
                    setRedes((r) => r.filter((_, idx) => idx !== i));
                    marcar();
                  }}
                >
                  <Trash2 size={18} />
                </IconeBotao>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Barra de publicar fixa (fica acima da navegação mobile do admin) */}
      <div className="fixed left-0 right-0 bottom-16 md:bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="max-w-3xl mx-auto md:ml-auto px-4 py-3 flex items-center gap-3">
          <p
            className={`flex-1 text-sm ${
              mensagem?.tipo === "erro" ? "text-red-400" : mensagem?.tipo === "ok" ? "text-green-400" : "text-zinc-400"
            }`}
            role="status"
          >
            {mensagem?.texto ?? (alterado ? "Alterações não publicadas" : "Tudo publicado")}
          </p>
          <button
            type="button"
            onClick={publicar}
            disabled={!alterado || salvando || enviandoFoto}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {salvando && <Loader2 size={16} className="animate-spin" />}
            {enviandoFoto ? "Enviando foto..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
