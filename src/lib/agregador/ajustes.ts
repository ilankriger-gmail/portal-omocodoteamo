import { prisma } from "@/lib/prisma";
import { garantirTabelas, sugestaoInicial } from "./inicial";

// Ajustes pontuais no conteúdo do agregador, aplicados pelo deploy em vez do admin.
// Cada ajuste roda UMA única vez (fica registrado em "AgregadorAjuste"), então o que
// for editado depois no admin nunca é desfeito por aqui.

const VAKINHA_URL = "https://www.vakinha.com.br/6462817";
const VAKINHA_TITULO_PROVISORIO = "Ajude nessa Vakinha 💛";
const VAKINHA_TITULO = "Vamos mudar a vida do Anderson e da sua família";

const AJUSTES: { id: string; aplicar: (tx: Tx) => Promise<void> }[] = [
  {
    // Oculta (sem apagar) os links do iBest e coloca a Vakinha no topo.
    id: "2026-11-ocultar-ibest-adicionar-vakinha",
    aplicar: async (tx) => {
      // Se nada foi publicado ainda, grava primeiro o que a página já mostra
      // (a sugestão), senão o link novo ficaria invisível.
      if (!(await tx.agregadorPerfil.findFirst({ select: { id: true } }))) {
        const s = await sugestaoInicial();
        await tx.agregadorPerfil.create({
          data: { nome: s.nome, bio: s.bio || null, avatarUrl: s.avatarUrl || null },
        });
        await tx.agregadorLink.createMany({ data: s.links.map((l, ordem) => ({ ...l, ordem })) });
        await tx.agregadorRede.createMany({ data: s.redes.map((r, ordem) => ({ ...r, ordem })) });
      }

      await tx.agregadorLink.updateMany({
        where: {
          OR: [
            { titulo: { contains: "ibest", mode: "insensitive" } },
            { url: { contains: "ibest", mode: "insensitive" } },
          ],
        },
        data: { ativo: false },
      });

      const jaExiste = await tx.agregadorLink.findFirst({
        where: { url: { contains: "vakinha.com.br/6462817" } },
        select: { id: true },
      });
      if (jaExiste) return;

      const [primeiro, outroDestaque] = await Promise.all([
        tx.agregadorLink.findFirst({ orderBy: { ordem: "asc" }, select: { ordem: true } }),
        tx.agregadorLink.findFirst({ where: { ativo: true, destaque: true }, select: { id: true } }),
      ]);
      await tx.agregadorLink.create({
        data: {
          titulo: VAKINHA_TITULO,
          url: VAKINHA_URL,
          // Vira o botão de destaque só se nenhum outro link visível já for
          destaque: !outroDestaque,
          ativo: true,
          ordem: (primeiro?.ordem ?? 0) - 1,
        },
      });
    },
  },
  {
    // A Vakinha entrou com um título provisório; troca pelo nome da campanha.
    // Só mexe se o título ainda for o provisório (não sobrescreve edição do admin).
    id: "2026-11-titulo-vakinha-anderson",
    aplicar: async (tx) => {
      await tx.agregadorLink.updateMany({
        where: { url: { contains: "vakinha.com.br/6462817" }, titulo: VAKINHA_TITULO_PROVISORIO },
        data: { titulo: VAKINHA_TITULO },
      });
    },
  },
];

// Muda a cada ajuste novo. Entra na chave do cache de dados, para o deploy
// começar com cache frio e o ajuste valer já no primeiro acesso.
export const AJUSTES_VERSAO = AJUSTES[AJUSTES.length - 1].id;

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

let ajustesProntos: Promise<void> | null = null;

// Nunca lança erro: se um ajuste falhar, a página segue no ar e ele é
// tentado de novo na próxima chamada.
export function aplicarAjustes(): Promise<void> {
  ajustesProntos ??= (async () => {
    await garantirTabelas();
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AgregadorAjuste" (
      "id" TEXT NOT NULL, "aplicadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AgregadorAjuste_pkey" PRIMARY KEY ("id"))`);

    for (const ajuste of AJUSTES) {
      await prisma.$transaction(async (tx) => {
        // Quem conseguir registrar o ajuste é quem aplica; se outra instância
        // já registrou, não faz nada. Falhou no meio? O registro é desfeito junto.
        const registrado = await tx.$executeRaw`
          INSERT INTO "AgregadorAjuste" ("id") VALUES (${ajuste.id}) ON CONFLICT ("id") DO NOTHING`;
        if (registrado === 1) await ajuste.aplicar(tx);
      });
    }
  })().catch((error) => {
    console.error("[agregador] Falha ao aplicar ajustes:", error);
    ajustesProntos = null;
  });
  return ajustesProntos;
}
