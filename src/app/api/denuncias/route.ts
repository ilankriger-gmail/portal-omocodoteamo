import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Definimos a API como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

// Desabilitar cache
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Verifica se estamos no ambiente de build da Vercel
const isBuild = process.env.NODE_ENV === "production" &&
                process.env.NEXT_PHASE === "phase-production-build";

// Rate limiting por IP para denúncias (prevenir spam)
const denunciaAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_DENUNCIAS_PER_HOUR = 5;
const HOUR_IN_MS = 60 * 60 * 1000;

function checkDenunciaRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const attempts = denunciaAttempts.get(ip);

  if (!attempts) {
    denunciaAttempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_DENUNCIAS_PER_HOUR - 1 };
  }

  // Reset se passou 1 hora
  if (now - attempts.firstAttempt > HOUR_IN_MS) {
    denunciaAttempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_DENUNCIAS_PER_HOUR - 1 };
  }

  if (attempts.count >= MAX_DENUNCIAS_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }

  attempts.count++;
  return { allowed: true, remaining: MAX_DENUNCIAS_PER_HOUR - attempts.count };
}

// Sanitização básica de texto (prevenir XSS)
function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .slice(0, 5000); // Limitar tamanho
}

// Validar URL
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  // Durante o build, retornar dados mock
  if (isBuild) {
    console.log("[denuncias] Ignorando execução durante o build da Vercel");
    return NextResponse.json({
      success: true,
      id: "mock-id-build-time",
      build: true
    });
  }

  try {
    // Rate limiting por IP
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] ||
               headersList.get("x-real-ip") ||
               "unknown";

    const rateLimit = checkDenunciaRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas denúncias enviadas. Tente novamente em 1 hora." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { perfilFalso, plataforma, descricao, imagemUrl, contato } = body;

    // Validação mais rigorosa
    if (!perfilFalso || typeof perfilFalso !== 'string' || perfilFalso.trim().length < 3) {
      return NextResponse.json(
        { error: "Perfil falso deve ter pelo menos 3 caracteres" },
        { status: 400 }
      );
    }

    if (!plataforma || typeof plataforma !== 'string') {
      return NextResponse.json(
        { error: "Plataforma é obrigatória" },
        { status: 400 }
      );
    }

    if (!descricao || typeof descricao !== 'string' || descricao.trim().length < 10) {
      return NextResponse.json(
        { error: "Descrição deve ter pelo menos 10 caracteres" },
        { status: 400 }
      );
    }

    // Validar URL da imagem se fornecida
    if (imagemUrl && !isValidUrl(imagemUrl)) {
      return NextResponse.json(
        { error: "URL da imagem inválida" },
        { status: 400 }
      );
    }

    const denuncia = await prisma.denuncia.create({
      data: {
        perfilFalso: sanitizeText(perfilFalso),
        plataforma: sanitizeText(plataforma),
        descricao: sanitizeText(descricao),
        imagemUrl: imagemUrl ? sanitizeText(imagemUrl) : null,
        contato: contato ? sanitizeText(contato) : null,
      },
    });

    return NextResponse.json({
      success: true,
      id: denuncia.id,
      remaining: rateLimit.remaining
    });
  } catch (error) {
    console.error("Erro ao criar denúncia:", error);
    return NextResponse.json(
      { error: "Erro ao processar denúncia" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Durante o build, retornar dados mock
  if (isBuild) {
    console.log("[denuncias] Ignorando execução durante o build da Vercel");
    return NextResponse.json({
      denuncias: [],
      build: true
    });
  }

  // Apenas admin pode ver denúncias
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}
