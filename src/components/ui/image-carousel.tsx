"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

export type CarouselImage = {
  id: string;
  url: string;
  legenda?: string;
};

interface ImageCarouselProps {
  images: CarouselImage[];
  showDots?: boolean;
  showCaptions?: boolean;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function ImageCarousel({
  images,
  showDots = true,
  showCaptions = true,
  autoPlay = false,
  interval = 5000,
  className = "",
}: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Initialize and cleanup Embla Carousel
  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  // Autoplay functionality
  useEffect(() => {
    if (!autoPlay || !emblaApi) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, interval);

    return () => clearInterval(interval);
  }, [autoPlay, emblaApi, interval]);

  // Navigation functions
  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );

  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollPrev, scrollNext]);

  if (images.length === 0) return null;

  // If there's only one image, render it simply
  if (images.length === 1) {
    return (
      <div className={`relative w-full rounded-xl overflow-hidden ${className}`}>
        <div className="relative aspect-video">
          <Image
            src={images[0].url}
            alt={images[0].legenda || "Imagem da atualização"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            className="object-contain bg-zinc-900/50"
            priority
          />

          {showCaptions && images[0].legenda && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-sm">
              {images[0].legenda}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="relative min-w-full aspect-video"
            >
              <Image
                src={image.url}
                alt={image.legenda || `Imagem ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                className="object-contain bg-zinc-900/50"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
              />

              {showCaptions && image.legenda && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-sm">
                  {image.legenda}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={scrollPrev}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="Imagem anterior"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={scrollNext}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="Próxima imagem"
      >
        <ChevronRight size={20} />
      </button>

      {/* Indicator dots */}
      {showDots && (
        <div className="flex justify-center gap-1 mt-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedIndex ? "bg-green-500" : "bg-zinc-600"
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}