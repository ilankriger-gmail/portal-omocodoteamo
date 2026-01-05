"use client";

import { useEffect, useRef, useState } from "react";
import { Instagram, ExternalLink } from "lucide-react";

interface InstagramEmbedProps {
  url: string;
}

// Extrai o ID do post/reel do Instagram
function getInstagramPostId(url: string): string | null {
  const patterns = [
    /instagram\.com\/(p|reel|reels)\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[2]) {
      return match[2];
    }
  }
  return null;
}

export function InstagramEmbed({ url }: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const postId = getInstagramPostId(url);

  useEffect(() => {
    if (!postId || !containerRef.current) return;

    // Carrega o script do Instagram se ainda não foi carregado
    const loadInstagramScript = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).instgrm) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
          setHasError(true);
          setIsLoading(false);
        };
        document.body.appendChild(script);
      });
    };

    const initEmbed = async () => {
      try {
        await loadInstagramScript();

        // Processa os embeds do Instagram
        if ((window as any).instgrm?.Embeds) {
          (window as any).instgrm.Embeds.process();
        }

        // Aguarda um pouco para o embed carregar
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        setHasError(true);
        setIsLoading(false);
      }
    };

    initEmbed();
  }, [postId]);

  if (!postId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-pink-400 hover:underline"
      >
        <Instagram size={16} />
        Ver no Instagram
      </a>
    );
  }

  if (hasError) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-pink-500/30 rounded-xl hover:border-pink-500/50 transition-colors"
      >
        <div className="p-2 bg-pink-500/20 rounded-lg">
          <Instagram size={24} className="text-pink-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-medium">Ver post no Instagram</p>
          <p className="text-zinc-400 text-sm">Clique para abrir no Instagram</p>
        </div>
        <ExternalLink size={16} className="text-zinc-400" />
      </a>
    );
  }

  return (
    <div ref={containerRef} className="instagram-embed-container">
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-zinc-800/50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent"></div>
            <p className="text-zinc-400 text-sm">Carregando post do Instagram...</p>
          </div>
        </div>
      )}

      <blockquote
        className="instagram-media"
        data-instgrm-permalink={`https://www.instagram.com/p/${postId}/`}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: 0,
          borderRadius: "12px",
          margin: "0 auto",
          maxWidth: "540px",
          minWidth: "326px",
          padding: 0,
          width: "100%",
          display: isLoading ? "none" : "block",
        }}
      />
    </div>
  );
}
