import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { AGREGADOR_TAG } from "@/lib/agregador/dados";
import { agregadorSchema, carregarAgregadorAdmin } from "@/lib/agregador/admin";
import { garantirTabelas } from "@/lib/agregador/inicial";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    return NextResponse.json(await carregarAgregadorAdmin());
  } catch (error) {
    console.error("Erro ao carregar agregador:", error);
    return NextResponse.json({ message: "Erro ao carregar dados" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const parsed = agregadorSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { perfil, links, redes } = parsed.data;

  try {
    await garantirTabelas();
    await prisma.$transaction(async (tx) => {
      const existente = await tx.agregadorPerfil.findFirst({ select: { id: true } });
      const dadosPerfil = {
        nome: perfil.nome,
        bio: perfil.bio || null,
        avatarUrl: perfil.avatarUrl || null,
      };
      if (existente) {
        await tx.agregadorPerfil.update({ where: { id: existente.id }, data: dadosPerfil });
      } else {
        await tx.agregadorPerfil.create({ data: dadosPerfil });
      }

      await tx.agregadorLink.deleteMany();
      await tx.agregadorLink.createMany({
        data: links.map((l, ordem) => ({ ...l, ordem })),
      });

      await tx.agregadorRede.deleteMany();
      await tx.agregadorRede.createMany({
        data: redes.map((r, ordem) => ({ ...r, ordem })),
      });
    });

    // Invalida o cache de dados; o CDN pega a versão nova em até ~1 minuto.
    revalidateTag(AGREGADOR_TAG);

    return NextResponse.json(await carregarAgregadorAdmin());
  } catch (error) {
    console.error("Erro ao salvar agregador:", error);
    return NextResponse.json({ message: "Erro ao salvar" }, { status: 500 });
  }
}
