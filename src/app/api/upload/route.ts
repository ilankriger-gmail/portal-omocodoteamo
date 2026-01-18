import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';

// Carregar configuração do Cloudinary (sem fallbacks - requer variáveis de ambiente)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("ERRO: Variáveis de ambiente do Cloudinary não configuradas");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: Request) {
  // Logging for debugging
  console.log("Upload API called");

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("Authentication failed");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    console.log("Form data received");

    const type = formData.get("type") as string || "atualizacao";

    // Check if we're uploading multiple files
    const isMultipleFiles = formData.has("files");
    console.log(`Upload type: ${isMultipleFiles ? 'multiple' : 'single'} files`);

    if (isMultipleFiles) {
      // Handle multiple files
      const files = formData.getAll("files") as File[];

      if (!files || files.length === 0) {
        console.log("No files provided");
        return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
      }

      // Limit file count
      const MAX_FILES = 10;
      if (files.length > MAX_FILES) {
        console.log(`Too many files: ${files.length} (max: ${MAX_FILES})`);
        return NextResponse.json(
          { error: `Máximo de ${MAX_FILES} arquivos permitidos` },
          { status: 400 }
        );
      }

      // Validate and upload files
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      // Process files in parallel
      const uploadPromises = files.map(async (file, index) => {
        console.log(`Processing file ${index+1}/${files.length}: ${file.name}`);

        try {
          // Validate type and size
          if (!allowedTypes.includes(file.type)) {
            console.log(`Invalid file type: ${file.type}`);
            return {
              error: `Tipo de arquivo não permitido: ${file.name}. Use JPG, PNG, GIF ou WebP.`,
              index
            };
          }

          if (file.size > maxSize) {
            console.log(`File too large: ${file.size} bytes`);
            return {
              error: `Arquivo muito grande: ${file.name}. Máximo 5MB.`,
              index
            };
          }

          // Get file bytes
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Generate unique filename
          const timestamp = Date.now() + index;
          const ext = file.name.split(".").pop();
          const filename = `${type}-${timestamp}.${ext}`;
          console.log(`Generated filename: ${filename}`);

          // Convert to base64 for Cloudinary
          const base64Data = buffer.toString('base64');
          const dataURI = `data:${file.type};base64,${base64Data}`;

          // Upload to Cloudinary
          console.log(`Uploading to Cloudinary: ${filename}`);
          const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload(
              dataURI,
              {
                folder: 'portal-omocodoteamo',
                public_id: filename.split('.')[0],
                resource_type: 'auto'
              },
              (error, result) => {
                if (error) {
                  console.log(`Cloudinary error: ${error.message}`);
                  reject(error);
                }
                else {
                  console.log(`Cloudinary success: ${result.secure_url}`);
                  resolve(result);
                }
              }
            );
          });

          return {
            url: result.secure_url,
            filename,
            index
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return {
            error: `Erro ao processar arquivo ${file.name}: ${error.message}`,
            index
          };
        }
      });

      // Wait for all uploads
      console.log("Waiting for all uploads to complete...");
      const results = await Promise.all(uploadPromises);

      // Separate successes from failures
      const successfulUploads = results.filter(r => !r.error);
      const errors = results.filter(r => r.error);

      console.log(`Upload complete: ${successfulUploads.length} successful, ${errors.length} failed`);

      return NextResponse.json({
        urls: successfulUploads,
        uploadedCount: successfulUploads.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } else {
      // Process a single file
      console.log("Processing single file upload");
      const file = formData.get("file") as File;

      if (!file) {
        console.log("No file provided");
        return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
      }

      // Validate file
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        console.log(`Invalid file type: ${file.type}`);
        return NextResponse.json(
          { error: "Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP." },
          { status: 400 }
        );
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        console.log(`File too large: ${file.size} bytes`);
        return NextResponse.json(
          { error: "Arquivo muito grande. Máximo 5MB." },
          { status: 400 }
        );
      }

      // Get file bytes
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate filename
      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const filename = `${type}-${timestamp}.${ext}`;
      console.log(`Generated filename: ${filename}`);

      // Convert to base64
      const base64Data = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64Data}`;

      // Upload to Cloudinary
      console.log(`Uploading to Cloudinary: ${filename}`);
      try {
        const result = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload(
            dataURI,
            {
              folder: 'portal-omocodoteamo',
              public_id: filename.split('.')[0],
              resource_type: 'auto'
            },
            (error, result) => {
              if (error) {
                console.log(`Cloudinary error: ${error.message}`);
                reject(error);
              }
              else {
                console.log(`Cloudinary success: ${result.secure_url}`);
                resolve(result);
              }
            }
          );
        });

        // Return secure URL
        console.log("Upload complete");
        const url = result.secure_url;
        return NextResponse.json({ url, filename });
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return NextResponse.json(
          { error: `Erro ao fazer upload: ${uploadError.message}` },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Error in upload API:", error);
    return NextResponse.json(
      { error: `Erro ao fazer upload do arquivo: ${error.message}` },
      { status: 500 }
    );
  }
}