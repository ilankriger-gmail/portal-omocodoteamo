import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// Função principal do seed
async function main() {
  console.log("Iniciando seed para banco de dados Neon...");
  const prisma = new PrismaClient();

  try {
    // 1. Criar usuário admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@omocodoteamo.com.br";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: hashedPassword },
      create: {
        email: adminEmail,
        password: hashedPassword,
        nome: "Administrador",
      },
    });
    console.log(`Usuário admin criado: ${adminEmail}`);

    // 2. Criar configuração básica do site
    await prisma.config.upsert({
      where: { id: "config-principal" },
      update: {},
      create: {
        id: "config-principal",
        biografia: "Portal da Transparência O Moço do Te Amo - Acompanhe todas as doações e vaquinhas com total transparência.",
        googleAnalyticsId: "G-XXXXXXXXXX", // Placeholder
        googleAdSenseId: "ca-pub-XXXXXXXXXX", // Placeholder
        adsAtivado: false,
        bannerAtivo: false,
      },
    });
    console.log("Config criada: config-principal");

    // 3. Criar pelo menos um perfil social principal
    const perfilPrincipal = await prisma.perfilSocial.upsert({
      where: { id: "perfil-principal" },
      update: {},
      create: {
        id: "perfil-principal",
        nome: "O Moço do Te Amo",
        descricao: "Perfil oficial do Moço do Te Amo",
        ordem: 1,
        redesSociais: {
          create: [
            {
              plataforma: "Instagram",
              usuario: "omocodoteamo",
              url: "https://instagram.com/omocodoteamo",
              ordem: 1,
              tipo: "oficial",
            },
            {
              plataforma: "YouTube",
              usuario: "OMocoDoTeAmo",
              url: "https://youtube.com/@OMocoDoTeAmo",
              ordem: 2,
              tipo: "oficial",
            },
          ],
        },
      },
      include: {
        redesSociais: true,
      },
    });
    console.log("Perfil social criado: O Moço do Te Amo");

    // 4. Criar links sociais
    await prisma.linkSocial.upsert({
      where: { id: "link-instagram" },
      update: {},
      create: {
        id: "link-instagram",
        nome: "Instagram",
        url: "https://instagram.com/omocodoteamo",
        icone: "Instagram",
        ordem: 1,
      },
    });
    console.log("Link social criado: Instagram");

    // 5. Criar fontes de renda
    await prisma.fonteRenda.upsert({
      where: { id: "fonte-doacoes" },
      update: {},
      create: {
        id: "fonte-doacoes",
        nome: "Doações diretas",
        descricao: "Doações feitas diretamente via PIX",
        percentual: 70.0,
      },
    });
    console.log("Fonte de renda criada: Doações diretas");

    // 6. Criar vaquinha de teste (ESSENCIAL PARA O BUILD)
    await prisma.vaquinha.upsert({
      where: { id: "vaquinha-teste" },
      update: {},
      create: {
        id: "vaquinha-teste",
        titulo: "Vaquinha de Teste para Vercel",
        slug: "vaquinha-teste-vercel",
        descricao: "Esta é uma vaquinha de teste criada para permitir o build correto na Vercel. Ela demonstra o funcionamento do portal.",
        linkOriginal: "https://vakinha.com.br/exemplo",
        chavePix: "teste@exemplo.com",
        meta: 5000.0,
        valorAtual: 1250.0,
        doacoes: 25,
        coracoes: 50,
        status: "ATIVA",
        imagemUrl: "https://static.vakinha.com.br/uploads/vakinha/image/default.jpg",
        atualizacoes: {
          create: [
            {
              conteudo: "Vaquinha criada para teste de build",
              tipo: "TEXTO",
            },
          ],
        },
      },
    });
    console.log("Vaquinha de teste criada: Vaquinha de Teste para Vercel");

    // 7. Criar vaquinha apoiada de teste
    await prisma.vaquinhaApoiada.upsert({
      where: { id: "vaquinha-apoiada-teste" },
      update: {},
      create: {
        id: "vaquinha-apoiada-teste",
        nome: "Vaquinha Apoiada de Teste",
        link: "https://www.vakinha.com.br/exemplo-apoiada",
        descricao: "Esta é uma vaquinha apoiada de teste para o build da Vercel",
      },
    });
    console.log("Vaquinha apoiada de teste criada");

    // 8. Criar FAQ de teste
    await prisma.fAQ.upsert({
      where: { id: "faq-teste" },
      update: {},
      create: {
        id: "faq-teste",
        pergunta: "O que é o Portal da Transparência?",
        resposta: "O Portal da Transparência é uma iniciativa do projeto O Moço do Te Amo para mostrar com transparência todas as doações recebidas e como elas são utilizadas.",
        ordem: 1,
        ativo: true,
      },
    });
    console.log("FAQ de teste criado");

    console.log("Seed concluído com sucesso!");
  } catch (error) {
    console.error("Erro durante o processo de seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função principal
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });