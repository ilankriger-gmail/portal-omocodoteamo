import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Perfis Sociais a serem atualizados com Telegram
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
        { plataforma: "x", usuario: "nextleveldj", url: "https://x.com/nextleveldj", ordem: 8 },
        { plataforma: "telegram", usuario: "nextleveldj", url: "https://t.me/nextleveldj", ordem: 9 },
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
        { plataforma: "x", usuario: "omocodoteamo", url: "https://x.com/omocodoteamo", ordem: 8 },
        { plataforma: "telegram", usuario: "omocodoteamo", url: "https://t.me/omocodoteamo", ordem: 9 },
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
        { plataforma: "x", usuario: "ongdoteamo", url: "https://x.com/ongdoteamo", ordem: 8 },
        { plataforma: "telegram", usuario: "ongdoteamo", url: "https://t.me/ongdoteamo", ordem: 9 },
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

    // Buscar redes sociais existentes
    const redesExistentes = await prisma.redeSocial.findMany({
      where: { perfilId: perfil.id },
    });

    // Verificar se já existe rede Telegram
    const telegramExistente = redesExistentes.find(
      (rede) => rede.plataforma === "telegram"
    );

    if (telegramExistente) {
      console.log(`- Perfil ${perfilData.nome} já possui Telegram`);
    } else {
      // Adicionar apenas a rede Telegram
      const telegramRede = perfilData.redes.find(
        (rede) => rede.plataforma === "telegram"
      );

      if (telegramRede) {
        const redeId = `${perfilData.id}-${telegramRede.plataforma}`;
        await prisma.redeSocial.create({
          data: {
            id: redeId,
            perfilId: perfil.id,
            plataforma: telegramRede.plataforma,
            usuario: telegramRede.usuario,
            url: telegramRede.url,
            seguidores: null,
            ordem: telegramRede.ordem,
          },
        });
        console.log(`- Rede social Telegram criada para ${perfilData.nome}`);
      }
    }

    console.log(`✅ Perfil ${perfilData.nome} atualizado com sucesso\n`);
  }

  console.log("Atualização do Telegram concluída!");
}

main()
  .catch((e) => {
    console.error("Erro durante a atualização:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });