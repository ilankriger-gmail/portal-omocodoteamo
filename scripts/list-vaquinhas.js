const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vaquinhas = await prisma.vaquinha.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      status: true
    }
  });

  console.log('Recent Vaquinhas:');
  vaquinhas.forEach(v => {
    console.log(`ID: ${v.id}, Title: ${v.titulo}, Slug: ${v.slug}, Status: ${v.status}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());