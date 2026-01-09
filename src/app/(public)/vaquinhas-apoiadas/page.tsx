import { HandHeart } from "lucide-react";
import { VaquinhasList } from "./vaquinhas-list";

export const metadata = {
  title: "Vaquinhas que Apoio | Portal da Transparência O Moço do Te Amo",
  description: "Outras causas que apoiamos e recomendamos",
};

export default function VaquinhasApoiadasPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--surface)' }}>
          <HandHeart className="w-6 h-6" style={{ color: 'var(--muted)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Vaquinhas que Apoio</h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
          Campanhas da Oficina de Sonhos em parceria com a Vakinha, ou de pessoas
          que apareceram nos nossos vídeos e já tinham sua própria vaquinha.
        </p>
      </div>

      {/* Lista de vaquinhas com botão de atualizar */}
      <VaquinhasList />

      {/* Info */}
      <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: 'var(--card-bg)' }}>
        <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
          Conhece uma causa que merece apoio? Entre em contato conosco nas redes sociais.
        </p>
      </div>
    </div>
  );
}
