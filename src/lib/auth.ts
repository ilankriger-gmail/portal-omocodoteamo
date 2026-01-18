import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

// Rate limiting simples em memória (para produção, usar Redis/Upstash)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

function checkRateLimit(email: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (!attempts) {
    return { allowed: true };
  }

  // Reset se passou o tempo de lockout
  if (now - attempts.lastAttempt > LOCKOUT_TIME) {
    loginAttempts.delete(email);
    return { allowed: true };
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_TIME - (now - attempts.lastAttempt)) / 1000 / 60);
    return { allowed: false, remainingTime };
  }

  return { allowed: true };
}

function recordLoginAttempt(email: string, success: boolean) {
  if (success) {
    loginAttempts.delete(email);
    return;
  }

  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  loginAttempts.set(email, {
    count: attempts.count + 1,
    lastAttempt: Date.now(),
  });
}

// Validar NEXTAUTH_SECRET em produção
const secret = process.env.NEXTAUTH_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error("NEXTAUTH_SECRET deve ser definido em produção!");
}

export const authOptions: NextAuthOptions = {
  // Configuração de cookies com segurança reforçada
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict', // Proteção CSRF mais forte
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60, // 24 horas (reduzido de 30 dias)
      },
    },
  },
  // Configurações de segurança
  debug: process.env.NODE_ENV === 'development',
  secret: secret || "dev-only-secret-do-not-use-in-production",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        // Verificar rate limiting
        const rateLimit = checkRateLimit(credentials.email);
        if (!rateLimit.allowed) {
          throw new Error(`Muitas tentativas. Tente novamente em ${rateLimit.remainingTime} minutos.`);
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          recordLoginAttempt(credentials.email, false);
          throw new Error("Credenciais inválidas"); // Mensagem genérica por segurança
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          recordLoginAttempt(credentials.email, false);
          throw new Error("Credenciais inválidas"); // Mensagem genérica por segurança
        }

        // Login bem-sucedido - limpar tentativas
        recordLoginAttempt(credentials.email, true);

        return {
          id: user.id,
          email: user.email,
          name: user.nome,
          role: (user as any).role || "ADMIN", // Incluir role
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas (reduzido de 30 dias)
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
};
