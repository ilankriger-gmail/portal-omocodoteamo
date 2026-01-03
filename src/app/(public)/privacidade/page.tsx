import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Portal da Transparência O Moço do Te Amo",
  description: "Conheça nossa política de privacidade e como protegemos seus dados pessoais.",
  openGraph: {
    title: "Política de Privacidade | Portal da Transparência O Moço do Te Amo",
    description: "Conheça nossa política de privacidade e como protegemos seus dados pessoais.",
  },
};

export default function PoliticaPrivacidadePage() {
  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 text-blue-500" />
        </div>
        <h1 className="text-lg font-semibold text-white mb-1">Política de Privacidade</h1>
        <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
          Como protegemos seus dados e respeitamos sua privacidade
        </p>
      </div>

      {/* Conteúdo */}
      <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold mb-2">1. Introdução</h2>
          <p>
            O Portal da Transparência "O Moço do Te Amo" valoriza a privacidade dos seus usuários e está comprometido em proteger suas informações pessoais. Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos suas informações quando você utiliza nosso site.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">2. Informações que Coletamos</h2>
          <p>
            Podemos coletar as seguintes informações:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Informações de identificação pessoal (nome, e-mail, telefone) quando você envia um sonho, faz uma denúncia ou entra em contato conosco.</li>
            <li>Informações de doação quando você contribui para uma campanha.</li>
            <li>Dados de uso do site, como endereço IP, tipo de navegador, tempo gasto no site e páginas visualizadas.</li>
            <li>Cookies e tecnologias semelhantes para melhorar sua experiência de navegação.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">3. Como Usamos suas Informações</h2>
          <p>
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Processar pedidos de ajuda e doações.</li>
            <li>Responder a suas perguntas e solicitações.</li>
            <li>Melhorar nossos serviços e desenvolver novos recursos.</li>
            <li>Enviar atualizações sobre campanhas que você apoiou (mediante seu consentimento).</li>
            <li>Cumprir obrigações legais e regulatórias.</li>
            <li>Prevenir fraudes e abusos em nossa plataforma.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">4. Compartilhamento de Informações</h2>
          <p>
            Podemos compartilhar suas informações com:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Parceiros de processamento de pagamentos para processar doações.</li>
            <li>Provedores de serviços que nos ajudam a operar o site e cumprir nossos objetivos.</li>
            <li>Autoridades governamentais quando exigido por lei ou para proteger nossos direitos.</li>
          </ul>
          <p className="mt-2">
            Não vendemos, alugamos ou trocamos suas informações pessoais com terceiros para fins de marketing.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">5. Segurança</h2>
          <p>
            Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, perda ou alteração. No entanto, nenhum sistema é completamente seguro, e não podemos garantir a segurança absoluta de suas informações.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">6. Seus Direitos</h2>
          <p>
            Você tem os seguintes direitos em relação às suas informações pessoais:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Acesso: solicitar acesso às suas informações pessoais.</li>
            <li>Retificação: corrigir informações imprecisas ou incompletas.</li>
            <li>Exclusão: solicitar a remoção de suas informações pessoais.</li>
            <li>Restrição: solicitar a limitação do processamento de suas informações.</li>
            <li>Portabilidade: receber suas informações em formato estruturado para transferi-las a outro provedor.</li>
            <li>Oposição: opor-se ao processamento de suas informações para fins específicos.</li>
          </ul>
          <p className="mt-2">
            Para exercer seus direitos, entre em contato conosco através do e-mail: contato@omocodoteamo.com.br
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">7. Alterações à Política de Privacidade</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas de informação ou regulamentações aplicáveis. Recomendamos que você revise esta página regularmente para estar ciente de quaisquer alterações.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">8. Contato</h2>
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade ou nossas práticas de privacidade, entre em contato conosco pelo e-mail: contato@omocodoteamo.com.br
          </p>
        </section>

        <p className="text-zinc-400 text-xs mt-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}