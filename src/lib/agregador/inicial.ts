import { prisma } from "@/lib/prisma";
import { isPlataforma, type Plataforma } from "./icons";

// Cria as tabelas do agregador se ainda não existirem (só adiciona, nunca
// altera nada do portal). Assim o deploy não depende de rodar db push à mão.
let tabelasProntas: Promise<void> | null = null;

export function garantirTabelas(): Promise<void> {
  tabelasProntas ??= (async () => {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AgregadorPerfil" (
      "id" TEXT NOT NULL, "nome" TEXT NOT NULL, "bio" TEXT, "avatarUrl" TEXT,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "AgregadorPerfil_pkey" PRIMARY KEY ("id"))`);
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AgregadorLink" (
      "id" TEXT NOT NULL, "titulo" TEXT NOT NULL, "url" TEXT NOT NULL,
      "destaque" BOOLEAN NOT NULL DEFAULT false, "ativo" BOOLEAN NOT NULL DEFAULT true,
      "ordem" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "AgregadorLink_pkey" PRIMARY KEY ("id"))`);
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "AgregadorLink_ativo_ordem_idx" ON "AgregadorLink"("ativo", "ordem")`
    );
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AgregadorRede" (
      "id" TEXT NOT NULL, "plataforma" TEXT NOT NULL, "url" TEXT NOT NULL,
      "ordem" INTEGER NOT NULL DEFAULT 0,
      CONSTRAINT "AgregadorRede_pkey" PRIMARY KEY ("id"))`);
  })().catch((error) => {
    tabelasProntas = null; // tenta de novo na próxima chamada
    throw error;
  });
  return tabelasProntas;
}

export const LINKS_PADRAO = [
  { titulo: "Envie seu sonho", url: "https://portal.omocodoteamo.com.br/participar", destaque: true, ativo: true },
  { titulo: "Vaquinhas ativas", url: "https://portal.omocodoteamo.com.br/vaquinhas", destaque: false, ativo: true },
  { titulo: "Portal da Transparência", url: "https://portal.omocodoteamo.com.br", destaque: false, ativo: true },
  { titulo: "Denuncie perfis falsos", url: "https://portal.omocodoteamo.com.br/denunciar", destaque: false, ativo: true },
];

// Enquanto nada foi publicado no admin, usa o que o portal já tem:
// o perfil "O Moço do Te Amo" (foto, descrição e redes oficiais).
export async function sugestaoInicial() {
  const perfis = await prisma.perfilSocial.findMany({
    orderBy: { ordem: "asc" },
    include: { redesSociais: { orderBy: { ordem: "asc" } } },
  });
  const perfil = perfis.find((p) => /te amo/i.test(p.nome) && !/ong/i.test(p.nome)) ?? perfis[0];
  const config = await prisma.config.findFirst({ select: { avatarUrl: true } });

  const avatar = perfil?.avatarUrl || config?.avatarUrl || "";
  const redes = (perfil?.redesSociais ?? [])
    .filter((r) => isPlataforma(r.plataforma) && /^https?:\/\//i.test(r.url) && !/9999999/.test(r.url))
    .map((r) => ({ plataforma: r.plataforma as Plataforma, url: r.url }));

  return {
    nome: perfil?.nome || "O Moço do Te Amo",
    bio: perfil?.descricao || "",
    // Foto relativa (/uploads/...) vira absoluta para funcionar também no subdomínio
    avatarUrl: avatar.startsWith("/") ? `https://portal.omocodoteamo.com.br${avatar}` : avatar,
    links: LINKS_PADRAO,
    redes,
  };
}
