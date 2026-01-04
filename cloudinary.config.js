/**
 * Cloudinary Configuration
 *
 * Configuração para o serviço Cloudinary de armazenamento de imagens.
 * Necessário para o funcionamento do upload de imagens em ambientes serverless.
 *
 * Variáveis de ambiente necessárias:
 * - CLOUDINARY_CLOUD_NAME: Nome da conta Cloudinary
 * - CLOUDINARY_API_KEY: Chave API do Cloudinary
 * - CLOUDINARY_API_SECRET: Segredo da API do Cloudinary
 */

// Exportar configuração para ser usada em outros módulos
module.exports = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dwnbmcg00',
  apiKey: process.env.CLOUDINARY_API_KEY || '172667994195663',
  apiSecret: process.env.CLOUDINARY_API_SECRET || 'aHMCEq33FURqb9I1Bz9nxYY14d4',
};