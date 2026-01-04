"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2 } from "lucide-react";
import { ImageUploadMultiple } from "@/components/admin/image-upload-multiple-fixed";
import { CarouselImage } from "@/components/ui/image-carousel";

const tipos = [
  { value: "TEXTO", label: "Texto" },
  { value: "FOTO", label: "Foto" },
  { value: "VIDEO", label: "Vídeo (YouTube)" },
  { value: "COMPROVANTE", label: "Comprovante" },
  { value: "GALERIA", label: "Galeria de Fotos" },
];

export function NovaAtualizacaoForm({ vaquinhaId }: { vaquinhaId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [form, setForm] = useState({
    tipo: "TEXTO",
    conteudo: "",
    imagemUrl: "",
    videoUrl: "",
    imagens: [] as CarouselImage[],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Debug effect to track state changes
  useEffect(() => {
    console.log("[Form] State updated:");
    console.log(`- Type: ${form.tipo}`);
    console.log(`- Image count: ${form.imagens.length}`);
    console.log(`- Gallery uploading: ${galleryUploading}`);

    if (form.imagens.length > 0) {
      console.log("- Image IDs:", form.imagens.map(img => img.id).join(", "));
    }
  }, [form, galleryUploading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Log file details for debugging
    console.log(`Uploading file: ${file.name} (${file.type}, ${file.size} bytes)`);

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload para o servidor
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "atualizacao"); // Make sure we pass the type

      console.log("Sending file to API...");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log("File uploaded successfully:", data);
        setForm((prev) => ({ ...prev, imagemUrl: data.url }));
      } else {
        console.error("Upload failed with status:", res.status);
        let errorMessage = "Erro ao fazer upload";

        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
          console.error("Error details:", error);
        } catch (e) {
          console.error("Failed to parse error response");
        }

        alert(errorMessage);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error("Exception during upload:", error);
      alert("Erro ao fazer upload: " + (error instanceof Error ? error.message : "Erro desconhecido"));
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, imagemUrl: "" }));
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add extra logging right at the start of submission
    console.log("==== FORM SUBMISSION START ====");
    console.log("Current form state:", JSON.stringify(form, null, 2));
    console.log(`Gallery has ${form.imagens.length} images`);
    console.log(`Gallery uploading status: ${galleryUploading}`);

    setLoading(true);
    setSubmitError(null);

    try {
      console.log("Starting validation checks...");

      // Validations
      if (form.conteudo.trim() === "") {
        console.log("Validation error: Empty content");
        setSubmitError("O conteúdo da atualização não pode estar vazio");
        setLoading(false);
        return;
      }

      // Specific validation for gallery type
      if (form.tipo === "GALERIA" && form.imagens.length === 0) {
        console.log("Validation error: Gallery has no images");
        setSubmitError("Adicione pelo menos uma imagem à galeria");
        setLoading(false);
        return;
      }

      // Validation for FOTO or COMPROVANTE types
      if ((form.tipo === "FOTO" || form.tipo === "COMPROVANTE") && !form.imagemUrl) {
        console.log(`Validation error: Missing image for ${form.tipo} type`);
        setSubmitError(`Adicione uma imagem para o tipo ${form.tipo === "FOTO" ? "Foto" : "Comprovante"}`);
        setLoading(false);
        return;
      }

      // Validation for VIDEO type
      if (form.tipo === "VIDEO" && !form.videoUrl) {
        console.log("Validation error: Missing video URL");
        setSubmitError("Adicione o link do vídeo do YouTube");
        setLoading(false);
        return;
      }

      console.log(`Sending request to /api/vaquinhas/${vaquinhaId}/atualizacoes`);
      console.log("Request payload:", JSON.stringify(form, null, 2));

      const res = await fetch(`/api/vaquinhas/${vaquinhaId}/atualizacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      console.log(`Response status: ${res.status}`);

      if (res.ok) {
        console.log("Update created successfully");
        setForm({
          tipo: "TEXTO",
          conteudo: "",
          imagemUrl: "",
          videoUrl: "",
          imagens: [],
        });
        setPreviewUrl(null);
        router.refresh();
      } else {
        let errorMessage = "Erro ao publicar atualização";

        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
          console.error("API Error:", errorData);
        } catch (e) {
          console.error("Failed to parse error response");
        }

        setSubmitError(errorMessage);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError("Ocorreu um erro ao publicar a atualização. Tente novamente.");
    } finally {
      console.log("==== FORM SUBMISSION END ====");
      setLoading(false);
    }
  };

  const showImageUpload = form.tipo === "FOTO" || form.tipo === "COMPROVANTE";
  const showGalleryUpload = form.tipo === "GALERIA";
  const showVideoInput = form.tipo === "VIDEO";

  // Gallery upload status handlers with better debugging
  const handleGalleryUploadStart = () => {
    console.log("Gallery upload starting");
    setGalleryUploading(true);
  };

  const handleGalleryUploadComplete = () => {
    console.log("Gallery upload complete");
    setGalleryUploading(false);
  };

  // Handler for receiving images from multiple upload component
  const handleImagesChange = (images: CarouselImage[]) => {
    console.log(`Received ${images.length} images from gallery upload component`);

    if (images.length > 0) {
      console.log("Image data:", JSON.stringify(images.map(img => ({ id: img.id, url: img.url.substring(0, 20) + '...' })), null, 2));
    }

    setForm(prev => {
      const newState = { ...prev, imagens: images };
      console.log(`Updated form state, now has ${newState.imagens.length} images`);
      return newState;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
      {/* Debug information */}
      <div className="p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs">
        <p className="font-medium text-blue-400 mb-1">Status da Forma (Debug):</p>
        <p className="text-blue-300">Tipo: {form.tipo}</p>
        <p className="text-blue-300">Imagens: {form.imagens.length} (carrossel)</p>
        <p className="text-blue-300">Upload em progresso: {galleryUploading ? 'Sim' : 'Não'}</p>
        {form.imagens.length > 0 && (
          <div className="mt-1 text-blue-300">
            <p>IDs: {form.imagens.map(img => img.id.substring(0, 5)).join(', ')}</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">Tipo</label>
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {tipos.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <Textarea
        id="conteudo"
        label="Conteúdo"
        value={form.conteudo}
        onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
        placeholder="Escreva a atualização..."
        required
      />

      {showImageUpload && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {form.tipo === "COMPROVANTE" ? "Comprovante" : "Foto"}
          </label>

          {previewUrl || form.imagemUrl ? (
            <div className="relative inline-block">
              <img
                src={previewUrl || form.imagemUrl}
                alt="Preview"
                className="max-w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
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
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-zinc-600 transition-colors"
            >
              <Upload className="mx-auto text-zinc-500 mb-2" size={32} />
              <p className="text-zinc-400 text-sm">Clique para selecionar uma imagem</p>
              <p className="text-zinc-600 text-xs mt-1">JPG, PNG, GIF ou WEBP (máx. 5MB)</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {showGalleryUpload && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Galeria de Imagens
          </label>
          <ImageUploadMultiple
            onImagesChange={handleImagesChange}
            onUploadStart={handleGalleryUploadStart}
            onUploadComplete={handleGalleryUploadComplete}
            maxImages={10}
          />
          {form.imagens.length > 0 && (
            <p className="text-xs text-zinc-500 mt-1">
              {form.imagens.length} {form.imagens.length === 1 ? 'imagem' : 'imagens'} adicionada{form.imagens.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
      )}

      {showVideoInput && (
        <Input
          id="videoUrl"
          label="Link do YouTube"
          type="url"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
        />
      )}

      {submitError && (
        <div className="p-3 bg-red-900/30 border border-red-500 rounded-lg">
          <p className="text-sm text-red-400">{submitError}</p>
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        disabled={uploading || galleryUploading}
        className="w-full"
      >
        {galleryUploading ? 'Aguarde o upload das imagens...' : 'Publicar Atualização (FIXED)'}
      </Button>
    </form>
  );
}