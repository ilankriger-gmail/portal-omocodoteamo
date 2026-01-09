import { prisma } from "@/lib/prisma";
import { HelpCircle } from "lucide-react";
import { FAQAccordion } from "./faq-accordion";
import type { Metadata } from "next";

// Definimos a página como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: "Dúvidas Frequentes | Portal da Transparência O Moço do Te Amo",
  description: "Encontre respostas para as perguntas mais comuns sobre o Portal da Transparência e como ajudamos pessoas.",
  openGraph: {
    title: "Dúvidas Frequentes | Portal da Transparência O Moço do Te Amo",
    description: "Encontre respostas para as perguntas mais comuns sobre o Portal da Transparência e como ajudamos pessoas.",
    type: "website",
  },
};

// FAQs padrão para fallback se o banco estiver vazio
const faqsPadrao = [
  {
    id: "default-1",
    pergunta: "Como posso enviar meu sonho para ser realizado?",
    resposta: "Acesse a aba 'Envie seu Sonho' e preencha o formulário com seus dados e a descrição do que você precisa. Nossa equipe analisa todas as solicitações com carinho e atenção.",
  },
  {
    id: "default-2",
    pergunta: "Como funciona a seleção dos sonhos?",
    resposta: "Recebemos milhares de pedidos e analisamos cada um com muito cuidado. A seleção leva em conta a necessidade, a história e a viabilidade de cada caso. Infelizmente não conseguimos ajudar a todos, mas fazemos o máximo possível.",
  },
  {
    id: "default-3",
    pergunta: "O que são as 'Minhas Vaquinhas'?",
    resposta: "São campanhas selecionadas pela ONG do Te Amo ou solicitadas por seguidores após nossos vídeos. Criamos essas vaquinhas para ajudar pessoas que precisam de uma força extra.",
  },
  {
    id: "default-4",
    pergunta: "O que são as 'Vaquinhas que Apoio'?",
    resposta: "São campanhas da Oficina de Sonhos em parceria com a Vakinha, ou de pessoas que apareceram nos nossos vídeos e já tinham sua própria vaquinha. Divulgamos para ajudar a alcançar mais pessoas.",
  },
  {
    id: "default-5",
    pergunta: "Como posso doar para uma vaquinha?",
    resposta: "Basta acessar a vaquinha desejada e clicar em 'Quero Ajudar'. Você pode doar via PIX (a chave aparece na página) ou através do link oficial da Vakinha.",
  },
];

export default async function DuvidasPage() {
  // Buscar FAQs do banco de dados
  let faqs = await prisma.fAQ.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
  });

  // Se não houver FAQs no banco, usar as padrão
  if (faqs.length === 0) {
    faqs = faqsPadrao.map((f, i) => ({
      ...f,
      ordem: i,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
          <HelpCircle className="w-6 h-6 text-blue-500" />
        </div>
        <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Principais Dúvidas</h1>
        <p className="text-xs leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--muted)' }}>
          Respostas para as perguntas mais frequentes sobre o portal e como ajudamos as pessoas.
        </p>
      </div>

      {/* Lista de FAQs */}
      <FAQAccordion faqs={faqs} />

      {/* Info adicional */}
      <div className="mt-6 rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--card-bg)' }}>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
          Não encontrou o que procurava? Entre em contato conosco pelas redes sociais!
        </p>
      </div>
    </div>
  );
}
