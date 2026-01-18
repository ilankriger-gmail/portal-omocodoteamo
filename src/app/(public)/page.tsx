import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Heart, Users, TrendingUp, ShieldAlert, HandHeart } from "lucide-react";
import { isValidImageUrl } from "@/lib/utils";
import type { Metadata } from "next";

// Força a renderização dinâmica da página em cada acesso
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Metadata para SEO
export const metadata: Metadata = {
  title: "Portal da Transparência | O Moço do Te Amo",
  description: "Acompanhe em tempo real todas as doações, vaquinhas e campanhas sociais com total transparência. Veja como ajudar e participar.",
  openGraph: {
    title: "Portal da Transparência | O Moço do Te Amo",
    description: "Acompanhe em tempo real todas as doações, vaquinhas e campanhas sociais com total transparência. Veja como ajudar e participar.",
    type: "website",
  },
  keywords: ["transparência", "doações", "vaquinhas", "campanhas sociais", "O Moço do Te Amo", "ajuda humanitária"],
};

async function getData() {
  try {
    const [config, vaquinhas, vaquinhasApoiadas] = await Promise.all([
      prisma.config.findFirst({
        include: {
          vaquinhaFixada: {
            select: {
              id: true,
              titulo: true,
              slug: true,
              descricao: true,
              status: true,
              meta: true,
              valorAtual: true,
              videoUrl: true,
              imagemUrl: true,
            }
          }
        },
      }),
      prisma.vaquinha.findMany({
        where: { status: "ATIVA" },
        orderBy: { createdAt: "desc" },
        take: 5, // Limitar a 5 vaquinhas para a página inicial
        select: {
          id: true,
          titulo: true,
          slug: true,
          descricao: true,
          status: true,
          meta: true,
          valorAtual: true,
          videoUrl: true,
          imagemUrl: true,
        }
      }),
      prisma.vaquinhaApoiada.findMany({
        take: 6, // Aumentado para 6 vaquinhas apoiadas
        select: {
          id: true,
          nome: true,
          descricao: true,
          link: true,
        }
      }),
    ]);

    let vaquinhaDestaque = null;
    let vaquinhasSecundarias: typeof vaquinhas = [];

    // Verificar se há campanha fixada
    if (config?.vaquinhaFixada && config.vaquinhaFixada.status === "ATIVA") {
      vaquinhaDestaque = config.vaquinhaFixada;
      // Secundárias são as outras campanhas (excluindo a fixada)
      vaquinhasSecundarias = vaquinhas
        .filter((v) => v.id !== config.vaquinhaFixadaId)
        .slice(0, 2);
    } else {
      // Sem campanha fixada: embaralhar aleatoriamente
      const shuffledVaquinhas = [...vaquinhas];
      const timestamp = new Date().getTime();
      for (let i = shuffledVaquinhas.length - 1; i > 0; i--) {
        const j = Math.floor((Math.random() * (i + 1)) + (timestamp % 10) / 10);
        [shuffledVaquinhas[i], shuffledVaquinhas[j]] = [shuffledVaquinhas[j], shuffledVaquinhas[i]];
      }
      vaquinhaDestaque = shuffledVaquinhas.length > 0 ? shuffledVaquinhas[0] : null;
      vaquinhasSecundarias = shuffledVaquinhas.slice(1, 3);
    }

    return { config, vaquinhaDestaque, vaquinhasSecundarias, vaquinhasApoiadas };
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return {
      config: null,
      vaquinhaDestaque: null,
      vaquinhasSecundarias: [],
      vaquinhasApoiadas: []
    };
  }
}

export default async function HomePage() {
  const { config, vaquinhaDestaque, vaquinhasSecundarias, vaquinhasApoiadas } = await getData();
  const progress = vaquinhaDestaque
    ? Math.min((vaquinhaDestaque.valorAtual / vaquinhaDestaque.meta) * 100, 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Banner Principal com Degradê */}
      {config?.bannerPrincipalAtivo && config?.bannerPrincipalTexto && (
        <div className="mb-6 -mx-4 sm:mx-0 animate-fade-in-down">
          <div
            className="relative overflow-hidden sm:rounded-2xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${config.bannerPrincipalGradientStart || '#000000'}, ${config.bannerPrincipalGradientEnd || '#1a1a2e'})`,
              minHeight: '200px',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <h2
                className="text-white font-black text-2xl sm:text-4xl md:text-5xl text-center uppercase tracking-wider"
                style={{
                  textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.05em',
                  WebkitTextStroke: '2px #000000',
                  paintOrder: 'stroke fill',
                }}
              >
                {config.bannerPrincipalTexto}
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Banner Secundário (Imagem) */}
      {config?.bannerAtivo && (config?.bannerTexto || config?.bannerImageUrl) && (
        config.bannerLink ? (
          <a
            href={config.bannerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-6 -mx-4 sm:mx-0 animate-fade-in-down"
          >
            {isValidImageUrl(config.bannerImageUrl) ? (
              <div className="relative overflow-hidden sm:rounded-xl group">
                <div className="relative w-full aspect-auto">
                  <Image
                    src={config.bannerImageUrl}
                    alt="Banner"
                    width={2000}
                    height={600}
                    sizes="100vw"
                    className="w-full transition-all duration-500 group-hover:scale-[1.02] group-hover:brightness-110"
                    priority
                  />
                </div>
                {config.bannerTexto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-all duration-300 group-hover:bg-black/30">
                    <p className="text-white font-bold text-lg sm:text-xl drop-shadow-lg text-center px-4">
                      {config.bannerTexto}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] sm:rounded-xl py-4 px-6 text-center hover:bg-[var(--surface-hover)] transition-all duration-300">
                <p className="text-[var(--foreground)] font-medium text-sm sm:text-base">
                  {config.bannerTexto}
                </p>
              </div>
            )}
          </a>
        ) : (
          <div className="mb-6 -mx-4 sm:mx-0 animate-fade-in-down">
            {isValidImageUrl(config.bannerImageUrl) ? (
              <div className="relative overflow-hidden sm:rounded-xl">
                <div className="relative w-full aspect-auto">
                  <Image
                    src={config.bannerImageUrl}
                    alt="Banner"
                    width={2000}
                    height={600}
                    sizes="100vw"
                    className="w-full"
                    priority
                  />
                </div>
                {config.bannerTexto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <p className="text-white font-bold text-lg sm:text-xl drop-shadow-lg text-center px-4">
                      {config.bannerTexto}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] sm:rounded-xl py-4 px-6 text-center">
                <p className="text-[var(--foreground)] font-medium text-sm sm:text-base">
                  {config.bannerTexto}
                </p>
              </div>
            )}
          </div>
        )
      )}

      {/* Profile Header - Estilo Personalizado */}
      <div className="relative mb-6 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm animate-fade-in-up transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-4">
          {/* Avatar com efeito hexagonal */}
          <div className="flex-shrink-0 relative group">
            {isValidImageUrl(config?.avatarUrl) ? (
              <div className="w-16 h-16 overflow-hidden rounded-xl bg-[var(--surface-hover)] shadow-lg transform rotate-3 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
                <div className="relative w-full h-full">
                  <Image
                    src={config.avatarUrl}
                    alt="Avatar"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[var(--surface-hover)] flex items-center justify-center transform rotate-3 shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
                <Users className="w-8 h-8 text-[var(--foreground-tertiary)]" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center animate-pulse-soft">
              <Heart size={12} className="text-white" fill="currentColor" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[var(--foreground)]">O Moço do Te Amo</h1>
            <p className="text-[var(--foreground-secondary)] text-sm">Portal da Transparência</p>
          </div>
        </div>

        {/* Action Buttons - Estilo Card */}
        <div className="mt-4 flex gap-2">
          <Link
            href="/quem-somos"
            className="flex-1 py-2.5 bg-[var(--surface-hover)] hover:bg-[var(--border)] text-[var(--foreground)] text-sm font-medium rounded-lg text-center transition-all duration-300 border border-[var(--border)] hover:-translate-y-0.5"
          >
            Quem Somos
          </Link>
          <Link
            href="/participar"
            className="flex-1 py-2.5 bg-[var(--surface-hover)] hover:bg-[var(--border)] text-[var(--foreground)] text-sm font-medium rounded-lg text-center transition-all duration-300 border border-[var(--border)] hover:-translate-y-0.5"
          >
            Envie seu Sonho
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border)] mb-6" />

      {/* HEADLINE - MANCHETE DE JORNAL */}
      <div className="mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-none">
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div className="ml-2 border-b-2 border-green-600 flex-1 pb-0.5 pr-2">
            <h2 className="text-lg font-black uppercase text-[var(--foreground)] tracking-widest">
              CAMPANHAS ATIVAS
            </h2>
          </div>
        </div>
      </div>

      {/* MANCHETE PRINCIPAL - PRIMEIRA PÁGINA ESTILO JORNAL */}
      {vaquinhaDestaque && (
        <div className="mb-10 -mx-4 sm:mx-0 animate-fade-in-up animation-delay-100">
          <Link href={`/vaquinhas/${vaquinhaDestaque.slug}`} className="block bg-[var(--card-bg)] border border-[var(--card-border)] sm:rounded-xl overflow-hidden shadow-sm hover:shadow-lg relative group cursor-pointer transition-all duration-300">
            {/* Imagem Expandida de Manchete - Ocupando Toda Largura */}
            {isValidImageUrl(vaquinhaDestaque.imagemUrl) ? (
              <div className="relative w-full overflow-hidden">
                <div className="relative w-full h-[300px] sm:h-[350px]">
                  <Image
                    src={vaquinhaDestaque.imagemUrl}
                    alt={vaquinhaDestaque.titulo}
                    fill
                    sizes="(max-width: 640px) 100vw, 800px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                </div>

                {/* Gradiente forte para melhor legibilidade do texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />

                {/* Tarja de data - estilo jornal */}
                <div className="absolute top-3 left-0 bg-green-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                  Campanha {vaquinhaDestaque.status === "ATIVA" ? "Ativa" : "Encerrada"}
                </div>

                {/* Indicador de vídeo */}
                {vaquinhaDestaque.videoUrl && (
                  <div className="absolute top-3 right-3 bg-black text-white text-[10px] font-bold px-2 py-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    COM VÍDEO
                  </div>
                )}

                {/* Título principal - estilo manchete de primeira página */}
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <h1 className="text-white text-2xl sm:text-3xl font-black uppercase leading-tight drop-shadow-lg mb-2">
                    {vaquinhaDestaque.titulo}
                  </h1>

                  <div className="flex items-end justify-between">
                    <div className="w-3/4">
                      <p className="text-gray-200 text-xs sm:text-sm mb-3 line-clamp-2 font-serif">
                        {vaquinhaDestaque.descricao.substring(0, 180)}
                        {vaquinhaDestaque.descricao.length > 180 ? "..." : ""}
                      </p>
                    </div>

                    <div className="text-white text-xs">
                      <div className="bg-green-600 px-2 py-1">
                        <span className="font-bold">{Math.round(progress)}%</span> arrecadado
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Versão sem imagem */
              <div className="p-4 bg-[var(--surface)] border-b border-green-600">
                <h1 className="text-[var(--foreground)] text-2xl font-black uppercase leading-tight mb-3">
                  {vaquinhaDestaque.titulo}
                </h1>
                <p className="text-[var(--foreground-secondary)] text-sm mb-3 line-clamp-3 font-serif">
                  {vaquinhaDestaque.descricao.substring(0, 250)}
                  {vaquinhaDestaque.descricao.length > 250 ? "..." : ""}
                </p>
              </div>
            )}

            <div className="p-4">
              {/* Tabela de dados de arrecadação */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-lg">
                  <div className="text-[var(--foreground)] text-xs uppercase font-bold border-b border-[var(--border)] pb-1 mb-1">Arrecadado</div>
                  <div className="text-green-600 font-bold text-lg">R$ {vaquinhaDestaque.valorAtual.toLocaleString("pt-BR")}</div>
                </div>
                <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-lg">
                  <div className="text-[var(--foreground)] text-xs uppercase font-bold border-b border-[var(--border)] pb-1 mb-1">Meta</div>
                  <div className="text-[var(--foreground-secondary)] font-bold text-lg">R$ {vaquinhaDestaque.meta.toLocaleString("pt-BR")}</div>
                </div>
              </div>

              {/* Barra de progresso estilo jornal */}
              <div className="relative h-6 bg-[var(--surface-hover)] mb-4 border border-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[var(--foreground)] text-xs font-bold bg-[var(--card-bg)]/80 px-2 py-0.5 rounded">
                    {Math.round(progress)}% CONCLUÍDO
                  </div>
                </div>
              </div>

              <div
                className="block w-full py-3.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold uppercase text-center tracking-wide transition-all duration-300 rounded-lg"
              >
                Leia mais e ajude
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Link para todas as campanhas */}
      <div className="text-center mb-10 animate-fade-in-up animation-delay-200">
        <Link
          href="/vaquinhas"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-600/20 group"
        >
          VER TODAS AS CAMPANHAS
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-1">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* ARTIGOS SECUNDÁRIOS (Estilo Jornal) */}
      {vaquinhasSecundarias.length > 0 && (
        <div className="mb-8 animate-fade-in-up animation-delay-300">
          <div className="border-b-2 border-[var(--border)] mb-4">
            <h3 className="text-sm font-bold uppercase text-[var(--foreground)] bg-[var(--surface-hover)] inline-block px-2 py-1 rounded-t">
              OUTRAS CAMPANHAS
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {vaquinhasSecundarias.map((vaquinha, index) => {
              const progress = Math.min((vaquinha.valorAtual / vaquinha.meta) * 100, 100);
              return (
                <Link
                  key={vaquinha.id}
                  href={`/vaquinhas/${vaquinha.slug}`}
                  className={`border-b border-[var(--border)] pb-4 group transition-all duration-300 hover:bg-[var(--surface-hover)] hover:px-2 hover:-mx-2 rounded-lg ${index === vaquinhasSecundarias.length - 1 ? 'border-b-0' : ''}`}
                >
                  <div className="flex gap-4">
                    {/* Thumbnail pequena */}
                    <div className="w-24 h-24 flex-shrink-0 bg-[var(--surface-hover)] relative overflow-hidden rounded-lg">
                      {isValidImageUrl(vaquinha.imagemUrl) ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={vaquinha.imagemUrl}
                            alt={vaquinha.titulo}
                            fill
                            sizes="96px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="w-8 h-8 text-green-600/30" />
                        </div>
                      )}

                      {/* Indicador de vídeo */}
                      {vaquinha.videoUrl && (
                        <div className="absolute bottom-0 right-0 bg-green-600 w-5 h-5 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-[var(--foreground)] text-sm font-bold mb-1 line-clamp-2 group-hover:text-green-600 transition-colors duration-300">
                        {vaquinha.titulo}
                      </h3>

                      <div className="flex justify-between text-xs text-[var(--foreground-secondary)] mb-2">
                        <span>Meta: R$ {vaquinha.meta.toLocaleString("pt-BR")}</span>
                        <span>{Math.round(progress)}% arrecadado</span>
                      </div>

                      <div className="w-full h-1.5 bg-[var(--surface-hover)] overflow-hidden rounded-full">
                        <div
                          className="h-full bg-green-600 transition-all duration-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* VAQUINHAS APOIADAS - DESTAQUE EDITORIAL */}
      {vaquinhasApoiadas.length > 0 && (
        <div className="mb-8 animate-fade-in-up animation-delay-400">
          <div className="bg-[var(--surface-hover)] border-l-4 border-[var(--foreground-tertiary)] mb-4 rounded-r">
            <div className="flex items-center py-2 px-3">
              <HandHeart className="w-4 h-4 text-[var(--foreground-tertiary)] mr-2" />
              <h2 className="text-sm font-bold uppercase text-[var(--foreground)]">
                Campanhas Externas Apoiadas
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vaquinhasApoiadas.map((v, index) => (
              <a
                key={v.id}
                href={v.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--surface-hover)] transition-all duration-300 p-3 rounded-lg hover:-translate-y-0.5 hover:shadow-md group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <h4 className="text-[var(--foreground)] text-sm font-bold mb-2 line-clamp-1 group-hover:text-green-600 transition-colors duration-300">{v.nome}</h4>
                {v.descricao && (
                  <p className="text-[var(--foreground-secondary)] text-sm line-clamp-2 mb-1">{v.descricao}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-[var(--foreground-tertiary)] mt-1 group-hover:text-green-600 transition-colors duration-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                  Saiba mais
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-4">
            <Link
              href="/vaquinhas-apoiadas"
              className="text-sm text-[var(--foreground-secondary)] hover:text-green-600 inline-flex items-center gap-1 transition-all duration-300 group"
            >
              Ver todas as campanhas externas
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* ENVIE SEU SONHO - SEÇÃO */}
      <div className="mb-8 bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-xl shadow-sm animate-fade-in-up animation-delay-500 transition-all duration-300 hover:shadow-md group">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center bg-[var(--surface-hover)] rounded-full transition-all duration-300 group-hover:bg-green-600/10 group-hover:scale-110">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--foreground-tertiary)] transition-colors duration-300 group-hover:text-green-600">
              <path d="M12 21a9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9z"/>
              <path d="M12 7v6l3 3"/>
            </svg>
          </div>
          <div>
            <h3 className="text-[var(--foreground)] text-lg font-bold">Envie seu Sonho</h3>
            <p className="text-[var(--foreground-secondary)] text-sm">Preencha o formulário e seja parte da próxima campanha</p>
          </div>
        </div>

        <Link
          href="/participar"
          className="block w-full text-center py-3 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-green-600/20"
        >
          Formulário de Cadastro
        </Link>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border)] mb-6" />

      {/* Quick Links - Grid minimalista */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Link href="/vaquinhas" className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-full bg-[var(--surface-hover)] flex items-center justify-center transition-all duration-300 group-hover:bg-green-600/10 group-hover:scale-110 group-hover:shadow-lg">
            <TrendingUp className="w-6 h-6 text-[var(--foreground-tertiary)] transition-colors duration-300 group-hover:text-green-600" />
          </div>
          <span className="text-[var(--foreground-secondary)] text-sm text-center transition-colors duration-300 group-hover:text-[var(--foreground)]">Vaquinhas</span>
        </Link>

        <Link href="/vaquinhas-apoiadas" className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-full bg-[var(--surface-hover)] flex items-center justify-center transition-all duration-300 group-hover:bg-green-600/10 group-hover:scale-110 group-hover:shadow-lg">
            <HandHeart className="w-6 h-6 text-[var(--foreground-tertiary)] transition-colors duration-300 group-hover:text-green-600" />
          </div>
          <span className="text-[var(--foreground-secondary)] text-sm text-center transition-colors duration-300 group-hover:text-[var(--foreground)]">Apoiadas</span>
        </Link>

        <Link href="/quem-somos" className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-full bg-[var(--surface-hover)] flex items-center justify-center transition-all duration-300 group-hover:bg-green-600/10 group-hover:scale-110 group-hover:shadow-lg">
            <Users className="w-6 h-6 text-[var(--foreground-tertiary)] transition-colors duration-300 group-hover:text-green-600" />
          </div>
          <span className="text-[var(--foreground-secondary)] text-sm text-center transition-colors duration-300 group-hover:text-[var(--foreground)]">Perfis</span>
        </Link>

        <Link href="/denunciar" className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-full bg-[var(--surface-hover)] flex items-center justify-center transition-all duration-300 group-hover:bg-red-600/10 group-hover:scale-110 group-hover:shadow-lg">
            <ShieldAlert className="w-6 h-6 text-[var(--foreground-tertiary)] transition-colors duration-300 group-hover:text-red-500" />
          </div>
          <span className="text-[var(--foreground-secondary)] text-sm text-center transition-colors duration-300 group-hover:text-[var(--foreground)]">Denunciar</span>
        </Link>
      </div>

      {/* Footer info */}
      <div className="text-center py-4">
        <p className="text-[var(--foreground-tertiary)] text-sm transition-colors duration-300 hover:text-[var(--foreground-secondary)]">
          Todas as doações são documentadas com total transparência
        </p>
      </div>
    </div>
  );
}
