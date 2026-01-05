import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const faixaValorLabels: Record<string, string> = {
  ate_1000: "Até R$ 1.000",
  ate_5000: "Até R$ 5.000",
  ate_10000: "Até R$ 10.000",
  ate_50000: "Até R$ 50.000",
  ate_100000: "Até R$ 100.000",
  mais_100000: "Mais de R$ 100.000",
};

const necessidadeLabels: Record<string, string> = {
  dinheiro: "Dinheiro",
  presenca: "Presença",
  conhecimento: "Conhecimento",
  apoio: "Apoio",
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Não autorizado", { status: 401 });
    }

    const inscricoes = await prisma.inscricao.findMany({
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID",
      "Nome",
      "Email",
      "Telefone",
      "Cidade",
      "Estado",
      "Data Nascimento",
      "Necessidade",
      "Faixa Valor",
      "Para Quem",
      "Nome Beneficiado",
      "Link Mídia Social",
      "Data Realização",
      "História",
      "Situação",
      "Status",
      "Data Criação"
    ];

    const escapeCSV = (value: string | null | undefined): string => {
      if (!value) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = inscricoes.map(i => [
      i.id,
      escapeCSV(i.nome),
      escapeCSV(i.email),
      escapeCSV(i.telefone),
      escapeCSV(i.cidade),
      escapeCSV(i.estado),
      i.dataNascimento ? new Date(i.dataNascimento).toLocaleDateString("pt-BR") : "",
      escapeCSV(i.necessidade?.map(n => necessidadeLabels[n] || n).join("; ") || ""),
      escapeCSV(i.faixaValor ? (faixaValorLabels[i.faixaValor] || i.faixaValor) : ""),
      escapeCSV(i.paraQuem === "outra_pessoa" ? "Outra pessoa" : "Próprio"),
      escapeCSV(i.nomeBeneficiado),
      escapeCSV(i.linkMidiaSocial),
      i.dataRealizacao ? new Date(i.dataRealizacao).toLocaleDateString("pt-BR") : "",
      escapeCSV(i.historia),
      escapeCSV(i.situacao),
      i.status,
      new Date(i.createdAt).toLocaleString("pt-BR"),
    ]);

    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const csv = BOM + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="inscricoes-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar inscrições:", error);
    return new Response("Erro ao exportar inscrições", { status: 500 });
  }
}
