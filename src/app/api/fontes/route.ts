import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const fontes = await prisma.fonteRenda.findMany();
  return NextResponse.json(fontes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const fonte = await prisma.fonteRenda.create({
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        percentual: body.percentual ? parseFloat(body.percentual) : null,
      },
    });

    return NextResponse.json(fonte, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro" }, { status: 500 });
  }
}
