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

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        {...(adLayout ? { "data-ad-layout": adLayout } : {})}
      />
    </div>
  );
}