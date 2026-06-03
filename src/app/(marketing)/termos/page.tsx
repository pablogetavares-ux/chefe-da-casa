import type { Metadata } from "next";

import { LegalDocument } from "@/components/marketing/legal-document";
import { termsSections } from "@/config/legal-content";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos e condições de uso do Chef da Casa AI.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Termos de Uso"
      description="Regras para utilização da plataforma Chef da Casa AI."
      sections={termsSections}
    />
  );
}
