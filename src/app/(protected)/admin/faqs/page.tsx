import { prisma } from "@/lib/prisma";
import { FAQList } from "./faq-list";

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
