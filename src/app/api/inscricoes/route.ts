import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verificar se já existe uma inscrição com este link de vaquinha/mídia social
    if (body.linkMidiaSocial) {
      const linkNormalizado = body.linkMidiaSocial.trim().toLowerCase();

      const inscricaoExistente = await prisma.inscricao.findFirst({
        where: {
          linkMidiaSocial: {
            equals: linkNormalizado,
            mode: "insensitive",
          },
        },
      });

      if (inscricaoExistente) {
        return NextResponse.json(
          { message: "Já existe uma inscrição com esta vaquinha/link cadastrado" },
          { status: 400 }
        );
      }
    }

    const inscricao = await prisma.inscricao.create({
      data: {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone || null,
        cidade: body.cidade,
        estado: body.estado,
        dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
        dataRealizacao: body.dataRealizacao ? new Date(body.dataRealizacao) : null,
        necessidade: body.necessidade ? [body.necessidade] : [],
        historia: body.historia,
        situacao: body.situacao,
        paraQuem: body.paraQuem || null,
        nomeBeneficiado: body.nomeBeneficiado || null,
        linkMidiaSocial: body.linkMidiaSocial || null,
        faixaValor: body.faixaValor || null,
      },
    });

    return NextResponse.json(inscricao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar inscrição:", error);
    return NextResponse.json({ message: "Erro ao criar inscrição" }, { status: 500 });
  }
}
