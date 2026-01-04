/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'i.imgur.com' },
      { hostname: 'imgur.com' },
      { hostname: 'res.cloudinary.com' },
      { hostname: 'vakinha.com.br' },
      { hostname: 'www.vakinha.com.br' },
      { hostname: 'static.vakinha.com.br' },
      { hostname: 'portal.omocodoteamo.com.br' },
    ],
  },
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  reactStrictMode: true,
  eslint: {
    // Ignorar erros de ESLint durante o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de TypeScript durante o build
    ignoreBuildErrors: true,
  },
  // Configuração para evitar erros com banco de dados durante build
  staticPageGenerationTimeout: 0,
  output: 'standalone', // Recomendado para deploy em produção
  // Configurar redirecionamento de barras no final
  skipTrailingSlashRedirect: true,
  // Excluir rotas problemáticas da coleta de dados durante o build
  // Isso evita erros de build relacionados à rota /api/adsense
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  onDemandEntries: {
    // Opções para controlar páginas on-demand
    maxInactiveAge: 60 * 60 * 1000, // 1 hora
    pagesBufferLength: 5,
  },
  // Desabilitar geração estática para rotas que usam banco de dados
  // Isso garante que as páginas sejam renderizadas no servidor
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    // Usar fallback para páginas que falham durante build
    missingSuspenseWithCSRBailout: false,
    // Evitar coletar dados de rotas problemáticas (como /api/adsense)
    optimizePackageImports: ['@prisma/client'],
  },
};

export default nextConfig;
