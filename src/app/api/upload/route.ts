import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';

// Carregar configuração do Cloudinary
// Usado para upload de imagens em produção (Vercel)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwnbmcg00',
  api_key: process.env.CLOUDINARY_API_KEY || '172667994195663',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'aHMCEq33FURqb9I1Bz9nxYY14d4',
  secure: true,
});

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const type = formData.get("type") as string || "atualizacao";

    // Verificar se está enviando vários arquivos
    const isMultipleFiles = formData.has("files");

    if (isMultipleFiles) {
      // Processar múltiplos arquivos
      const files = formData.getAll("files") as File[];

      if (!files || files.length === 0) {
        return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
      }

      // Limitar número de arquivos
      const MAX_FILES = 10;
      if (files.length > MAX_FILES) {
        return NextResponse.json(
          { error: `Máximo de ${MAX_FILES} arquivos permitidos` },
          { status: 400 }
        );
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      // Processar os arquivos em paralelo
      const uploadPromises = files.map(async (file, index) => {
        try {
          // Validação de tipo e tamanho
          if (!allowedTypes.includes(file.type)) {
            return {
              error: `Tipo de arquivo não permitido: ${file.name}. Use JPG, PNG, GIF ou WebP.`,
              index
            };
          }

          if (file.size > maxSize) {
            return {
              error: `Arquivo muito grande: ${file.name}. Máximo 5MB.`,
              index
            };
          }

          // Obter os bytes do arquivo
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Gerar nome de arquivo único
          const timestamp = Date.now() + index;
          const ext = file.name.split(".").pop();
          const filename = `${type}-${timestamp}.${ext}`;

          // Converter buffer para base64 para upload no Cloudinary
          const base64Data = buffer.toString('base64');
          const dataURI = `data:${file.type};base64,${base64Data}`;

          // Upload para o Cloudinary
          const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload(
              dataURI,
              {
                folder: 'portal-omocodoteamo',
                public_id: filename.split('.')[0],
                resource_type: 'auto'
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
          });

          return {
            url: result.secure_url,
            filename,
            index
          };
        } catch (error) {
          return {
            error: `Erro ao processar arquivo ${file.name}`,
            index
          };
        }
      });

      const results = await Promise.all(uploadPromises);

      // Separar uploads bem-sucedidos e falhas
      const successfulUploads = results.filter(r => !r.error);
      const errors = results.filter(r => r.error);

      return NextResponse.json({
        urls: successfulUploads,
        uploadedCount: successfulUploads.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } else {
      // Processar um único arquivo (compatibilidade com implementação existente)
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP." },
          { status: 400 }
        );
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "Arquivo muito grande. Máximo 5MB." },
          { status: 400 }
        );
      }

      // Obter os bytes do arquivo
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Gerar nome de arquivo único
      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const filename = `${type}-${timestamp}.${ext}`;

      // Converter buffer para base64 para upload no Cloudinary
      const base64Data = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64Data}`;

      // Upload para o Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload(
          dataURI,
          {
            folder: 'portal-omocodoteamo',
            public_id: filename.split('.')[0],  // Nome do arquivo sem extensão
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      // URL segura da imagem no Cloudinary
      const url = result.secure_url;

      return NextResponse.json({ url, filename });
    }
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo" },
      { status: 500 }
    );
  }
}
