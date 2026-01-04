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

/**
 * Gera uma URL padronizada para cada plataforma de rede social
 * Formato padronizado: "plataforma.com/usuario" (ex: facebook.com/usuario)
 * Alguns sites usam @ no usuário, outros não, esta função padroniza isso
 */
export function generateSocialUrl(plataforma: string, usuario: string): string {
  // Remover @ do início se existir
  const cleanUsuario = usuario.startsWith('@') ? usuario.substring(1) : usuario;

  switch (plataforma) {
    case 'facebook':
      return `https://facebook.com/${cleanUsuario}`;
    case 'instagram':
      return `https://instagram.com/${cleanUsuario}`;
    case 'threads':
      return `https://threads.net/@${cleanUsuario}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanUsuario}`;
    case 'youtube':
      return `https://youtube.com/@${cleanUsuario}`;
    case 'x':
      return `https://x.com/${cleanUsuario}`;
    case 'kwai':
      return `https://kwai.com/@${cleanUsuario}`;
    case 'whatsapp':
      // Assumindo que o "usuário" é o número telefônico
      return `https://wa.me/${cleanUsuario}`;
    default:
      return `https://${plataforma}.com/${cleanUsuario}`;
  }
}