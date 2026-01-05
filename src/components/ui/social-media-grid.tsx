"use client";

import React from "react";
import Image from "next/image";
import { CarouselImage } from "./image-carousel"; // Reuse the same type

interface SocialMediaGridProps {
  images: CarouselImage[];
  maxGridItems?: number; // Maximum number of items to show in grid
  onClick?: (index: number) => void; // Handler for when an image is clicked
  className?: string;
}

export function SocialMediaGrid({
  images,
  maxGridItems = 6,
  onClick,
  className = "",
}: SocialMediaGridProps) {
  const totalImages = images.length;
  const displayCount = Math.min(totalImages, maxGridItems);
  const hasMoreImages = totalImages > maxGridItems;

  // Handle different layout patterns based on image count
  const getGridClassName = () => {
    if (totalImages === 1) return "grid-cols-1";
    if (totalImages === 2) return "grid-cols-2";
    if (totalImages === 3) return "grid-cols-2"; // Special 1+2 layout
    return "grid-cols-2 sm:grid-cols-3"; // 2x2 or 2x3 grid for 4+ images
  };

  // Helper to determine appropriate grid item sizing
  const getItemClassName = (total: number, index: number): string => {
    // For 3 images, make the first one span full width of first row
    if (total === 3 && index === 0) {
      return "col-span-2 aspect-[4/5] instagram-grid-item";
    }

    // Default 4:5 portrait layout (Instagram style)
    return "aspect-[4/5] instagram-grid-item";
  };

  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <div className={`grid ${getGridClassName()} gap-1`}>
        {images.slice(0, displayCount).map((image, index) => (
          <div
            key={image.id || index}
            className={getItemClassName(totalImages, index)}
            onClick={() => onClick && onClick(index)}
          >
            <Image
              src={image.url}
              alt={image.legenda || `Imagem ${index + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
              loading={index < 2 ? "eager" : "lazy"}
            />

            {/* Show "+" overlay for the last visible image if there are more */}
            {hasMoreImages && index === displayCount - 1 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">+{totalImages - maxGridItems + 1}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}