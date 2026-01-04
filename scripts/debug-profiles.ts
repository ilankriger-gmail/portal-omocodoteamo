import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Verificar o total de perfis
  const totalPerfis = await prisma.perfilSocial.count();
  console.log(`Total de perfis no banco: ${totalPerfis}`);

  // Obter todos os registros na tabela RedeSocial
  const totalRedes = await prisma.redeSocial.count();
  console.log(`Total de redes sociais no banco: ${totalRedes}`);

  // Listar todos os perfis com suas redes sociais
  const perfis = await prisma.perfilSocial.findMany({
    orderBy: { ordem: 'asc' },
    include: {
      redesSociais: {
        orderBy: { ordem: 'asc' }
      }
    }
  });

  // Exibir um sumário de cada perfil
  console.log('\nSumário dos perfis:');
  for (const perfil of perfis) {
    console.log(`- ${perfil.nome} (ID: ${perfil.id}, Ordem: ${perfil.ordem}) - ${perfil.redesSociais.length} redes sociais`);

    // Listar as primeiras 2 redes sociais como exemplo
    const redesToShow = perfil.redesSociais.slice(0, 2);
    for (const rede of redesToShow) {
      console.log(`  * ${rede.plataforma}: ${rede.usuario} (ID: ${rede.id})`);
    }
    if (perfil.redesSociais.length > 2) {
      console.log(`  * ... e mais ${perfil.redesSociais.length - 2} redes sociais`);
    }
  }
}

main()
  .catch(e => console.error('Erro:', e))
  .finally(() => prisma.$disconnect());