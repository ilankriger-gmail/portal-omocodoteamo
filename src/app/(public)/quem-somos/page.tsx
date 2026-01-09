import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaWhatsapp,
  FaXTwitter,
  FaThreads,
} from "react-icons/fa6";
import { ShieldAlert, Users, MapPin, Calendar, TrendingUp, DollarSign } from "lucide-react";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Ícone customizado do Kwai
const KwaiIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <text x="7" y="17" fontSize="12" fontWeight="bold" fill="black">K</text>
  </svg>
);

export const metadata = {
  title: "Quem Somos | Portal da Transparência O Moço do Te Amo",
  description: "Conheça a história, os perfis oficiais e as fontes de renda do projeto. Transparência total sobre nosso trabalho.",
  openGraph: {
    title: "Quem Somos | Portal da Transparência O Moço do Te Amo",
    description: "Conheça a história, os perfis oficiais e as fontes de renda do projeto. Transparência total sobre nosso trabalho.",
    type: "website",
  },
  keywords: ["quem somos", "o moço do te amo", "perfis oficiais", "fontes de renda", "transparência", "redes sociais oficiais"],
};

const plataformaConfig: Record<string, {
  icon: React.ElementType;
  color: string;
}> = {
  instagram: { icon: FaInstagram, color: "text-pink-500" },
  threads: { icon: FaThreads, color: "var(--foreground)" },
  tiktok: { icon: FaTiktok, color: "var(--foreground)" },
  youtube: { icon: FaYoutube, color: "text-red-500" },
  facebook: { icon: FaFacebook, color: "text-blue-500" },
  kwai: { icon: KwaiIcon, color: "text-orange-500" },
  whatsapp: { icon: FaWhatsapp, color: "text-green-500" },
  x: { icon: FaXTwitter, color: "var(--foreground)" },
};

function formatSeguidores(num: number | null): string {
  if (!num) return "";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${Math.floor(num / 1000)}K`;
  return `${num}`;
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `R$ ${Math.floor(num / 1000)}K`;
  return `R$ ${num.toLocaleString("pt-BR")}`;
}

async function getData() {
  const [config, perfis, parceiroRes] = await Promise.all([
    prisma.config.findFirst(),
    prisma.perfilSocial.findMany({
      orderBy: { ordem: "asc" },
      include: {
        redesSociais: {
          orderBy: { ordem: "asc" }
        }
      }
    }),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/parceiro`, {
      next: { revalidate: 86400 }
    }).then(r => r.json()).catch(() => null)
  ]);

  return { config, perfis, parceiro: parceiroRes };
}

export default async function QuemSomosPage() {
  const { config, perfis, parceiro } = await getData();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header - Instagram Style */}
      <div className="flex items-start gap-6 mb-6">
        {/* Avatar com borda gradiente */}
        <div className="flex-shrink-0">
          <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
            <div className="p-[3px] rounded-full" style={{ backgroundColor: 'var(--background)' }}>
              <Image
                src={config?.avatarUrl || "/uploads/nextleveldj-avatar.jpg"}
                alt="Ilan"
                width={96}
                height={96}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 pt-1">
          <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--foreground)' }}>O Moço do Te Amo</h1>

          {parceiro && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mb-3" style={{ color: 'var(--muted)' }}>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {parceiro.localizacao}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Desde {parceiro.ativoDesde}
              </span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex gap-5">
            <div>
              <span className="block text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                {parceiro?.vaquinhasCriadas || 116}
              </span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>vaquinhas</span>
            </div>
            <div>
              <span className="block text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                {parceiro ? formatCurrency(parceiro.valorArrecadadoNum) : "R$ 1M+"}
              </span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>arrecadados</span>
            </div>
            <div>
              <span className="block text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                {parceiro ? formatSeguidores(parceiro.pessoasImpactadas) : "34K"}
              </span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>pessoas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {config?.biografia && (
        <div className="mb-6">
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
            {config.biografia}
          </p>
        </div>
      )}

      {/* Causas */}
      {parceiro?.causas && (
        <div className="flex flex-wrap gap-2 mb-6">
          {parceiro.causas.map((causa: string, i: number) => (
            <span key={i} className="px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--muted)' }}>
              {causa}
            </span>
          ))}
        </div>
      )}

      {/* Link Vakinha */}
      <a
        href="https://www.vakinha.com.br/parceiros/ilan-kriger"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium rounded-lg mb-6 transition-colors"
        style={{ backgroundColor: 'var(--surface)', color: 'var(--foreground)' }}
      >
        <TrendingUp size={16} />
        Ver perfil completo na Vakinha
      </a>

      {/* Divider */}
      <div className="my-6" style={{ borderTop: '1px solid var(--border)' }} />

      {/* Alerta - Antes dos perfis */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6 animate-fade-in-up">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          <span className="text-yellow-500 font-semibold">⚠️ Atenção:</span> Estes são os <strong style={{ color: 'var(--foreground)' }}>ÚNICOS</strong> perfis oficiais.
          Qualquer outro perfil pedindo dinheiro é <strong className="text-red-400">GOLPE</strong>!
        </p>
      </div>

      {/* Perfis Oficiais */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            Perfis Oficiais
          </span>
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>• únicos verificados</span>
        </div>

        {perfis.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Nenhum perfil cadastrado</p>
        ) : (
          <div className="space-y-4">
            {perfis.map((perfil) => {
              const redesOficiais = perfil.redesSociais.filter(
                (r) => r.tipo === "oficial" || !r.tipo
              );
              const redesReserva = perfil.redesSociais.filter(
                (r) => r.tipo === "reserva"
              );
              const totalSeguidores = perfil.redesSociais.reduce(
                (acc, rede) => acc + (rede.seguidores || 0),
                0
              );

              return (
                <div key={perfil.id} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--card-bg)' }}>
                  {/* Perfil Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                      <div className="p-[2px] rounded-full" style={{ backgroundColor: 'var(--card-bg)' }}>
                        {perfil.avatarUrl ? (
                          <Image
                            src={perfil.avatarUrl}
                            alt={perfil.nome}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
                            <Users className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{perfil.nome}</h3>
                      {totalSeguidores > 0 && (
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          {formatSeguidores(totalSeguidores)} seguidores
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Canais Oficiais */}
                  {redesOficiais.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-2">
                        Canais Oficiais
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {redesOficiais.map((rede) => {
                          const cfg = plataformaConfig[rede.plataforma] || plataformaConfig.instagram;
                          const Icon = cfg.icon;

                          return (
                            <a
                              key={rede.id}
                              href={rede.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                              style={{ backgroundColor: 'var(--surface)' }}
                            >
                              <Icon className={`w-5 h-5 ${cfg.color}`} />
                              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                {rede.plataforma === 'whatsapp' ? 'WhatsApp' : rede.usuario}
                              </span>
                              {rede.seguidores && (
                                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                                  {formatSeguidores(rede.seguidores)}
                                </span>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Canais Reserva */}
                  {redesReserva.length > 0 && (
                    <div>
                      <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mb-2">
                        Canais Reserva
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {redesReserva.map((rede) => {
                          const cfg = plataformaConfig[rede.plataforma] || plataformaConfig.instagram;
                          const Icon = cfg.icon;

                          return (
                            <a
                              key={rede.id}
                              href={rede.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors opacity-80"
                              style={{ backgroundColor: 'var(--surface-hover)' }}
                            >
                              <Icon className={`w-5 h-5 ${cfg.color}`} />
                              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                {rede.plataforma === 'whatsapp' ? 'WhatsApp' : rede.usuario}
                              </span>
                              {rede.seguidores && (
                                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                                  {formatSeguidores(rede.seguidores)}
                                </span>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-6" style={{ borderTop: '1px solid var(--border)' }} />

      {/* De onde vem o dinheiro */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>De Onde Vem o Dinheiro</h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Transparência total sobre as fontes</p>
          </div>
        </div>

        {/* Barra de percentuais */}
        <div className="mb-4">
          <div className="h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--surface)' }}>
            <div className="bg-blue-500" style={{ width: "87.2%" }} title="Publicidade: 87.2%" />
            <div className="bg-yellow-500" style={{ width: "12.1%" }} title="AdSense: 12.1%" />
            <div className="bg-green-500" style={{ width: "0.7%" }} title="Doação direta: 0.7%" />
          </div>
        </div>

        {/* Legenda */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-hover)' }}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>Publicidade</span>
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>87,2%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-hover)' }}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>AdSense</span>
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>12,1%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-hover)' }}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>Doação direta</span>
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>0,7%</span>
          </div>
        </div>
      </div>

      {/* Botão Denunciar */}
      <Link
        href="/denunciar"
        className="flex items-center justify-center gap-2 w-full py-3 bg-transparent rounded-xl text-sm font-medium transition-colors"
        style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
      >
        <ShieldAlert className="w-4 h-4" />
        Denunciar perfil falso
      </Link>
    </div>
  );
}
