import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Inicializar cliente Prisma com tratamento de erro para builds
let prismaClient: PrismaClient;

if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE === "phase-production-build") {
  // Durante o build, criar um cliente que não falha completamente
  prismaClient = new PrismaClient({
    errorFormat: 'minimal',
  });

  // Catch para evitar que falhas de conexão interrompam o build
  process.on('uncaughtException', (e) => {
    if (e.message.includes('Can\'t reach database')) {
      console.warn('Ignorando erro de conexão com o banco durante build');
    } else {
      throw e;
    }
  });
} else {
  prismaClient = globalForPrisma.prisma ?? new PrismaClient();
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
