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

export function NovaAtualizacaoForm({ vaquinhaId }: { vaquinhaId: string }) {
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

  // Função para validar se as imagens da galeria são válidas
  const validateGalleryImages = () => {
    if (form.imagens.length === 0) {
      return false;
    }

    const badImages = form.imagens.filter(img => !img.id || !img.url);
    if (badImages.length > 0) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    try {
      // Validações
      if (form.conteudo.trim() === "") {
        setSubmitError("O conteúdo da atualização não pode estar vazio");
        setLoading(false);
        return;
      }

      // Validação específica para galeria
      if (form.tipo === "GALERIA") {
        const galleryValid = validateGalleryImages();
        if (!galleryValid) {
          setSubmitError("Adicione pelo menos uma imagem à galeria");
          setLoading(false);
          return;
        }
      }

      // Validação para FOTO ou COMPROVANTE
      if ((form.tipo === "FOTO" || form.tipo === "COMPROVANTE") && !form.imagemUrl) {
        setSubmitError(`Adicione uma imagem para o tipo ${form.tipo === "FOTO" ? "Foto" : "Comprovante"}`);
        setLoading(false);
        return;
      }

      // Validação para VIDEO
      if (form.tipo === "VIDEO" && !form.videoUrl) {
        setSubmitError("Adicione o link do vídeo do YouTube");
        setLoading(false);
        return;
      }

      // Validação para uploads em andamento
      if (galleryUploading || singleUploading) {
        setSubmitError("Aguarde o término do upload das imagens antes de publicar");
        setLoading(false);
        return;
      }

      // Sanitizar os dados antes de enviar
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

      const res = await fetch(`/api/vaquinhas/${vaquinhaId}/atualizacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedForm),
      });

      if (res.ok) {
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
        } catch (e) {
          console.error("Failed to parse error response");
        }

        setSubmitError(errorMessage);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError("Ocorreu um erro ao publicar a atualização. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers de status de upload da galeria
  const handleGalleryUploadStart = () => {
    setGalleryUploading(true);
  };

  const handleGalleryUploadComplete = () => {
    setGalleryUploading(false);
  };

  // Handlers de status de upload de imagem única
  const handleSingleUploadStart = () => {
    setSingleUploading(true);
  };

  const handleSingleUploadComplete = () => {
    setSingleUploading(false);
  };

  // Handler para receber imagens do componente de upload de galeria
  const handleGalleryImagesChange = (images: CarouselImage[]) => {
    // Filtrar apenas imagens válidas
    const validImages = images.filter(img => img.id && img.url);

    setForm(prev => ({
      ...prev,
      imagens: validImages
    }));
  };

  // Handler para receber imagem única do componente de upload
  const handleSingleImageChange = (imageUrl: string) => {
    setForm(prev => ({
      ...prev,
      imagemUrl: imageUrl
    }));
  };

  const showGalleryUpload = form.tipo === "GALERIA";
  const showSingleImageUpload = form.tipo === "FOTO" || form.tipo === "COMPROVANTE";
  const showVideoInput = form.tipo === "VIDEO";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
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
          : 'Publicar Atualização'}
      </Button>
    </form>
  );
}