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
  // Se for WhatsApp e parece ser uma URL completa, retornar como está
  if (plataforma === 'whatsapp' && (
    usuario.startsWith('https://') ||
    usuario.startsWith('http://') ||
    usuario.startsWith('wa.me/') ||
    usuario.startsWith('chat.whatsapp.com/')
  )) {
    // Garantir que a URL comece com https://
    if (usuario.startsWith('wa.me/')) {
      return `https://${usuario}`;
    } else if (usuario.startsWith('chat.whatsapp.com/')) {
      return `https://${usuario}`;
    } else {
      return usuario; // Já é uma URL completa
    }
  }

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
      // Se chegou aqui, assumimos que é um número de telefone ou grupo
      if (usuario.includes('group')) {
        return usuario; // Retornar link de grupo como está
      }
      // Caso contrário, assumimos que é um número de telefone
      return `https://wa.me/${cleanUsuario}`;
    default:
      return `https://${plataforma}.com/${cleanUsuario}`;
  }
}