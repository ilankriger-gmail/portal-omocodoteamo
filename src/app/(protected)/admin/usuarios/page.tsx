import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UsersList } from "./users-list";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      nome: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);
  const users = await getUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Administradores</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Gerencie os usuários que têm acesso ao painel administrativo
      </p>

      <UsersList
        users={users}
        currentUserEmail={session?.user?.email || ""}
      />
    </div>
  );
}
