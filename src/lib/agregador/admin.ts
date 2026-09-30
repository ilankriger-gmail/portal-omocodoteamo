import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isPlataforma } from "./icons";

const urlSegura = z
  .string()
  .trim()
  .min(1, "Informe o link")
  .max(2000)
  .refine((v) => /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+\d\s()-]+)$/i.test(v), "Link inválido (use https://...)");

export const agregadorSchema = z.object({
  perfil: z.object({
    nome: z.string().trim().min(1, "Informe o nome").max(80),
    bio: z.string().trim().max(300).nullable().optional(),
    avatarUrl: z.string().trim().max(2000).nullable().optional(),
  }),
  links: z
    .array(
      z.object({
        titulo: z.string().trim().min(1, "Todo link precisa de um título").max(100),
        url: urlSegura,
        destaque: z.boolean(),
        ativo: z.boolean(),
      })
    )
    .max(50),
  redes: z
    .array(
      z.object({
        plataforma: z.string().refine(isPlataforma, "Rede social inválida"),
        url: urlSegura,
      })
    )
    .max(20),
});

export type AgregadorPayload = z.infer<typeof agregadorSchema>;

export async function carregarAgregadorAdmin() {
  const [perfil, links, redes] = await Promise.all([
    prisma.agregadorPerfil.findFirst(),
    prisma.agregadorLink.findMany({ orderBy: { ordem: "asc" } }),
    prisma.agregadorRede.findMany({ orderBy: { ordem: "asc" } }),
  ]);
  return {
    perfil: {
      nome: perfil?.nome ?? "O Moço do Te Amo",
      bio: perfil?.bio ?? "",
      avatarUrl: perfil?.avatarUrl ?? "",
    },
    links: links.map(({ titulo, url, destaque, ativo }) => ({ titulo, url, destaque, ativo })),
    redes: redes.map(({ plataforma, url }) => ({ plataforma, url })),
    atualizadoEm: perfil?.updatedAt ?? null,
  };
}

export type AgregadorAdmin = Awaited<ReturnType<typeof carregarAgregadorAdmin>>;
