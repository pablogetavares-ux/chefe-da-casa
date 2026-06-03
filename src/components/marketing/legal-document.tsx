import Link from "next/link";

import { legalMeta, type LegalSection } from "@/config/legal-content";
import { cn } from "@/lib/utils";

type LegalDocumentProps = {
  title: string;
  description: string;
  sections: LegalSection[];
  className?: string;
};

export function LegalDocument({
  title,
  description,
  sections,
  className,
}: LegalDocumentProps) {
  return (
    <article
      className={cn(
        "container mx-auto max-w-3xl px-4 py-12 md:py-16",
        className,
      )}
    >
      <header className="mb-10 space-y-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">
          Última atualização: {legalMeta.lastUpdated} ·{" "}
          <Link href={`mailto:${legalMeta.contactEmail}`} className="underline">
            {legalMeta.contactEmail}
          </Link>
        </p>
      </header>
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-heading text-xl font-semibold">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
      <footer className="mt-12 border-t pt-6 text-sm text-muted-foreground">
        <p>
          Documentos relacionados:{" "}
          <Link href="/privacidade" className="underline hover:text-foreground">
            Privacidade
          </Link>
          {" · "}
          <Link href="/termos" className="underline hover:text-foreground">
            Termos
          </Link>
          {" · "}
          <Link href="/cookies" className="underline hover:text-foreground">
            Cookies
          </Link>
        </p>
      </footer>
    </article>
  );
}
