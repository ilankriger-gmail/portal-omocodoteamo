"use client";

import React from "react";
import { ImageCarousel, CarouselImage } from "./image-carousel";

interface SocialMediaViewerProps {
  images: CarouselImage[];
  className?: string;
  showCaptions?: boolean;
}

export function SocialMediaViewer({
  images,
  className = "",
  showCaptions = true,
}: SocialMediaViewerProps) {
  return (
    <div className={className}>
      <ImageCarousel
        images={images}
        showCaptions={showCaptions}
      />
    </div>
  );
}
