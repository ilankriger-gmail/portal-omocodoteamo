"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload, X } from "lucide-react";
import { DropzoneUploadSingleProps } from "@/types/dropzone";

export function DropzoneUploadSingle({
  onImageChange,
  initialImage = "",
  className = "",
  imageType = "foto",
  onUploadStart,
  onUploadComplete,
  dropzoneOptions = {},
}: DropzoneUploadSingleProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialImage);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== initialImage && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, initialImage]);

  // Handle file drop/selection
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Only process the first file
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError(`O arquivo excede o tamanho máximo de 5MB`);
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setError(null);
    setUploading(true);

    // Notify parent upload has started
    if (onUploadStart) {
      onUploadStart();
    }

    console.log(`[DropzoneUploadSingle] Uploading file: ${file.name} (${file.type}, ${file.size} bytes)`);

    try {
      // Upload to server
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "atualizacao");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[DropzoneUploadSingle] Upload success: ${data.url}`);

        // Update state with URL from server
        setImageUrl(data.url);

        // Notify parent
        onImageChange(data.url);
      } else {
        let errorMessage: string;

        try {
          const errorData = await res.json();
          errorMessage = errorData.error || "Erro ao fazer upload";
        } catch {
          errorMessage = `Erro HTTP ${res.status}`;
        }

        console.error(`[DropzoneUploadSingle] Upload failed:`, errorMessage);
        setError(errorMessage);

        // Clear preview
        if (previewUrl && previewUrl !== initialImage && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }
    } catch (error) {
      console.error(`[DropzoneUploadSingle] Exception during upload:`, error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");

      // Clear preview
      if (previewUrl && previewUrl !== initialImage && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setUploading(false);

      // Notify parent upload is complete
      if (onUploadComplete) {
        onUploadComplete();
      }
    }
  }, [initialImage, onImageChange, onUploadStart, onUploadComplete, previewUrl]);

  // Set up dropzone
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': []
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    onDrop,
    disabled: uploading,
    ...dropzoneOptions
  });

  // Handle image removal
  const handleRemove = useCallback(() => {
    console.log(`[DropzoneUploadSingle] Removing image`);

    // Clear current image URL and notify parent
    setImageUrl("");
    onImageChange("");

    // Clear preview URL and release object URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
  }, [previewUrl, onImageChange]);

  return (
    <div className={className}>
      {/* Debug info panel */}
      <div className="p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs mb-2">
        <p className="text-blue-400 font-medium">Status do Upload:</p>
        <p className="text-blue-400">Estado: {uploading ? 'Enviando...' : imageUrl ? 'Pronto' : 'Sem imagem'}</p>
        {error && <p className="text-red-400">Erro: {error}</p>}
        {imageUrl && <p className="text-blue-400">URL: {imageUrl.substring(0, 30)}...</p>}
      </div>

      {previewUrl || imageUrl ? (
        // Image preview with remove button
        <div className="relative inline-block">
          <img
            src={previewUrl || imageUrl}
            alt={`Preview de ${imageType}`}
            className="max-w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500"
          >
            <X size={16} />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <Loader2 className="animate-spin text-white" size={32} />
            </div>
          )}
        </div>
      ) : (
        // Empty state dropzone
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
                ? "Solte a imagem aqui"
                : "Apenas imagens são aceitas"
              : `Clique para selecionar uma imagem${imageType === 'comprovante' ? ' de comprovante' : ''}`
            }
          </p>
          <p className="text-zinc-600 text-xs mt-1">JPG, PNG, GIF ou WEBP (máx. 5MB)</p>
        </div>
      )}

      {error && (
        <div className="p-2 bg-red-900/20 border border-red-500 rounded-lg mt-2">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}