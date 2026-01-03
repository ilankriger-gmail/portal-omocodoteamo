/**
 * Utilitário para gerar slugs amigáveis para URLs
 */

/**
 * Converte um texto em um slug amigável para URL
 * @param text Texto a ser convertido em slug
 * @returns Slug amigável para URL
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .substring(0, 100); // Limita o tamanho
}

/**
 * Garante que um slug seja único adicionando um sufixo numérico se necessário
 * @param baseSlug Slug base
 * @param existingSlugs Array de slugs existentes
 * @returns Slug único
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}