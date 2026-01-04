import { prisma } from "@/lib/prisma";
import { FAQList } from "./faq-list";

// Definimos a página como dinâmica para que seja executada em runtime
export const dynamic = 'force-dynamic';

export default async function FAQsAdminPage() {
  const faqs = await prisma.fAQ.findMany({
    orderBy: { ordem: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gerenciar FAQs</h1>
      <FAQList initialFaqs={faqs} />
    </div>
  );
}
