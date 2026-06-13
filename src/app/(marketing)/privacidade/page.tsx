import type { Metadata } from "next";

import { LegalDocument } from "@/components/marketing/legal-document";
import { privacySections } from "@/config/legal-content";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Chefe da Casa coleta, usa e protege seus dados pessoais (LGPD).",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Política de Privacidade"
      description="Transparência sobre o tratamento dos seus dados pessoais."
      sections={privacySections}
    />
  );
}
