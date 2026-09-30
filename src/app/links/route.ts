import { getAgregadorDados } from "@/lib/agregador/dados";
import { renderAgregador } from "@/lib/agregador/render";

// Roda sob demanda (nunca no build), mas quase toda visita é servida
// direto do CDN da Vercel graças aos headers abaixo — a função só é
// chamada ~1x por minuto por região, não importa o volume de acessos.
export const dynamic = "force-dynamic";

export async function GET() {
  const { dados, degradado } = await getAgregadorDados();

  return new Response(renderAgregador(dados), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Navegador sempre confere com o CDN (edições aparecem rápido)...
      "Cache-Control": "public, max-age=0, must-revalidate",
      // ...e o CDN guarda a página por 60s, servindo a versão anterior por até
      // 1 dia enquanto busca a nova em segundo plano. Se o banco cair, o
      // público continua vendo a última versão boa.
      "CDN-Cache-Control": degradado
        ? "public, max-age=10, stale-while-revalidate=86400"
        : "public, max-age=60, stale-while-revalidate=86400",
      "Vercel-CDN-Cache-Control": degradado
        ? "max-age=10, stale-while-revalidate=86400"
        : "max-age=60, stale-while-revalidate=86400",
    },
  });
}
