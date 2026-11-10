import { paginaJogoOrgaos } from "@/lib/jogos/orgaos/render";

// Jogo "Por R$ 500 você coloca os órgãos no lugar certo?".
// Fica fora do layout raiz (que consulta o banco) e é gerado no build:
// a Vercel serve o HTML pronto direto do CDN, sem depender de banco nem de função.
export const dynamic = "force-static";

export function GET() {
  return new Response(paginaJogoOrgaos(), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
