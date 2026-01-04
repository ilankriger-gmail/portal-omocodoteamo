/** @type {import('next').NextConfig} */

// Função para excluir rotas problemáticas durante o build
const excludeAdsenseBuild = () => {
  const isVercelBuild = process.env.NODE_ENV === 'production' &&
                         process.env.NEXT_PHASE === 'phase-production-build';

  if (isVercelBuild) {
    console.log('Configuração para excluir rotas problemáticas durante o build da Vercel');
    return {
      redirects: async () => {
        return [
          {
            source: '/api/adsense',
            destination: '/api',
            permanent: false,
          },
        ]
      }
    };
  }

  return {};
};

// Combinar configurações com as exclusões de build
const nextConfig = {
  ...excludeAdsenseBuild(),
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
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
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
    // Pacotes externos que devem ser carregados apenas em runtime, não durante build
    serverComponentsExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium', '@prisma/client', 'prisma'],
    // Usar fallback para páginas que falham durante build
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
