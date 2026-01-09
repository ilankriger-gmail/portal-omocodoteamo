"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQ {
  id: string;
  pergunta: string;
  resposta: string;
  imagemUrl?: string | null;
  videoUrl?: string | null;
  botaoTexto?: string | null;
  botaoLink?: string | null;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

// Extrai o ID do vídeo do YouTube de várias URLs possíveis
function getYoutubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return null;
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {faqs.map((faq, index) => {
        const embedUrl = faq.videoUrl ? getYoutubeEmbedUrl(faq.videoUrl) : null;

        return (
          <div key={faq.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="text-sm font-medium pr-4" style={{ color: 'var(--foreground)' }}>{faq.pergunta}</span>
              {openIndex === index ? (
                <ChevronUp size={20} className="text-red-500 flex-shrink-0" />
              ) : (
                <ChevronDown size={20} className="flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
              )}
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 space-y-3">
                <div className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {faq.resposta
                    .split('\n')
                    .filter(line => line.trim() !== '')  // Remove linhas vazias
                    .map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                </div>

                {/* Imagem */}
                {faq.imagemUrl && (
                  <div className="mt-3">
                    <img
                      src={faq.imagemUrl}
                      alt="Imagem ilustrativa"
                      className="w-full max-w-md rounded-lg"
                    />
                  </div>
                )}

                {/* Vídeo do YouTube */}
                {embedUrl && (
                  <div className="mt-3 aspect-video max-w-md">
                    <iframe
                      src={embedUrl}
                      title="Vídeo explicativo"
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Botão com Link */}
                {faq.botaoTexto && faq.botaoLink && (
                  <div className="mt-4">
                    <a
                      href={faq.botaoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {faq.botaoTexto}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
