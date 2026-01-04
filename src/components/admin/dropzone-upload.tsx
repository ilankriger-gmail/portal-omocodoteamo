"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload, X, Plus } from "lucide-react";
import { CarouselImage } from "../ui/image-carousel";
import { DropzoneUploadProps, ImageUploadState } from "@/types/dropzone";

export function DropzoneUpload({
  onImagesChange,
  maxImages = 10,
  className = "",
  initialImages = [],
  onUploadStart,
  onUploadComplete,
  dropzoneOptions = {},
}: DropzoneUploadProps) {
  const [images, setImages] = useState<ImageUploadState[]>(() =>
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
  const [allUploadsComplete, setAllUploadsComplete] = useState(true);

  // Debug effect to log state changes
  useEffect(() => {
    console.log(`[DropzoneUpload] State updated: ${images.length} images`);
    console.log(`[DropzoneUpload] Images with URLs: ${images.filter(img => img.url).length}`);
  }, [images]);

  // Update parent with successfully uploaded images
  const updateParentWithImages = useCallback(() => {
    // Only send successfully uploaded images to parent
    const uploadedImages = images
      .filter((img) => !img.uploading && img.url && !img.error)
      .map((img) => ({
        id: img.id,
        url: img.url!,
        legenda: img.legenda,
      }));

    console.log(`[DropzoneUpload] Updating parent with ${uploadedImages.length} images`);

    if (uploadedImages.length > 0) {
      console.log("[DropzoneUpload] Sample image data:", uploadedImages[0].id);
    }

    onImagesChange(uploadedImages);
  }, [images, onImagesChange]);

  // Update parent component whenever images state changes
  useEffect(() => {
    updateParentWithImages();
  }, [images, updateParentWithImages]);

  // Handle files dropped or selected
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`Você pode adicionar no máximo ${maxImages} imagens`);
      return;
    }

    // Validate file sizes
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles = acceptedFiles.filter(file => file.size > maxSize);

    if (invalidFiles.length > 0) {
      alert(`Os seguintes arquivos excedem o tamanho máximo de 5MB:\n${invalidFiles.map(f => f.name).join('\n')}`);

      if (invalidFiles.length === acceptedFiles.length) {
        return;
      }
    }

    // Filter out invalid files
    const validFiles = acceptedFiles.filter(file => file.size <= maxSize);

    // Create preview for each new image
    const newImages = validFiles.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      previewUrl: URL.createObjectURL(file),
      uploading: true,
      progress: 0,
      legenda: "",
    }));

    // Update state with new images
    setImages(prev => [...prev, ...newImages]);
    setAllUploadsComplete(false);

    // Notify parent that upload has started
    if (onUploadStart) {
      onUploadStart();
    }

    console.log(`[DropzoneUpload] Starting upload of ${newImages.length} images`);

    try {
      // Upload all files in parallel
      const uploadPromises = newImages.map(uploadFile);
      await Promise.allSettled(uploadPromises);

      console.log("[DropzoneUpload] All uploads completed or failed");
    } catch (error) {
      console.error("[DropzoneUpload] Error in upload process:", error);
    } finally {
      // Mark all uploads as complete
      setAllUploadsComplete(true);

      // Notify parent that all uploads are complete
      if (onUploadComplete) {
        onUploadComplete();
      }
    }
  }, [images, maxImages, onUploadStart, onUploadComplete, uploadFile]);

  // Remove an image
  const removeImage = useCallback((id: string) => {
    console.log(`[DropzoneUpload] Removing image: ${id}`);

    // Remove from state
    setImages(prev => prev.filter(img => img.id !== id));

    // Clean up object URL to prevent memory leaks
    const image = images.find(img => img.id === id);
    if (image && image.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(image.previewUrl);
    }
  }, [images]);

  // Set up dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': []
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop,
    disabled: images.length >= maxImages,
    ...dropzoneOptions
  });

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
    };
  }, [images]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Debug info panel */}
      <div className="p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs">
        <p className="text-blue-400 font-medium">Status do Upload:</p>
        <p className="text-blue-400">Estado: {allUploadsComplete ? 'Pronto' : 'Enviando...'}</p>
        <p className="text-blue-400">Total: {images.length} imagens</p>
        <p className="text-blue-400">
          Prontas: {images.filter(img => !img.uploading && img.url && !img.error).length} |
          Em progresso: {images.filter(img => img.uploading).length} |
          Com erro: {images.filter(img => img.error).length}
        </p>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
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

              {/* Upload status indicator */}
              {image.uploading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-white mb-2" size={24} />
                  <p className="text-white text-xs">Enviando...</p>
                </div>
              )}

              {/* Error indicator */}
              {image.error && (
                <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center">
                  <X className="text-red-100 mb-2" size={24} />
                  <p className="text-red-100 text-xs text-center px-2">
                    Erro ao enviar
                  </p>
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-500 shadow-md"
                title="Remover imagem"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Add more button (if below max) */}
          {images.length < maxImages && (
            <div
              {...getRootProps()}
              className={`aspect-square cursor-pointer bg-zinc-900 border border-dashed rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
                isDragActive
                  ? isDragAccept
                    ? "border-green-500 bg-green-900/20"
                    : "border-red-500 bg-red-900/20"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              <input {...getInputProps()} />
              <Plus size={24} className="text-zinc-500" />
              <span className="text-xs text-zinc-500">
                {isDragActive
                  ? isDragAccept
                    ? "Solte para adicionar"
                    : "Arquivo não suportado"
                  : "Adicionar imagem"
                }
              </span>
            </div>
          )}
        </div>
      )}

      {/* Empty state dropzone */}
      {images.length === 0 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? isDragAccept
                ? "border-green-500 bg-green-900/20"
                : "border-red-500 bg-red-900/20"
              : "border-zinc-700 hover:border-zinc-600"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto text-zinc-500 mb-2" size={32} />
          <p className="text-zinc-400 text-sm">
            {isDragActive
              ? isDragAccept
                ? "Solte as imagens aqui"
                : "Apenas imagens são aceitas"
              : "Arraste imagens aqui ou clique para selecionar"
            }
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