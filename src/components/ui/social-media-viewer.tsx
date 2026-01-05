"use client";

import React, { useState } from "react";
import { ImageCarousel, CarouselImage } from "./image-carousel";
import { SocialMediaGrid } from "./social-media-grid";
import { ArrowLeft } from "lucide-react";

interface SocialMediaViewerProps {
  images: CarouselImage[];
  className?: string;
  showCaptions?: boolean;
  initialIndex?: number;
}

export function SocialMediaViewer({
  images,
  className = "",
  showCaptions = true,
  initialIndex = -1,
}: SocialMediaViewerProps) {
  const [showCarousel, setShowCarousel] = useState(initialIndex !== -1);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex !== -1 ? initialIndex : 0);

  // Handle click on grid item
  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setShowCarousel(true);
  };

  // Handle closing the carousel
  const handleCloseCarousel = () => {
    setShowCarousel(false);
  };

  return (
    <div className={`grid-carousel-transition ${className}`}>
      {/* Grid view */}
      {!showCarousel && (
        <SocialMediaGrid
          images={images}
          onClick={handleImageClick}
        />
      )}

      {/* Carousel view */}
      {showCarousel && (
        <div className="relative">
          <ImageCarousel
            images={images}
            showCaptions={showCaptions}
          />

          {/* Back button */}
          <button
            onClick={handleCloseCarousel}
            className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Voltar para visualização em grade"
          >
            <ArrowLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
}