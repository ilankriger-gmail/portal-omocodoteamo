import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@omocodoteamo.com.br";
  const password = process.env.ADMIN_PASSWORD || "senha123";

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      nome: "Ilan",
    },
  });

  console.log("Usuário admin criado:", user.email);

  // Config inicial com biografia do Ilan
  const biografia = `Sou Ilan, criador de conteúdo e idealizador de projetos que usam a internet para gerar impacto real na vida das pessoas. Meu trabalho nasce da rua, do contato humano, das histórias que normalmente passam despercebidas. Acredito que ajudar, ouvir e agir com verdade transforma mais do que qualquer discurso bonito. Meu propósito é simples e ambicioso ao mesmo tempo, realizar 1 milhão de sonhos, um de cada vez, com respeito e responsabilidade.

Criei este portal da transparência porque acredito que confiança não se pede, se constrói. Aqui você encontra, de forma aberta e acessível, como os recursos entram e para onde vão. Sem atalhos, sem mistério. É exatamente como eu gostaria de ver em qualquer projeto que escolho apoiar ou confiar. Para mim, transparência não é obrigação, é valor.

Se você confia, eu mostro. Sempre.
E se você acompanha, faz parte dessa história também.`;

  const config = await prisma.config.upsert({
    where: { id: "config-principal" },
    update: { biografia },
    create: {
      id: "config-principal",
      biografia,
      avatarUrl: "/uploads/nextleveldj-avatar.jpg",
    },
  });

  console.log("Config criada:", config.id);

  // Perfis Sociais (NextlevelDJ, O Moço do Te Amo, ongdoteamo)
  const perfisSociais = [
    {
      id: "nextleveldj",
      nome: "NextlevelDJ",
      ordem: 1,
      redes: [
        { plataforma: "whatsapp", usuario: "NextlevelDJ", url: "https://wa.me/5511999999999", ordem: 1 },
        { plataforma: "instagram", usuario: "@nextleveldj1", url: "https://www.instagram.com/nextleveldj1", ordem: 2 },
        { plataforma: "youtube", usuario: "@NextLevelDJ1", url: "https://www.youtube.com/@NextLevelDJ1", ordem: 3 },
        { plataforma: "tiktok", usuario: "@nextleveldj1", url: "https://tiktok.com/@nextleveldj1", ordem: 4 },
        { plataforma: "facebook", usuario: "1nextleveldj", url: "https://www.facebook.com/1nextleveldj", ordem: 5 },
        { plataforma: "threads", usuario: "@nextleveldj1", url: "https://www.threads.net/@nextleveldj1", ordem: 6 },
        { plataforma: "kwai", usuario: "@nextleveldj1", url: "https://kwai.com/@nextleveldj1", ordem: 7 },
      ],
    },
    {
      id: "omocodoteamo",
      nome: "O Moço do Te Amo",
      ordem: 2,
      redes: [
        { plataforma: "whatsapp", usuario: "O Moço do Te Amo", url: "https://wa.me/5511999999999", ordem: 1 },
        { plataforma: "instagram", usuario: "@omocodoteamo", url: "https://instagram.com/omocodoteamo", ordem: 2 },
        { plataforma: "youtube", usuario: "@omocodoteamo", url: "https://youtube.com/@omocodoteamo", ordem: 3 },
        { plataforma: "tiktok", usuario: "@omocodoteamo", url: "https://tiktok.com/@omocodoteamo", ordem: 4 },
        { plataforma: "facebook", usuario: "omocodoteamo", url: "https://facebook.com/omocodoteamo", ordem: 5 },
        { plataforma: "threads", usuario: "@omocodoteamo", url: "https://threads.net/@omocodoteamo", ordem: 6 },
        { plataforma: "kwai", usuario: "@omocodoteamo", url: "https://kwai.com/@omocodoteamo", ordem: 7 },
      ],
    },
    {
      id: "ongdoteamo",
      nome: "ongdoteamo",
      ordem: 3,
      redes: [
        { plataforma: "whatsapp", usuario: "ONG do Te Amo", url: "https://wa.me/5511999999999", ordem: 1 },
        { plataforma: "instagram", usuario: "@ongdoteamo", url: "https://instagram.com/ongdoteamo", ordem: 2 },
        { plataforma: "youtube", usuario: "@ongdoteamo", url: "https://youtube.com/@ongdoteamo", ordem: 3 },
        { plataforma: "tiktok", usuario: "@ongdoteamo", url: "https://tiktok.com/@ongdoteamo", ordem: 4 },
        { plataforma: "facebook", usuario: "ongdoteamo", url: "https://facebook.com/ongdoteamo", ordem: 5 },
        { plataforma: "threads", usuario: "@ongdoteamo", url: "https://threads.net/@ongdoteamo", ordem: 6 },
        { plataforma: "kwai", usuario: "@ongdoteamo", url: "https://kwai.com/@ongdoteamo", ordem: 7 },
      ],
    },
  ];

  for (const perfilData of perfisSociais) {
    // Criar ou atualizar o perfil
    const perfil = await prisma.perfilSocial.upsert({
      where: { id: perfilData.id },
      update: { nome: perfilData.nome, ordem: perfilData.ordem },
      create: {
        id: perfilData.id,
        nome: perfilData.nome,
        ordem: perfilData.ordem,
      },
    });

    // Criar as redes sociais do perfil
    for (const rede of perfilData.redes) {
      const redeId = `${perfilData.id}-${rede.plataforma}`;
      await prisma.redeSocial.upsert({
        where: { id: redeId },
        update: {
          plataforma: rede.plataforma,
          usuario: rede.usuario,
          url: rede.url,
          ordem: rede.ordem,
        },
        create: {
          id: redeId,
          perfilId: perfil.id,
          plataforma: rede.plataforma,
          usuario: rede.usuario,
          url: rede.url,
          seguidores: null,
          ordem: rede.ordem,
        },
      });
    }
  }

  console.log("Perfis sociais criados (NextlevelDJ, O Moço do Te Amo, ongdoteamo)");

  // Links sociais de exemplo (legado)
  const links = [
    { nome: "YouTube", url: "https://www.youtube.com/@NextLevelDJ1", icone: "youtube", ordem: 1 },
    { nome: "Instagram", url: "https://instagram.com/nextleveldj1", icone: "instagram", ordem: 2 },
    { nome: "TikTok", url: "https://tiktok.com/@nextleveldj1", icone: "tiktok", ordem: 3 },
  ];

  for (const link of links) {
    await prisma.linkSocial.upsert({
      where: { id: link.nome.toLowerCase() },
      update: link,
      create: { id: link.nome.toLowerCase(), ...link },
    });
  }

  console.log("Links sociais criados");

  // Perfis oficiais
  const perfis = [
    { plataforma: "YouTube", usuario: "@omocodoteamo", url: "https://youtube.com/@omocodoteamo" },
    { plataforma: "Instagram", usuario: "@omocodoteamo", url: "https://instagram.com/omocodoteamo" },
    { plataforma: "TikTok", usuario: "@omocodoteamo", url: "https://tiktok.com/@omocodoteamo" },
  ];

  for (const perfil of perfis) {
    await prisma.perfilOficial.upsert({
      where: { id: perfil.plataforma.toLowerCase() },
      update: perfil,
      create: { id: perfil.plataforma.toLowerCase(), ...perfil },
    });
  }

  console.log("Perfis oficiais criados");

  // Fontes de renda
  const fontes = [
    { nome: "AdSense", descricao: "Receita de anúncios do YouTube", percentual: 60 },
    { nome: "Patrocínios", descricao: "Marcas que patrocinam vídeos específicos", percentual: 30 },
    { nome: "Doações de seguidores", descricao: "SuperChats e doações diretas", percentual: 10 },
  ];

  for (const fonte of fontes) {
    await prisma.fonteRenda.upsert({
      where: { id: fonte.nome.toLowerCase().replace(/\s/g, "-") },
      update: fonte,
      create: { id: fonte.nome.toLowerCase().replace(/\s/g, "-"), ...fonte },
    });
  }

  console.log("Fontes de renda criadas");
  console.log("Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
