/**
 * Utilitário para lidar com erros de banco de dados durante o build
 */

import { PrismaClient } from "@prisma/client";

// Wrapper para o PrismaClient que captura erros de conexão
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.warn("Database operation failed, using fallback:", error);
      return fallbackValue;
    }
    throw error;
  }
}

// Instância do Prisma com tratamento de erro
let prismaWithFallback: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prismaWithFallback = new Proxy(new PrismaClient(), {
    get(target, prop) {
      const value = target[prop as keyof PrismaClient];
      if (typeof value === "function") {
        return (...args: any[]) => {
          try {
            return value.apply(target, args);
          } catch (error) {
            console.warn(`Prisma ${String(prop)} operation failed:`, error);
            return null; // Fallback para operações do Prisma
          }
        };
      }
      return value;
    },
  });
} else {
  prismaWithFallback = new PrismaClient();
}

export { prismaWithFallback };