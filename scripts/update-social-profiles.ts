import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Perfis Sociais a serem atualizados
  const perfisSociais = [
    {
      id: "nextleveldj",
      nome: "NextlevelDJ",
      ordem: 1,
      redes: [
        { plataforma: "whatsapp", usuario: "nextleveldj", url: "https://wa.me/5511999999999", ordem: 1 },
        { plataforma: "instagram", usuario: "nextleveldj", url: "https://www.instagram.com/nextleveldj", ordem: 2 },
        { plataforma: "youtube", usuario: "nextleveldj", url: "https://www.youtube.com/@nextleveldj", ordem: 3 },
        { plataforma: "tiktok", usuario: "nextleveldj", url: "https://tiktok.com/@nextleveldj", ordem: 4 },
        { plataforma: "facebook", usuario: "nextleveldj", url: "https://www.facebook.com/nextleveldj", ordem: 5 },
        { plataforma: "threads", usuario: "nextleveldj", url: "https://www.threads.net/@nextleveldj", ordem: 6 },
        { plataforma: "kwai", usuario: "nextleveldj", url: "https://kwai.com/@nextleveldj", ordem: 7 },
      ],
    },
    {
      id: "omocodoteamo",
      nome: "O Moço do Te Amo",
      ordem: 2,
      redes: [
        { plataforma: "whatsapp", usuario: "omocodoteamo", url: "https://wa.me/5511999999999", ordem: 1 },
        { plataforma: "instagram", usuario: "omocodoteamo", url: "https://instagram.com/omocodoteamo", ordem: 2 },
        { plataforma: "youtube", usuario: "omocodoteamo", url: "https://youtube.com/@omocodoteamo", ordem: 3 },
        { plataforma: "tiktok", usuario: "omocodoteamo", url: "https://tiktok.com/@omocodoteamo", ordem: 4 },
        { plataforma: "facebook", usuario: "omocodoteamo", url: "https://facebook.com/omocodoteamo", ordem: 5 },
        { plataforma: "threads", usuario: "omocodoteamo", url: "https://threads.net/@omocodoteamo", ordem: 6 },
        { plataforma: "kwai", usuario: "omocodoteamo", url: "https://kwai.com/@omocodoteamo", ordem: 7 },
      ],
    },
    {
      id: "ongdoteamo",
      nome: "Ong do Te Amo",
      ordem: 3,
      redes: [
        { plataforma: "whatsapp", usuario: "ongdoteamo", url: "https://wa.me/5511999999999", ordem: 1 },
        { plataforma: "instagram", usuario: "ongdoteamo", url: "https://instagram.com/ongdoteamo", ordem: 2 },
        { plataforma: "youtube", usuario: "ongdoteamo", url: "https://youtube.com/@ongdoteamo", ordem: 3 },
        { plataforma: "tiktok", usuario: "ongdoteamo", url: "https://tiktok.com/@ongdoteamo", ordem: 4 },
        { plataforma: "facebook", usuario: "ongdoteamo", url: "https://facebook.com/ongdoteamo", ordem: 5 },
        { plataforma: "threads", usuario: "ongdoteamo", url: "https://threads.net/@ongdoteamo", ordem: 6 },
        { plataforma: "kwai", usuario: "ongdoteamo", url: "https://kwai.com/@ongdoteamo", ordem: 7 },
      ],
    },
  ];

  for (const perfilData of perfisSociais) {
    // Criar ou atualizar o perfil
    console.log(`Processando perfil: ${perfilData.nome}`);

    const perfil = await prisma.perfilSocial.upsert({
      where: { id: perfilData.id },
      update: { nome: perfilData.nome, ordem: perfilData.ordem },
      create: {
        id: perfilData.id,
        nome: perfilData.nome,
        ordem: perfilData.ordem,
      },
    });

    // Deletar redes sociais existentes para o perfil
    await prisma.redeSocial.deleteMany({
      where: { perfilId: perfil.id },
    });
    console.log(`- Redes sociais existentes para ${perfilData.nome} foram removidas`);

    // Criar as novas redes sociais do perfil
    for (const rede of perfilData.redes) {
      const redeId = `${perfilData.id}-${rede.plataforma}`;
      await prisma.redeSocial.create({
        data: {
          id: redeId,
          perfilId: perfil.id,
          plataforma: rede.plataforma,
          usuario: rede.usuario,
          url: rede.url,
          seguidores: null,
          ordem: rede.ordem,
        },
      });
      console.log(`- Rede social criada: ${rede.plataforma} (${rede.usuario})`);
    }

    console.log(`✅ Perfil ${perfilData.nome} atualizado com sucesso\n`);
  }

  console.log("Atualização concluída!");
}

main()
  .catch((e) => {
    console.error("Erro durante a atualização:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });