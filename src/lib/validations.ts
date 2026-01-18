import { z } from "zod";

// Validação de vaquinha
export const vaquinhaSchema = z.object({
  titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres").max(200),
  descricao: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres").max(5000),
  linkOriginal: z.string().url("URL inválida"),
  chavePix: z.string().min(5, "Chave PIX inválida"),
  imagemUrl: z.string().url("URL da imagem inválida").optional().nullable(),
  videoUrl: z.string().url("URL do vídeo inválida").optional().nullable(),
  meta: z.number().positive("Meta deve ser maior que zero"),
  valorAtual: z.number().min(0).optional(),
  status: z.enum(["ATIVA", "ENCERRADA"]).optional(),
});

// Validação de usuário
export const userSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100).optional(),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]).optional(),
});

// Validação de atualização de usuário (senha opcional)
export const userUpdateSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .optional(),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100).optional().nullable(),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]).optional(),
});

// Validação de denúncia
export const denunciaSchema = z.object({
  perfilFalso: z.string().min(3, "Perfil deve ter pelo menos 3 caracteres").max(500),
  plataforma: z.string().min(1, "Plataforma é obrigatória").max(100),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").max(5000),
  imagemUrl: z.string().url("URL da imagem inválida").optional().nullable(),
  contato: z.string().max(200).optional().nullable(),
});

// Validação de inscrição
export const inscricaoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(200),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional().nullable(),
  cidade: z.string().min(2, "Cidade é obrigatória").max(100),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
  historia: z.string().min(50, "História deve ter pelo menos 50 caracteres").max(10000),
  situacao: z.string().min(10, "Situação deve ter pelo menos 10 caracteres").max(2000),
  necessidade: z.array(z.string()).optional(),
  dataNascimento: z.string().optional().nullable(),
  faixaValor: z.string().optional().nullable(),
  paraQuem: z.string().optional().nullable(),
  nomeBeneficiado: z.string().optional().nullable(),
  linkMidiaSocial: z.string().url("URL da mídia social inválida").optional().nullable(),
});

// Validação de FAQ
export const faqSchema = z.object({
  pergunta: z.string().min(10, "Pergunta deve ter pelo menos 10 caracteres").max(500),
  resposta: z.string().min(10, "Resposta deve ter pelo menos 10 caracteres").max(5000),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
  imagemUrl: z.string().url("URL da imagem inválida").optional().nullable(),
  videoUrl: z.string().url("URL do vídeo inválida").optional().nullable(),
  botaoLink: z.string().url("URL do botão inválida").optional().nullable(),
  botaoTexto: z.string().max(50).optional().nullable(),
});

// Validação de config
export const configSchema = z.object({
  biografia: z.string().min(10, "Biografia deve ter pelo menos 10 caracteres").max(2000),
  avatarUrl: z.string().url("URL do avatar inválida").optional().nullable(),
  bannerAtivo: z.boolean().optional(),
  bannerTexto: z.string().max(500).optional().nullable(),
  bannerLink: z.string().url("URL do banner inválida").optional().nullable(),
  bannerImageUrl: z.string().url("URL da imagem do banner inválida").optional().nullable(),
  vaquinhaFixadaId: z.string().optional().nullable(),
  googleAnalyticsId: z.string().max(50).optional().nullable(),
  googleAdSenseId: z.string().max(50).optional().nullable(),
  adsAtivado: z.boolean().optional(),
  bannerPrincipalAtivo: z.boolean().optional(),
  bannerPrincipalTexto: z.string().max(200).optional().nullable(),
  bannerPrincipalGradientStart: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional().nullable(),
  bannerPrincipalGradientEnd: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional().nullable(),
});

// Helper para validar e retornar erros formatados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { success: false, errors: ["Erro de validação desconhecido"] };
  }
}

// Helper para checar role
export function hasRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

// Roles hierarchy
export const ROLE_HIERARCHY = {
  ADMIN: ["ADMIN", "EDITOR", "VIEWER"],
  EDITOR: ["EDITOR", "VIEWER"],
  VIEWER: ["VIEWER"],
};

export function canAccess(userRole: string | undefined, requiredRole: string): boolean {
  if (!userRole) return false;
  const allowedRoles = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY];
  return allowedRoles?.includes(requiredRole) ?? false;
}
