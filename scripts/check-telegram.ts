import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const telegramRedes = await prisma.redeSocial.findMany({
    where: { plataforma: 'telegram' },
    include: { perfil: true }
  });

  console.log('Telegram links:');
  telegramRedes.forEach(rede => {
    console.log(`${rede.perfil.nome}: ${rede.usuario} -> ${rede.url}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());