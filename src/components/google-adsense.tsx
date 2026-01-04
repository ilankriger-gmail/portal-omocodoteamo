"use client";

import { useEffect } from "react";

interface GoogleAdSenseProps {
  adClient: string | null;
  adSlot?: string;
  adFormat?: string;
  adLayout?: string;
  adStyle?: React.CSSProperties;
  className?: string;
}

export function GoogleAdSense({
  adClient,
  adSlot = "",
  adFormat = "auto",
  adLayout,
  adStyle = { display: "block" },
  className = "",
}: GoogleAdSenseProps) {
  // Temporariamente desativado para resolver problemas de build na Vercel
  // Não faz mais nada independente dos parâmetros passados
  return null;

  /* Código original comentado para referência futura
  useEffect(() => {
    // Skip if we don't have a client ID
    if (!adClient) return;

    // Check if script is already loaded
    const hasScript = document.querySelectorAll(
      'script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    ).length > 0;

    if (!hasScript) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Try to load the ad
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, [adClient]);

  // Don't render anything if we don't have a client ID
  if (!adClient) return null;
  */

  // Componente completamente desabilitado
  // O return null acima impede que este código seja executado
  return null;
}