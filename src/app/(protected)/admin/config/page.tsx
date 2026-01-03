import { prisma } from "@/lib/prisma";
import { ConfigForm } from "./config-form";

async function getConfig() {
  let config = await prisma.config.findFirst();

  if (!config) {
    config = await prisma.config.create({
      data: {
        id: "config-principal",
        biografia: "",
        bannerAtivo: false,
      },
    });
  }

  return config;
}

async function getVaquinhas() {
  return prisma.vaquinha.findMany({
    where: { status: "ATIVA" },
    select: { id: true, titulo: true },
    orderBy: { createdAt: "desc" },
  });
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
