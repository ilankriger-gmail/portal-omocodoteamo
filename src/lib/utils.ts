/**
 * Utility functions for the application
 */

/**
 * Verifica se uma URL de imagem é válida para uso com o Next.js Image
 * Rejeita null, undefined e strings vazias
 */
export function isValidImageUrl(url: string | null | undefined): url is string {
  return Boolean(url && url.trim() !== "");
}