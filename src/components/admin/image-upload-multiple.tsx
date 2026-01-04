"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, Plus, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselImage } from "../ui/image-carousel";

type ImageUpload = {
  id: string; // ID temporário do lado do cliente
  file: File;
  previewUrl: string;
  uploading: boolean;
  progress: number;
  url?: string; // URL do servidor após upload
  legenda?: string;
};

interface ImageUploadMultipleProps {
  onImagesChange: (images: CarouselImage[]) => void;
  maxImages?: number;
  className?: string;
  initialImages?: CarouselImage[];
}

export function ImageUploadMultiple({
  onImagesChange,
  maxImages = 10,
  className = "",
  initialImages = [],
}: ImageUploadMultipleProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageUpload[]>(() =>
    initialImages.map(img => ({
      id: img.id,
      file: new File([], "placeholder"),
      previewUrl: img.url,
      uploading: false,
      progress: 100,
      url: img.url,
      legenda: img.legenda
    }))
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`Você pode adicionar no máximo ${maxImages} imagens`);
      return;
    }

    // Create preview images
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      previewUrl: URL.createObjectURL(file),
      uploading: true,
      progress: 0,
      legenda: "",
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Upload each file
    for (const newImage of newImages) {
      await uploadFile(newImage);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (image: ImageUpload) => {
    try {
      const formData = new FormData();
      formData.append("file", image.file);
      formData.append("type", "atualizacao");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, uploading: false, url: data.url }
              : img
          )
        );

        // Update parent component with all successful uploads
        updateParentWithImages();
      } else {
        handleUploadError(image);
      }
    } catch (error) {
      handleUploadError(image);
    }
  };

  const handleUploadError = (image: ImageUpload) => {
    alert(`Erro ao fazer upload da imagem ${image.file.name}`);
    setImages((prev) => prev.filter((img) => img.id !== image.id));
    updateParentWithImages();
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    updateParentWithImages();
  };

  const updateLegenda = (id: string, legenda: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, legenda } : img))
    );
    updateParentWithImages();
  };

  const updateParentWithImages = useCallback(() => {
    const uploadedImages = images
      .filter((img) => !img.uploading && img.url)
      .map((img) => ({
        id: img.id,
        url: img.url!,
        legenda: img.legenda,
      }));

    onImagesChange(uploadedImages);
  }, [images, onImagesChange]);

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    setImages(newImages);
    setTimeout(() => updateParentWithImages(), 0);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800"
          >
            <img
              src={image.previewUrl}
              alt="Prévia"
              className="w-full h-full object-cover"
            />

            {image.uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="text-red-400 hover:text-red-300 p-1"
                title="Remover imagem"
              >
                <X size={14} />
              </button>

              <button
                type="button"
                onClick={() => {
                  const legenda = prompt("Legenda da imagem:", image.legenda);
                  if (legenda !== null) updateLegenda(image.id, legenda);
                }}
                className="text-blue-400 hover:text-blue-300 p-1"
                title="Adicionar legenda"
              >
                <Edit size={14} />
              </button>

              <div className="flex-grow text-center text-xs text-zinc-400">
                {index + 1}/{images.length}
              </div>

              <button
                type="button"
                onClick={() => moveImage(index, index - 1)}
                disabled={index === 0}
                className={`p-1 ${
                  index === 0 ? "text-zinc-600 cursor-not-allowed" : "text-zinc-400 hover:text-white"
                }`}
                title="Mover para esquerda"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                type="button"
                onClick={() => moveImage(index, index + 1)}
                disabled={index === images.length - 1}
                className={`p-1 ${
                  index === images.length - 1
                    ? "text-zinc-600 cursor-not-allowed"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Mover para direita"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-zinc-900 border border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-zinc-500 transition-colors"
          >
            <Plus size={24} className="text-zinc-500" />
            <span className="text-xs text-zinc-500">
              Adicionar imagem
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-zinc-600 transition-colors"
        >
          <Upload className="mx-auto text-zinc-500 mb-2" size={32} />
          <p className="text-zinc-400 text-sm">
            Clique para selecionar imagens para o carrossel
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            JPG, PNG, GIF ou WEBP (máx. 5MB cada)
          </p>
        </div>
      )}
    </div>
  );
}