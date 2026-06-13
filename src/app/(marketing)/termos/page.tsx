import type { Metadata } from "next";

import { LegalDocument } from "@/components/marketing/legal-document";
import { termsSections } from "@/config/legal-content";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos e condições de uso do Chefe da Casa.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Termos de Uso"
      description="Regras para utilização da plataforma Chefe da Casa."
      sections={termsSections}
    />
  );
}
