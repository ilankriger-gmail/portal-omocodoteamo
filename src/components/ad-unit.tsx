"use client";

import { useState, useEffect } from "react";
import { GoogleAdSense } from "./google-adsense";

interface AdUnitProps {
  adClient: string | null;
  adSlot?: string;
  adFormat?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export function AdUnit({
  adClient,
  adSlot = "",
  adFormat = "auto",
  className = "",
}: AdUnitProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Don't render anything if we don't have a client ID or during server rendering
  if (!adClient || !loaded) return null;

  return (
    <div className={`ad-container overflow-hidden ${className}`}>
      <div className="text-xs text-zinc-600 text-center mb-1 uppercase">Anúncio</div>
      <GoogleAdSense
        adClient={adClient}
        adSlot={adSlot}
        adFormat={adFormat}
        adStyle={{ display: "block", width: "100%" }}
      />
    </div>
  );
}