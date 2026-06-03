import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type HomeSectionProps = {
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
};

export function HomeSection({
  title,
  description,
  href,
  actionLabel = "Ver tudo",
  children,
  className,
}: HomeSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary hover:underline"
          >
            {actionLabel}
            <ChevronRight className="size-4" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
