import { PrismaClient } from '@prisma/client';
import { generateSlug, ensureUniqueSlug } from '../src/lib/slug';

async function migrateVaquinhas() {
  console.log('Iniciando migração de slugs para vaquinhas...');

  const prisma = new PrismaClient();

  try {
    // Obter todas as vaquinhas que não possuem slug
    const vaquinhas = await prisma.vaquinha.findMany();
    console.log(`Encontradas ${vaquinhas.length} vaquinhas.`);

    let updated = 0;
    let alreadyHasSlug = 0;
    let failed = 0;

    // Coletar todos os slugs já existentes
    const existingSlugs: string[] = vaquinhas
      .filter(v => v.slug)
      .map(v => v.slug as string);

    // Para cada vaquinha, gerar um slug único
    for (const vaquinha of vaquinhas) {
      if (vaquinha.slug) {
        alreadyHasSlug++;
        continue;
      }

      try {
        // Gerar slug base a partir do título
        const baseSlug = generateSlug(vaquinha.titulo);

        // Garantir que o slug é único
        const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

        // Adicionar o novo slug à lista de existentes (para garantir unicidade nos próximos)
        existingSlugs.push(uniqueSlug);

        // Atualizar a vaquinha com o novo slug
        await prisma.vaquinha.update({
          where: { id: vaquinha.id },
          data: { slug: uniqueSlug },
        });

        console.log(`✅ Atualizada vaquinha "${vaquinha.titulo}": ${uniqueSlug}`);
        updated++;
      } catch (error) {
        console.error(`❌ Erro ao atualizar vaquinha ${vaquinha.id} (${vaquinha.titulo}):`, error);
        failed++;
      }
    }

    console.log('\nMigração concluída:');
    console.log(`- Total de vaquinhas: ${vaquinhas.length}`);
    console.log(`- Já tinham slug: ${alreadyHasSlug}`);
    console.log(`- Atualizadas: ${updated}`);
    console.log(`- Falhas: ${failed}`);

  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Conexão com o banco de dados encerrada.');
  }
}

// Executar a migração
migrateVaquinhas()
  .then(() => {
    console.log('Script de migração finalizado.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro fatal na migração:', error);
    process.exit(1);
  });