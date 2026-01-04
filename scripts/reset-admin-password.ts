import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// URL do banco de dados Neon de produção
const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_Hvcdg45ThFpz@ep-divine-voice-ac4yjarg-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Inicializa o Prisma Client com a URL do banco Neon
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: NEON_DATABASE_URL
    }
  }
});

// Email e nova senha do administrador
const ADMIN_EMAIL = "admin@omocodoteamo.com.br";
const NEW_PASSWORD = "admin123"; // Senha simples para garantir compatibilidade

async function main() {
  try {
    console.log(`Verificando se o usuário ${ADMIN_EMAIL} existe...`);

    // Verificar se o usuário admin já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12);

    if (existingUser) {
      // Atualizar a senha do usuário existente
      const updatedUser = await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { password: hashedPassword },
      });

      console.log(`Senha do usuário ${updatedUser.email} atualizada com sucesso!`);
    } else {
      // Criar um novo usuário admin
      const newUser = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          password: hashedPassword,
          nome: "Administrador",
        },
      });

      console.log(`Novo usuário admin criado: ${newUser.email}`);
    }

    console.log(`Pronto! Agora você pode fazer login com:
Email: ${ADMIN_EMAIL}
Senha: ${NEW_PASSWORD}`);

  } catch (error) {
    console.error("Erro ao resetar senha do administrador:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
main();