import type { Metadata } from "next";

import { LegalDocument } from "@/components/marketing/legal-document";
import { cookiesSections } from "@/config/legal-content";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Como usamos cookies no Chefe da Casa.",
};

export default function CookiesPage() {
  return (
    <LegalDocument
      title="Política de Cookies"
      description="Informações sobre cookies essenciais e analíticos."
      sections={cookiesSections}
    />
  );
}
