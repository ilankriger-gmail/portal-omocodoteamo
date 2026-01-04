import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { ShieldAlert, Users } from "lucide-react";
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaWhatsapp,
  FaXTwitter,
  FaThreads,
} from "react-icons/fa6";
import { DenunciaForm } from "./denuncia-form";

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
  title: "Denuncie Perfis Falsos | Portal da Transparência O Moço do Te Amo",
  description: "Conheça nossos perfis oficiais e denuncie impostores",
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

async function getData() {
  return prisma.perfilSocial.findMany({
    orderBy: { ordem: "asc" },
    include: {
      redesSociais: {
        orderBy: { ordem: "asc" }
      }
    }
  });
}

export default async function DenunciarPage() {
  const perfis = await getData();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Denuncie Perfis Falsos</h1>
        <p className="text-zinc-400 text-sm">
          Nos ajude a combater golpistas
        </p>
      </div>

      {/* Alerta Principal */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
        <p className="text-red-400 text-sm font-semibold mb-2">
          NUNCA solicito pagamento ou depósito.
        </p>
        <p className="text-zinc-400 text-xs leading-relaxed">
          Se alguém pediu dinheiro para &quot;destravar&quot; um prêmio, você está sendo vítima de um golpe.
          Verifique sempre os perfis oficiais abaixo.
        </p>
      </div>

      {/* Como os Golpistas Operam */}
      <div className="bg-zinc-900/50 rounded-2xl p-4 mb-6">
        <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wider mb-3 block">
          Como os Golpistas Operam
        </span>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="text-white text-sm font-medium">Criam perfis falsos</p>
              <p className="text-zinc-500 text-xs">Usam meus vídeos, fotos e até o mesmo nome para parecerem reais</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="text-white text-sm font-medium">Usam @ parecidos</p>
              <p className="text-zinc-500 text-xs">Trocam letras, adicionam números ou underlines para imitar os perfis oficiais</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="text-white text-sm font-medium">Conseguem alguns seguidores</p>
              <p className="text-zinc-500 text-xs">Para parecer legítimo, compram ou atraem seguidores falsos</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              4
            </div>
            <div>
              <p className="text-white text-sm font-medium">Adicionam vítimas e oferecem &quot;prêmios&quot;</p>
              <p className="text-zinc-500 text-xs">Dizem que você ganhou algo, mas precisa fazer um depósito para &quot;destravar&quot;</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              !
            </div>
            <div>
              <p className="text-red-400 text-sm font-medium">Isso é GOLPE!</p>
              <p className="text-zinc-500 text-xs">Nunca peço depósito antecipado. Todas as ações são divulgadas nos perfis oficiais.</p>
            </div>
          </div>
        </div>

        {/* Botão Denunciar */}
        <a
          href="#denunciar"
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <ShieldAlert className="w-4 h-4" />
          Denunciar Perfil Falso
        </a>
      </div>

      {/* Perfis Oficiais - Widget igual ao Quem Somos */}
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

      {/* Formulário */}
      <div id="denunciar">
        <DenunciaForm />
      </div>
    </div>
  );
}
