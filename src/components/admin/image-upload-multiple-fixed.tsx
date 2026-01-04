"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Loader2, Plus } from "lucide-react";
import { CarouselImage } from "../ui/image-carousel";

type ImageUpload = {
  id: string; // ID temporário do lado do cliente
  file: File;
  previewUrl: string;
  uploading: boolean;
  progress: number;
  url?: string; // URL do servidor após upload
  legenda?: string;
  error?: string; // Error message if upload fails
};

interface ImageUploadMultipleProps {
  onImagesChange: (images: CarouselImage[]) => void;
  maxImages?: number;
  className?: string;
  initialImages?: CarouselImage[];
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

export function ImageUploadMultiple({
  onImagesChange,
  maxImages = 10,
  className = "",
  initialImages = [],
  onUploadStart,
  onUploadComplete,
}: ImageUploadMultipleProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [allUploadsComplete, setAllUploadsComplete] = useState(true);
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

  // Debug effect to track image state changes
  useEffect(() => {
    console.log(`[Debug] Image state updated, now has ${images.length} images`);
    console.log(`[Debug] Images with URLs: ${images.filter(img => img.url).length}`);
  }, [images]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check file count limit
    if (images.length + files.length > maxImages) {
      alert(`Você pode adicionar no máximo ${maxImages} imagens`);
      return;
    }

    // Validate file types and sizes before uploading
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles: string[] = [];

    // Check each file for validity
    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} (tipo não permitido)`);
      } else if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (tamanho excede 5MB)`);
      }
    });

    // Alert if there are invalid files
    if (invalidFiles.length > 0) {
      alert(`Os seguintes arquivos não puderam ser adicionados:\n${invalidFiles.join('\n')}`);

      // If all files are invalid, return early
      if (invalidFiles.length === files.length) {
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
    }

    // Filter out invalid files
    const validFiles = files.filter(file =>
      allowedTypes.includes(file.type) && file.size <= maxSize
    );

    // Create preview images for valid files
    const newImages = validFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      previewUrl: URL.createObjectURL(file),
      uploading: true,
      progress: 0,
      legenda: "",
    }));

    setImages((prev) => [...prev, ...newImages]);
    setAllUploadsComplete(false);

    if (onUploadStart) {
      onUploadStart();
    }

    // Log upload start
    console.log(`Starting upload of ${newImages.length} images`);

    // Upload files in parallel with better error handling
    try {
      const uploadResults = await Promise.allSettled(newImages.map(uploadFile));

      // Log results
      console.log("Upload results:", uploadResults);

      // Handle completed uploads - both fulfilled and rejected
      uploadResults.forEach((result, index) => {
        const image = newImages[index];
        if (result.status === 'fulfilled') {
          // Success
          console.log(`Successfully uploaded: ${image.file.name}`);
        } else {
          // Failed - already handled in uploadFile
          console.error(`Failed to upload: ${image.file.name}`, result.reason);
        }
      });

    } catch (error) {
      console.error("Error in Promise.allSettled:", error);
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setAllUploadsComplete(true);

      // Update parent with successfully uploaded images
      updateParentWithImages();

      if (onUploadComplete) {
        onUploadComplete();
      }

      console.log("Upload process completed");
    }
  };

  const uploadFile = async (image: ImageUpload) => {
    console.log(`Starting upload for ${image.file.name}`);
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
        console.log(`File uploaded: ${image.file.name} -> ${data.url}`);

        // Immediately update the image with the URL
        setImages((prev) => {
          const newImages = prev.map((img) =>
            img.id === image.id
              ? { ...img, uploading: false, url: data.url }
              : img
          );

          // Immediately call updateParentWithImages after state update
          setTimeout(() => updateParentWithImages(), 0);

          return newImages;
        });

        // Return success
        return data.url;
      } else {
        let errorMessage;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || "Erro ao fazer upload";
        } catch {
          errorMessage = `Erro HTTP ${res.status}`;
        }

        console.error(`Upload error for ${image.file.name}:`, errorMessage);

        // Update image with error
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, uploading: false, error: errorMessage }
              : img
          )
        );

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(`Error uploading ${image.file.name}:`, error);

      // Make sure to update state even for unexpected errors
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, uploading: false, error: error.message || "Erro desconhecido" }
            : img
        )
      );

      throw error;
    }
  };

  const removeImage = (id: string) => {
    console.log(`Removing image with ID: ${id}`);
    setImages((prev) => prev.filter((img) => img.id !== id));

    // Use setTimeout to ensure state has updated before calling updateParentWithImages
    setTimeout(() => {
      updateParentWithImages();
    }, 0);
  };

  const updateParentWithImages = useCallback(() => {
    // Only send successfully uploaded images to parent (not uploading, has URL, no error)
    const uploadedImages = images
      .filter((img) => !img.uploading && img.url && !img.error)
      .map((img) => ({
        id: img.id,
        url: img.url!,
        legenda: img.legenda,
      }));

    console.log(`Updating parent with ${uploadedImages.length} images`);
    console.log("Image data:", JSON.stringify(uploadedImages.map(img => ({ id: img.id, url: img.url.substring(0, 20) + '...' })), null, 2));

    // Force update to the parent component
    onImagesChange(uploadedImages);
  }, [images, onImagesChange]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Debug info - helps troubleshoot image upload issues */}
      <div className="p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs mb-2">
        <p className="text-blue-400">Status: {allUploadsComplete ? 'Pronto' : 'Enviando...'}</p>
        <p className="text-blue-400">Total de imagens: {images.length}</p>
        <p className="text-blue-400">Imagens com URL: {images.filter(img => !img.uploading && img.url && !img.error).length}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800"
          >
            <img
              src={image.previewUrl}
              alt="Prévia"
              className="w-full h-full object-cover"
            />

            {/* Upload status indicators */}
            {image.uploading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-white mb-2" size={24} />
                <p className="text-white text-xs">Enviando...</p>
              </div>
            )}

            {/* Error indicator */}
            {image.error && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <X className="text-red-500 mb-2" size={24} />
                <p className="text-red-400 text-xs text-center px-2">
                  Erro ao enviar
                </p>
              </div>
            )}

            {/* Simple control - just remove button */}
            <button
              type="button"
              onClick={() => removeImage(image.id)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-500"
              title="Remover imagem"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Add image button */}
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Empty state - shown when no images are selected */}
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

      {/* Upload status indicator */}
      {!allUploadsComplete && (
        <div className="text-center text-sm text-green-400 mt-2">
          <Loader2 className="animate-spin inline-block mr-2 align-middle" size={16} />
          Enviando imagens...
        </div>
      )}
    </div>
  );
}