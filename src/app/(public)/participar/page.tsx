import { Send, Heart, ExternalLink } from "lucide-react";
import { InscricaoForm } from "./inscricao-form";

export const metadata = {
  title: "Envie seu Sonho | Portal da Transparência O Moço do Te Amo",
  description: "Conte sua história e concorra a realizar seu sonho",
};

export default async function ParticiparPage() {
  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
          <Send className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Envie seu Sonho</h1>
        <p className="text-zinc-400 text-sm">
          Conte sua história e concorra a ter seu sonho realizado
        </p>
      </div>

      {/* Receba uma doação - Link do Bem (ANTES do formulário) */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Receba uma Doação</h2>
            <p className="text-zinc-500 text-xs">Cadastre-se no Link do Bem</p>
          </div>
        </div>

        <a
          href="https://linkdobem.org/?utm_campaign=teamo_MAIS&utm_source=site"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-2xl hover:from-red-500/30 hover:to-pink-500/30 transition-colors group"
        >
          <div>
            <p className="text-white font-medium text-sm mb-1">Link do Bem</p>
            <p className="text-zinc-400 text-xs">Plataforma para receber doações diretas</p>
          </div>
          <ExternalLink className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
        </a>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800 my-6" />

      {/* Formulário */}
      <div className="bg-zinc-900/50 rounded-2xl p-5 mb-6">
        <InscricaoForm />
      </div>

      {/* Aviso importante */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-4">
        <p className="text-yellow-400 text-xs font-semibold mb-1">Importante</p>
        <p className="text-zinc-300 text-xs leading-relaxed">
          O envio do seu sonho não garante que ele será escolhido. Recebemos muitas histórias e
          infelizmente não conseguimos atender a todos. Caso seu sonho seja selecionado, entraremos
          em contato pelo <span className="text-green-400 font-medium">WhatsApp</span>.
        </p>
      </div>

      {/* Info */}
      <div className="bg-zinc-900/50 rounded-2xl p-4">
        <p className="text-zinc-400 text-xs leading-relaxed text-center">
          Ao enviar sua história, você concorda em compartilhá-la para possível uso em nossos vídeos.
        </p>
      </div>
    </div>
  );
}
