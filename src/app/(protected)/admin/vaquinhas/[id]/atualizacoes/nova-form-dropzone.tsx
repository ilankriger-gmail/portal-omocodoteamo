"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CarouselImage } from "@/components/ui/image-carousel";
import { DropzoneUpload } from "@/components/admin/dropzone-upload";
import { DropzoneUploadSingle } from "@/components/admin/dropzone-upload-single";

const tipos = [
  { value: "TEXTO", label: "Texto" },
  { value: "FOTO", label: "Foto" },
  { value: "VIDEO", label: "Vídeo (YouTube)" },
  { value: "COMPROVANTE", label: "Comprovante" },
  { value: "GALERIA", label: "Galeria de Fotos" },
];

export function NovaAtualizacaoForm({ vaquinhaId }: { vaquinhaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [singleUploading, setSingleUploading] = useState(false);
  const [form, setForm] = useState({
    tipo: "TEXTO",
    conteudo: "",
    imagemUrl: "",
    videoUrl: "",
    imagens: [] as CarouselImage[],
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Debug effect to track state changes
  useEffect(() => {
    console.log("[Form] State updated:");
    console.log(`- Type: ${form.tipo}`);
    console.log(`- Single image: ${form.imagemUrl ? "Yes" : "No"}`);
    console.log(`- Gallery images: ${form.imagens.length}`);
    console.log(`- Gallery uploading: ${galleryUploading}`);
    console.log(`- Single uploading: ${singleUploading}`);

    if (form.imagens.length > 0) {
      console.log("- Gallery image IDs:", form.imagens.map(img => img.id).join(", "));
    }
  }, [form, galleryUploading, singleUploading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add extra logging at the start of submission
    console.log("==== FORM SUBMISSION START ====");
    console.log("Current form state:", JSON.stringify(form, null, 2));
    console.log(`Gallery has ${form.imagens.length} images`);
    console.log(`Gallery uploading status: ${galleryUploading}`);
    console.log(`Single image uploading status: ${singleUploading}`);

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

      // Validation for uploads in progress
      if (galleryUploading || singleUploading) {
        console.log("Validation error: Upload in progress");
        setSubmitError("Aguarde o término do upload das imagens antes de publicar");
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

  // Gallery upload status handlers
  const handleGalleryUploadStart = () => {
    console.log("Gallery upload starting");
    setGalleryUploading(true);
  };

  const handleGalleryUploadComplete = () => {
    console.log("Gallery upload complete");
    setGalleryUploading(false);
  };

  // Single image upload status handlers
  const handleSingleUploadStart = () => {
    console.log("Single image upload starting");
    setSingleUploading(true);
  };

  const handleSingleUploadComplete = () => {
    console.log("Single image upload complete");
    setSingleUploading(false);
  };

  // Handler for receiving images from gallery upload component
  const handleGalleryImagesChange = (images: CarouselImage[]) => {
    console.log(`Received ${images.length} images from gallery upload component`);

    if (images.length > 0) {
      console.log("Image data sample:", images[0].id);
    }

    setForm(prev => ({ ...prev, imagens: images }));
  };

  // Handler for receiving single image from upload component
  const handleSingleImageChange = (imageUrl: string) => {
    console.log(`Received single image URL: ${imageUrl ? "Yes" : "No"}`);
    setForm(prev => ({ ...prev, imagemUrl: imageUrl }));
  };

  const showGalleryUpload = form.tipo === "GALERIA";
  const showSingleImageUpload = form.tipo === "FOTO" || form.tipo === "COMPROVANTE";
  const showVideoInput = form.tipo === "VIDEO";

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
      {/* Debug information */}
      <div className="p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs">
        <p className="font-medium text-blue-400 mb-1">Status do Formulário:</p>
        <p className="text-blue-300">Tipo: {form.tipo}</p>
        <p className="text-blue-300">
          Imagens: {form.imagens.length} (galeria) |
          Imagem única: {form.imagemUrl ? "Sim" : "Não"}
        </p>
        <p className="text-blue-300">
          Upload em progresso: {galleryUploading || singleUploading ? "Sim" : "Não"}
        </p>
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

      {showSingleImageUpload && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {form.tipo === "COMPROVANTE" ? "Comprovante" : "Foto"}
          </label>
          <DropzoneUploadSingle
            onImageChange={handleSingleImageChange}
            initialImage={form.imagemUrl}
            imageType={form.tipo === "COMPROVANTE" ? "comprovante" : "foto"}
            onUploadStart={handleSingleUploadStart}
            onUploadComplete={handleSingleUploadComplete}
          />
        </div>
      )}

      {showGalleryUpload && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Galeria de Imagens
          </label>
          <DropzoneUpload
            onImagesChange={handleGalleryImagesChange}
            initialImages={form.imagens}
            onUploadStart={handleGalleryUploadStart}
            onUploadComplete={handleGalleryUploadComplete}
            maxImages={10}
          />
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
        disabled={galleryUploading || singleUploading}
        className="w-full"
      >
        {galleryUploading || singleUploading
          ? 'Aguarde o upload das imagens...'
          : 'Publicar Atualização (Dropzone)'}
      </Button>
    </form>
  );
}