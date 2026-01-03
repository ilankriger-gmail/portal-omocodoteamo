import { FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Serviço | Portal da Transparência O Moço do Te Amo",
  description: "Conheça os termos de serviço do nosso portal e as regras para uso da plataforma.",
  openGraph: {
    title: "Termos de Serviço | Portal da Transparência O Moço do Te Amo",
    description: "Conheça os termos de serviço do nosso portal e as regras para uso da plataforma.",
  },
};

export default function TermosServicoPage() {
  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6 text-purple-500" />
        </div>
        <h1 className="text-lg font-semibold text-white mb-1">Termos de Serviço</h1>
        <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
          Regras e condições para uso do Portal da Transparência
        </p>
      </div>

      {/* Conteúdo */}
      <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold mb-2">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar ou usar o Portal da Transparência "O Moço do Te Amo", você concorda em ficar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não poderá acessar ou usar nossos serviços.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">2. Descrição do Serviço</h2>
          <p>
            O Portal da Transparência "O Moço do Te Amo" é uma plataforma que visa proporcionar transparência sobre as doações e campanhas realizadas. Nossos serviços incluem, mas não se limitam a:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Exibir campanhas de arrecadação de fundos e seus detalhes.</li>
            <li>Facilitar a contribuição para campanhas.</li>
            <li>Fornecer atualizações sobre o andamento das campanhas.</li>
            <li>Permitir a submissão de pedidos de ajuda.</li>
            <li>Oferecer meios para denúncia de irregularidades.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">3. Cadastro e Conta</h2>
          <p>
            Alguns recursos do Portal podem requerer cadastro. Ao se cadastrar, você concorda em:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Fornecer informações verdadeiras, precisas e completas.</li>
            <li>Manter suas informações atualizadas.</li>
            <li>Manter a segurança de sua senha e conta.</li>
            <li>Ser totalmente responsável por todas as atividades que ocorrem em sua conta.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">4. Conduta do Usuário</h2>
          <p>
            Ao utilizar nosso Portal, você concorda em não:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Violar qualquer lei ou regulamento aplicável.</li>
            <li>Publicar ou transmitir conteúdo ilegal, ofensivo, difamatório ou fraudulento.</li>
            <li>Enviar informações falsas para obter benefícios.</li>
            <li>Tentar acessar áreas restritas do Portal sem autorização.</li>
            <li>Interferir na funcionalidade do site ou sobrecarregá-lo.</li>
            <li>Coletar informações de usuários sem consentimento.</li>
            <li>Usar o Portal para spam ou publicidade não solicitada.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">5. Doações e Campanhas</h2>
          <p>
            Ao fazer uma doação através do Portal:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Você está fazendo uma contribuição voluntária.</li>
            <li>Confirma que está legalmente autorizado a fazer a doação.</li>
            <li>Entende que processadores de pagamento terceirizados podem cobrar taxas.</li>
            <li>Reconhece que, em determinadas circunstâncias, as doações podem não ser reembolsáveis.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">6. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo disponível no Portal, incluindo textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais e softwares, é propriedade do Portal da Transparência "O Moço do Te Amo" ou de seus fornecedores de conteúdo e é protegido pelas leis de direitos autorais.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">7. Limitações de Responsabilidade</h2>
          <p>
            O Portal da Transparência "O Moço do Te Amo" não é responsável por:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Interrupções ou erros no funcionamento do site.</li>
            <li>Conteúdo fornecido por terceiros, incluindo links para sites externos.</li>
            <li>Qualquer perda ou dano resultante do uso ou incapacidade de usar nossos serviços.</li>
            <li>Violações de segurança que resultem na divulgação não autorizada de informações.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">8. Modificações</h2>
          <p>
            Reservamo-nos o direito de modificar ou substituir estes Termos de Serviço a qualquer momento. Notificaremos os usuários sobre mudanças significativas. O uso continuado do Portal após quaisquer alterações constitui aceitação dos novos termos.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">9. Encerramento</h2>
          <p>
            Podemos encerrar ou suspender seu acesso ao Portal imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, violação dos Termos de Serviço.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">10. Lei Aplicável</h2>
          <p>
            Estes Termos serão regidos e interpretados de acordo com as leis do Brasil. Qualquer disputa relacionada a estes termos será submetida à jurisdição exclusiva dos tribunais brasileiros.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">11. Contato</h2>
          <p>
            Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco pelo e-mail: contato@omocodoteamo.com.br
          </p>
        </section>

        <p className="text-zinc-400 text-xs mt-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}