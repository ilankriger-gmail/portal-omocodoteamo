import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Buscar todos os perfis sociais com suas redes sociais
  const perfis = await prisma.perfilSocial.findMany({
    include: {
      redesSociais: {
        orderBy: { ordem: 'asc' }
      }
    },
    orderBy: { ordem: 'asc' }
  });

  console.log('==== PERFIS SOCIAIS ATUAIS ====');

  for (const perfil of perfis) {
    console.log(`\n📱 ${perfil.nome} (ID: ${perfil.id})`);

    if (perfil.redesSociais.length === 0) {
      console.log('   - Nenhuma rede social cadastrada');
      continue;
    }

    for (const rede of perfil.redesSociais) {
      console.log(`   - ${rede.plataforma}: ${rede.usuario} (URL: ${rede.url})`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());