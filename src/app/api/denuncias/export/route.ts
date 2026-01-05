import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Não autorizado", { status: 401 });
    }

    const denuncias = await prisma.denuncia.findMany({
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID",
      "Perfil Falso",
      "Plataforma",
      "Descrição",
      "Contato",
      "Status",
      "Imagem URL",
      "Data Criação"
    ];

    const escapeCSV = (value: string | null | undefined): string => {
      if (!value) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = denuncias.map(d => [
      d.id,
      escapeCSV(d.perfilFalso),
      escapeCSV(d.plataforma),
      escapeCSV(d.descricao),
      escapeCSV(d.contato),
      d.status,
      escapeCSV(d.imagemUrl),
      d.createdAt.toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="denuncias-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar denúncias:", error);
    return new Response("Erro ao exportar denúncias", { status: 500 });
  }
}
