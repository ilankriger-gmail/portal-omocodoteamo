import { prisma } from "@/lib/prisma";
import { ConfigForm } from "./config-form";
import { safeDbOperation } from "@/lib/db-fallback";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Valores padrão para fallback
const defaultConfig = {
  id: "config-principal",
  biografia: "",
  avatarUrl: null,
  bannerAtivo: false,
  bannerTexto: null,
  bannerLink: null,
  bannerImageUrl: null,
  vaquinhaFixadaId: null,
  googleAnalyticsId: null,
  googleAdSenseId: null,
  adsAtivado: false,
  bannerPrincipalAtivo: true,
  bannerPrincipalTexto: "CONFIANÇA VEM DA VERDADE",
  bannerPrincipalGradientStart: "#000000",
  bannerPrincipalGradientEnd: "#1a1a2e",
  updatedAt: new Date(),
};

async function getConfig() {
  return safeDbOperation(async () => {
    let config = await prisma.config.findFirst();

    if (!config) {
      // Tentar criar com todos os campos
      try {
        config = await prisma.config.create({
          data: {
            id: "config-principal",
            biografia: "",
            bannerAtivo: false,
            bannerPrincipalAtivo: true,
            bannerPrincipalTexto: "CONFIANÇA VEM DA VERDADE",
            bannerPrincipalGradientStart: "#000000",
            bannerPrincipalGradientEnd: "#1a1a2e",
          },
        });
      } catch {
        // Se falhar (campos novos não existem), criar sem eles
        config = await prisma.config.create({
          data: {
            id: "config-principal",
            biografia: "",
            bannerAtivo: false,
          },
        });
      }
    }

    // Garantir que campos novos tenham valores padrão
    return {
      ...config,
      bannerPrincipalAtivo: config.bannerPrincipalAtivo ?? true,
      bannerPrincipalTexto: config.bannerPrincipalTexto ?? "CONFIANÇA VEM DA VERDADE",
      bannerPrincipalGradientStart: config.bannerPrincipalGradientStart ?? "#000000",
      bannerPrincipalGradientEnd: config.bannerPrincipalGradientEnd ?? "#1a1a2e",
    };
  }, defaultConfig);
}

async function getVaquinhas() {
  return safeDbOperation(async () => {
    return prisma.vaquinha.findMany({
      where: { status: "ATIVA" },
      select: { id: true, titulo: true },
      orderBy: { createdAt: "desc" },
    });
  }, []);
}


export default async function ConfigPage() {
  const [config, vaquinhas] = await Promise.all([
    getConfig(),
    getVaquinhas(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <div className="max-w-2xl">
        <ConfigForm config={config} vaquinhas={vaquinhas} />
      </div>
    </div>
  );
}
