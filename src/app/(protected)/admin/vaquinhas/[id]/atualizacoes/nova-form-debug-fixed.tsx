"use client";

import { useState, useEffect, useRef } from "react";
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

export function NovaAtualizacaoFormDebugFixed({ vaquinhaId }: { vaquinhaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [singleUploading, setSingleUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    tipo: "TEXTO",
    conteudo: "",
    imagemUrl: "",
    videoUrl: "",
    imagens: [] as CarouselImage[],
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const addLogMessage = (message: string) => {
    console.log(message);
    setLogMessages((prev) => [...prev, `${new Date().toISOString().substr(11, 8)} - ${message}`]);
  };

  // Debug effect to track state changes
  useEffect(() => {
    addLogMessage(`Form state updated:`);
    addLogMessage(`- Type: ${form.tipo}`);
    addLogMessage(`- Content length: ${form.conteudo.length} chars`);
    addLogMessage(`- Single image: ${form.imagemUrl ? "Yes" : "No"}`);
    addLogMessage(`- Gallery images: ${form.imagens.length}`);
    addLogMessage(`- Gallery uploading: ${galleryUploading}`);
    addLogMessage(`- Single uploading: ${singleUploading}`);

    if (form.imagens.length > 0) {
      addLogMessage(`- Gallery image IDs: ${form.imagens.map(img => img.id.substring(0, 5)).join(", ")}`);
      addLogMessage(`- Gallery image URLs exist: ${form.imagens.every(img => Boolean(img.url))}`);
    }
  }, [form, galleryUploading, singleUploading]);

  // BUGFIX: Special check to ensure image objects are valid
  const validateGalleryImages = () => {
    if (form.imagens.length === 0) {
      addLogMessage("❌ Gallery validation failed: No images at all");
      return false;
    }

    const badImages = form.imagens.filter(img => !img.id || !img.url);
    if (badImages.length > 0) {
      addLogMessage(`❌ Gallery validation failed: ${badImages.length} invalid image objects`);
      return false;
    }

    addLogMessage(`✅ Gallery validation passed: ${form.imagens.length} valid images`);
    return true;
  };

  // Debug form submission
  const handleValidateOnly = () => {
    addLogMessage("=== FORM VALIDATION START ===");

    // Log the form state
    addLogMessage(`Form state at validation:`);
    addLogMessage(JSON.stringify(form, null, 2));
    addLogMessage(`Gallery has ${form.imagens.length} images`);
    addLogMessage(`Gallery uploading status: ${galleryUploading}`);
    addLogMessage(`Single image uploading status: ${singleUploading}`);

    try {
      addLogMessage("Running validation checks...");

      // Validations
      if (form.conteudo.trim() === "") {
        addLogMessage("❌ Validation error: Empty content");
        setSubmitError("O conteúdo da atualização não pode estar vazio");
        return false;
      }

      // Specific validation for gallery type
      if (form.tipo === "GALERIA") {
        const galleryValid = validateGalleryImages();
        if (!galleryValid) {
          setSubmitError("Adicione pelo menos uma imagem à galeria");
          return false;
        }
      }

      // Validation for FOTO or COMPROVANTE types
      if ((form.tipo === "FOTO" || form.tipo === "COMPROVANTE") && !form.imagemUrl) {
        addLogMessage(`❌ Validation error: Missing image for ${form.tipo} type`);
        setSubmitError(`Adicione uma imagem para o tipo ${form.tipo === "FOTO" ? "Foto" : "Comprovante"}`);
        return false;
      }

      // Validation for VIDEO type
      if (form.tipo === "VIDEO" && !form.videoUrl) {
        addLogMessage("❌ Validation error: Missing video URL");
        setSubmitError("Adicione o link do vídeo do YouTube");
        return false;
      }

      // Validation for uploads in progress
      if (galleryUploading || singleUploading) {
        addLogMessage("❌ Validation error: Upload in progress");
        setSubmitError("Aguarde o término do upload das imagens antes de publicar");
        return false;
      }

      // If we reach here, validation passed
      addLogMessage("✅ Form validation passed!");
      setSubmitError(null);
      return true;

    } catch (error) {
      addLogMessage(`❌ Exception during validation: ${error}`);
      setSubmitError("Ocorreu um erro ao validar o formulário");
      return false;
    } finally {
      addLogMessage("=== FORM VALIDATION END ===");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add extra logging at the start of submission
    addLogMessage("==== FORM SUBMISSION START ====");
    addLogMessage(`Current form state: ${JSON.stringify(form, null, 2)}`);

    setLoading(true);
    setSubmitError(null);

    // BUGFIX: Force a revalidation of gallery images
    if (form.tipo === "GALERIA") {
      const galleryValid = validateGalleryImages();
      if (!galleryValid) {
        setSubmitError("Adicione pelo menos uma imagem à galeria");
        setLoading(false);
        addLogMessage("==== FORM SUBMISSION END - GALLERY VALIDATION FAILED ====");
        return;
      }
    }

    // Validate the form first
    const isValid = handleValidateOnly();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      addLogMessage(`Sending request to /api/vaquinhas/${vaquinhaId}/atualizacoes`);

      // BUGFIX: Create a sanitized copy of the form data, ensuring all images have valid IDs and URLs
      const sanitizedForm = {
        ...form,
        imagens: form.tipo === "GALERIA"
          ? form.imagens.filter(img => img.id && img.url).map(img => ({
              id: img.id,
              url: img.url,
              legenda: img.legenda
            }))
          : []
      };

      addLogMessage(`Sanitized form data: ${JSON.stringify(sanitizedForm, null, 2)}`);

      const res = await fetch(`/api/vaquinhas/${vaquinhaId}/atualizacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedForm),
      });

      addLogMessage(`Response status: ${res.status}`);

      if (res.ok) {
        addLogMessage("✅ Update created successfully");
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
          addLogMessage(`❌ API Error: ${JSON.stringify(errorData)}`);
        } catch (e) {
          addLogMessage("Failed to parse error response");
        }

        setSubmitError(errorMessage);
      }
    } catch (error) {
      addLogMessage(`❌ Form submission error: ${error}`);
      setSubmitError("Ocorreu um erro ao publicar a atualização. Tente novamente.");
    } finally {
      addLogMessage("==== FORM SUBMISSION END ====");
      setLoading(false);
    }
  };

  // Gallery upload status handlers with extra logging
  const handleGalleryUploadStart = () => {
    addLogMessage("🔄 Gallery upload starting");
    setGalleryUploading(true);
  };

  const handleGalleryUploadComplete = () => {
    addLogMessage("✅ Gallery upload complete");
    setGalleryUploading(false);
  };

  // Single image upload status handlers
  const handleSingleUploadStart = () => {
    addLogMessage("🔄 Single image upload starting");
    setSingleUploading(true);
  };

  const handleSingleUploadComplete = () => {
    addLogMessage("✅ Single image upload complete");
    setSingleUploading(false);
  };

  // Handler for receiving images from gallery upload component
  const handleGalleryImagesChange = (images: CarouselImage[]) => {
    addLogMessage(`📥 Received ${images.length} images from gallery upload component`);

    // BUGFIX: Validate received images
    const invalidImages = images.filter(img => !img.id || !img.url);
    if (invalidImages.length > 0) {
      addLogMessage(`⚠️ Warning: Received ${invalidImages.length} invalid image objects`);
    }

    if (images.length > 0) {
      addLogMessage(`First image ID: ${images[0].id}, URL exists: ${Boolean(images[0].url)}`);
    }

    // Only keep valid images
    const validImages = images.filter(img => img.id && img.url);
    addLogMessage(`Keeping ${validImages.length} valid images out of ${images.length} received`);

    setForm(prev => {
      const newState = { ...prev, imagens: validImages };
      addLogMessage(`Updated form state, now has ${newState.imagens.length} valid images`);
      return newState;
    });
  };

  // Handler for receiving single image from upload component
  const handleSingleImageChange = (imageUrl: string) => {
    addLogMessage(`📥 Received single image URL: ${imageUrl ? imageUrl.substring(0, 30) + "..." : "None"}`);
    setForm(prev => ({ ...prev, imagemUrl: imageUrl }));
  };

  const showGalleryUpload = form.tipo === "GALERIA";
  const showSingleImageUpload = form.tipo === "FOTO" || form.tipo === "COMPROVANTE";
  const showVideoInput = form.tipo === "VIDEO";

  const clearLogs = () => setLogMessages([]);

  return (
    <div>
      <form ref={formRef} onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        {/* Debug information */}
        <div className="p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs">
          <div className="flex justify-between items-center mb-1">
            <p className="font-medium text-blue-400">Status do Formulário (FIXED):</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleValidateOnly}
                className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-600 text-xs"
              >
                Validar
              </button>
              <button
                type="button"
                onClick={clearLogs}
                className="px-2 py-1 bg-zinc-700 text-white rounded hover:bg-zinc-600 text-xs"
              >
                Limpar Logs
              </button>
            </div>
          </div>
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
            onChange={(e) => {
              addLogMessage(`Changing type from ${form.tipo} to ${e.target.value}`);
              setForm({ ...form, tipo: e.target.value });
            }}
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
            : 'Publicar Atualização (DEBUG FIXED)'}
        </Button>
      </form>

      {/* Log display */}
      <div className="mt-6 bg-black border border-zinc-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-2">Debug Log</h3>
        <div className="bg-zinc-900 p-2 rounded h-60 overflow-y-auto font-mono text-xs">
          {logMessages.length === 0 ? (
            <p className="text-zinc-500 italic">Logs aparecem aqui...</p>
          ) : (
            logMessages.map((msg, i) => (
              <div key={i} className="mb-1">
                <span className={
                  msg.includes("❌") ? "text-red-400" :
                  msg.includes("✅") ? "text-green-400" :
                  msg.includes("⚠️") ? "text-yellow-400" :
                  msg.includes("🔄") ? "text-blue-400" :
                  msg.includes("📥") ? "text-yellow-400" :
                  "text-zinc-400"
                }>
                  {msg}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}