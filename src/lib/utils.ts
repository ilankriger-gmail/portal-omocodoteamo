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
 * Utilizando um sistema de templates para maior flexibilidade
 */
export function generateSocialUrl(plataforma: string, usuario: string): string {
  // Remoção do @ do início se existir
  const cleanUsuario = usuario.startsWith('@') ? usuario.substring(1) : usuario;

  // Tratamento especial para WhatsApp - links de grupo ou canal
  if (plataforma === 'whatsapp') {
    // Se já for um link completo do WhatsApp, manter como está
    if (usuario.startsWith('https://chat.whatsapp.com/') ||
        usuario.startsWith('https://whatsapp.com/channel/') ||
        usuario.startsWith('https://www.whatsapp.com/channel/')) {
      return usuario;
    }

    // Se for um link de grupo sem https, adicionar o prefixo
    if (usuario.startsWith('chat.whatsapp.com/')) {
      return `https://${usuario}`;
    }

    // Se for um link de canal sem https, adicionar o prefixo
    if (usuario.startsWith('whatsapp.com/channel/') || usuario.startsWith('www.whatsapp.com/channel/')) {
      return `https://${usuario}`;
    }

    // Para garantir que todos os links funcionem, adicionamos https:// se não começar com http ou https
    if (!usuario.startsWith('http://') && !usuario.startsWith('https://')) {
      return `https://${usuario}`;
    }

    // Caso contrário, retornar o link como está
    return usuario;
  }

  // Configuração de URL por plataforma usando templates com variáveis
  const urlFormats: Record<string, string> = {
    'instagram': 'https://instagram.com/{usuario}',
    'youtube': 'https://youtube.com/@{usuario}',
    'tiktok': 'https://tiktok.com/@{usuario}',
    'facebook': 'https://facebook.com/{usuario}',
    'kwai': 'https://kwai.com/@{usuario}',
    'threads': 'https://threads.net/@{usuario}',
    'x': 'https://x.com/{usuario}',
    'telegram': 'https://t.me/{usuario}'
  };

  // Usar formato específico ou gerar um padrão
  const format = urlFormats[plataforma] || `https://${plataforma}.com/{usuario}`;

  // Substituir variável de template
  return format.replace('{usuario}', cleanUsuario);
}