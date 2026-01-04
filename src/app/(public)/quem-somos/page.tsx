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
  threads: { icon: FaThreads, color: "text-white" },
  tiktok: { icon: FaTiktok, color: "text-white" },
  youtube: { icon: FaYoutube, color: "text-red-500" },
  facebook: { icon: FaFacebook, color: "text-blue-500" },
  kwai: { icon: KwaiIcon, color: "text-orange-500" },
  whatsapp: { icon: FaWhatsapp, color: "text-green-500" },
  x: { icon: FaXTwitter, color: "text-white" },
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
            <div className="p-[3px] rounded-full bg-black">
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
          <h1 className="text-xl font-semibold text-white mb-1">O Moço do Te Amo</h1>

          {parceiro && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-zinc-400 text-xs mb-3">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {parceiro.localizacao}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Desde {parceiro.ativoDesde}
              </span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex gap-5">
            <div>
              <span className="block text-lg font-semibold text-white">
                {parceiro?.vaquinhasCriadas || 116}
              </span>
              <span className="text-zinc-500 text-xs">vaquinhas</span>
            </div>
            <div>
              <span className="block text-lg font-semibold text-white">
                {parceiro ? formatCurrency(parceiro.valorArrecadadoNum) : "R$ 1M+"}
              </span>
              <span className="text-zinc-500 text-xs">arrecadados</span>
            </div>
            <div>
              <span className="block text-lg font-semibold text-white">
                {parceiro ? formatSeguidores(parceiro.pessoasImpactadas) : "34K"}
              </span>
              <span className="text-zinc-500 text-xs">pessoas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {config?.biografia && (
        <div className="mb-6">
          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
            {config.biografia}
          </p>
        </div>
      )}

      {/* Causas */}
      {parceiro?.causas && (
        <div className="flex flex-wrap gap-2 mb-6">
          {parceiro.causas.map((causa: string, i: number) => (
            <span key={i} className="px-3 py-1 bg-zinc-900 rounded-full text-zinc-400 text-xs">
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
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg mb-6 transition-colors"
      >
        <TrendingUp size={16} />
        Ver perfil completo na Vakinha
      </a>

      {/* Divider */}
      <div className="border-t border-zinc-800 my-6" />

      {/* Perfis Oficiais */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Perfis Oficiais
          </span>
          <span className="text-xs text-zinc-600">• únicos verificados</span>
        </div>

        {perfis.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nenhum perfil cadastrado</p>
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
                <div key={perfil.id} className="bg-zinc-900/50 rounded-2xl p-4">
                  {/* Perfil Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                      <div className="p-[2px] rounded-full bg-zinc-900">
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
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <Users className="w-5 h-5 text-zinc-600" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm">{perfil.nome}</h3>
                      {totalSeguidores > 0 && (
                        <p className="text-zinc-500 text-xs">
                          {formatSeguidores(totalSeguidores)} seguidores
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Canais Oficiais */}
                  {redesOficiais.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider mb-2">
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
                              className="flex items-center gap-2 px-3 py-2 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-xl transition-colors"
                            >
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                              <span className="text-white text-xs font-medium">{rede.usuario}</span>
                              {rede.seguidores && (
                                <span className="text-zinc-500 text-xs">
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
                      <p className="text-[10px] text-yellow-400 font-semibold uppercase tracking-wider mb-2">
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
                              className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl transition-colors opacity-80"
                            >
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                              <span className="text-white text-xs font-medium">{rede.usuario}</span>
                              {rede.seguidores && (
                                <span className="text-zinc-500 text-xs">
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
      <div className="border-t border-zinc-800 my-6" />

      {/* De onde vem o dinheiro */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">De Onde Vem o Dinheiro</h2>
            <p className="text-zinc-500 text-xs">Transparência total sobre as fontes</p>
          </div>
        </div>

        {/* Barra de percentuais */}
        <div className="mb-4">
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden flex">
            <div className="bg-blue-500" style={{ width: "87.2%" }} title="Publicidade: 87.2%" />
            <div className="bg-yellow-500" style={{ width: "12.1%" }} title="AdSense: 12.1%" />
            <div className="bg-green-500" style={{ width: "0.7%" }} title="Doação direta: 0.7%" />
          </div>
        </div>

        {/* Legenda */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-white text-sm">Publicidade</span>
            </div>
            <span className="text-zinc-400 text-sm font-medium">87,2%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-white text-sm">AdSense</span>
            </div>
            <span className="text-zinc-400 text-sm font-medium">12,1%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-white text-sm">Doação direta</span>
            </div>
            <span className="text-zinc-400 text-sm font-medium">0,7%</span>
          </div>
        </div>
      </div>

      {/* Alerta */}
      <div className="bg-zinc-900/50 rounded-2xl p-4 mb-6">
        <p className="text-zinc-400 text-xs leading-relaxed">
          <span className="text-yellow-500 font-semibold">⚠️ Atenção:</span> Estes são os ÚNICOS perfis oficiais.
          Qualquer outro perfil pedindo dinheiro é GOLPE!
        </p>
      </div>

      {/* Botão Denunciar */}
      <Link
        href="/denunciar"
        className="flex items-center justify-center gap-2 w-full py-3 bg-transparent border border-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-sm font-medium transition-colors"
      >
        <ShieldAlert className="w-4 h-4" />
        Denunciar perfil falso
      </Link>
    </div>
  );
}
