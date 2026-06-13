"use client";

import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { OffersUserContextSummary } from "@/modules/offers/types";

type OffersPersonalizationHintProps = {
  userContext?: OffersUserContextSummary | null;
  className?: string;
};

export function OffersPersonalizationHint({
  userContext,
  className,
}: OffersPersonalizationHintProps) {
  if (!userContext?.personalizationReason) return null;

  return (
    <div className={className}>
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
        <span>{userContext.personalizationReason}</span>
      </p>
      {userContext.priorityLabels.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {userContext.priorityLabels.slice(0, 4).map((label) => (
            <Badge key={label} variant="secondary" className="font-normal">
              {label}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
