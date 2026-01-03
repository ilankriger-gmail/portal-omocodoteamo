import { Cookie } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies | Portal da Transparência O Moço do Te Amo",
  description: "Entenda como utilizamos cookies e outras tecnologias de rastreamento em nosso site.",
  openGraph: {
    title: "Política de Cookies | Portal da Transparência O Moço do Te Amo",
    description: "Entenda como utilizamos cookies e outras tecnologias de rastreamento em nosso site.",
  },
};

export default function PoliticaCookiesPage() {
  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
          <Cookie className="w-6 h-6 text-yellow-500" />
        </div>
        <h1 className="text-lg font-semibold text-white mb-1">Política de Cookies</h1>
        <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
          Como utilizamos cookies e outras tecnologias em nosso site
        </p>
      </div>

      {/* Conteúdo */}
      <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold mb-2">1. O que são Cookies</h2>
          <p>
            Cookies são pequenos arquivos de texto que são armazenados no seu navegador ou dispositivo quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem de maneira mais eficiente e fornecer informações aos proprietários do site.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">2. Como Usamos os Cookies</h2>
          <p>
            O Portal da Transparência "O Moço do Te Amo" utiliza cookies para:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Garantir o funcionamento adequado do site (cookies essenciais).</li>
            <li>Lembrar suas preferências e configurações (cookies de funcionalidade).</li>
            <li>Entender como você interage com nosso site, permitindo-nos melhorar a experiência (cookies analíticos).</li>
            <li>Oferecer conteúdo relevante com base nos seus interesses e atividades (cookies de marketing).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">3. Tipos de Cookies que Utilizamos</h2>

          <h3 className="text-white font-medium mt-3 mb-1">Cookies Essenciais</h3>
          <p>
            Necessários para o funcionamento básico do site. Eles permitem recursos fundamentais como navegação segura e acesso a áreas protegidas. O site não pode funcionar adequadamente sem estes cookies.
          </p>

          <h3 className="text-white font-medium mt-3 mb-1">Cookies de Preferências</h3>
          <p>
            Permitem que o site lembre de informações que mudam a forma como o site se comporta ou aparece, como seu idioma preferido ou a região em que você está.
          </p>

          <h3 className="text-white font-medium mt-3 mb-1">Cookies Estatísticos</h3>
          <p>
            Ajudam a entender como os visitantes interagem com o site coletando e relatando informações anonimamente. Utilizamos o Google Analytics para esta finalidade.
          </p>

          <h3 className="text-white font-medium mt-3 mb-1">Cookies de Marketing</h3>
          <p>
            São utilizados para rastrear visitantes em websites. A intenção é exibir anúncios relevantes e envolventes para o usuário individual.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">4. Cookies de Terceiros</h2>
          <p>
            Em alguns casos, usamos cookies fornecidos por terceiros confiáveis. Esta seção detalha quais cookies de terceiros você pode encontrar através deste site:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Este site usa o Google Analytics, que é uma das soluções de análise mais difundidas na internet, para nos ajudar a entender como você usa o site e como podemos melhorar sua experiência.</li>
            <li>Usamos botões de compartilhamento social que permitem compartilhar conteúdo em redes sociais. Esses sites podem definir cookies quando você está conectado aos seus serviços.</li>
            <li>Podemos usar cookies de publicidade para fornecer anúncios relevantes sobre o trabalho que realizamos.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">5. Como Gerenciar Cookies</h2>
          <p>
            Você pode controlar e/ou excluir cookies como desejar. Você pode excluir todos os cookies que já estão no seu computador e pode configurar a maioria dos navegadores para impedir que eles sejam colocados. Se você fizer isso, no entanto, pode ter que ajustar manualmente algumas preferências sempre que visitar um site e alguns serviços e funcionalidades podem não funcionar.
          </p>
          <p className="mt-2">
            Para saber mais sobre como gerenciar cookies em diferentes navegadores, visite os links abaixo:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Chrome: <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://support.google.com/chrome/answer/95647</a></li>
            <li>Firefox: <a href="https://support.mozilla.org/pt-BR/kb/ative-e-desative-os-cookies-que-os-sites-usam" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://support.mozilla.org/pt-BR/kb/ative-e-desative-os-cookies-que-os-sites-usam</a></li>
            <li>Safari: <a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://support.apple.com/pt-br/guide/safari/sfri11471/mac</a></li>
            <li>Internet Explorer: <a href="https://support.microsoft.com/pt-br/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://support.microsoft.com/pt-br/help/17442/windows-internet-explorer-delete-manage-cookies</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">6. Alterações na Política de Cookies</h2>
          <p>
            Podemos atualizar nossa Política de Cookies periodicamente para refletir, por exemplo, mudanças nos cookies que usamos ou por outros motivos operacionais, legais ou regulatórios. Por favor, visite esta página regularmente para se manter informado sobre o uso de cookies e tecnologias relacionadas.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">7. Contato</h2>
          <p>
            Se você tiver dúvidas sobre como usamos cookies ou outras tecnologias, por favor entre em contato conosco pelo e-mail: contato@omocodoamo.com.br
          </p>
        </section>

        <p className="text-zinc-400 text-xs mt-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}