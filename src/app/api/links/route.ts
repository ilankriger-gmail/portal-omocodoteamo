import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const links = await prisma.linkSocial.findMany({ orderBy: { ordem: "asc" } });
  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const count = await prisma.linkSocial.count();

    const link = await prisma.linkSocial.create({
      data: {
        nome: body.nome,
        url: body.url,
        icone: body.icone,
        ordem: count,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro" }, { status: 500 });
  }
}
