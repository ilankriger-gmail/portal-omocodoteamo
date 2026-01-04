import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditVaquinhaForm } from "./edit-form";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export default async function EditarVaquinhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vaquinha = await prisma.vaquinha.findUnique({
    where: { id },
  });

  if (!vaquinha) {
    notFound();
  }

  return (
    <div>
      <EditVaquinhaForm vaquinha={vaquinha} />
    </div>
  );
}
