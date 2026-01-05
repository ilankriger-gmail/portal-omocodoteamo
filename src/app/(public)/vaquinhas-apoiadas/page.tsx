import { HandHeart } from "lucide-react";
import { VaquinhasList } from "./vaquinhas-list";

export const metadata = {
  title: "Vaquinhas que Apoio | Portal da Transparência O Moço do Te Amo",
  description: "Outras causas que apoiamos e recomendamos",
};

export default function VaquinhasApoiadasPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
          <HandHeart className="w-8 h-8 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Vaquinhas que Apoio</h1>
        <p className="text-zinc-400 text-base leading-relaxed max-w-lg mx-auto">
          Campanhas da Oficina de Sonhos em parceria com a Vakinha, ou de pessoas
          que apareceram nos nossos vídeos e já tinham sua própria vaquinha.
        </p>
      </div>

      {/* Lista de vaquinhas com botão de atualizar */}
      <VaquinhasList />

      {/* Info */}
      <div className="mt-6 bg-zinc-900/50 rounded-xl p-4">
        <p className="text-zinc-400 text-sm leading-relaxed text-center">
          Conhece uma causa que merece apoio? Entre em contato conosco nas redes sociais.
        </p>
      </div>
    </div>
  );
}
