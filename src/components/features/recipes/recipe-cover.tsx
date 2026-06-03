import Image from "next/image";
import { ChefHat } from "lucide-react";

import { cn } from "@/lib/utils";

type RecipeCoverProps = {
  title: string;
  coverImageUrl?: string | null;
  className?: string;
  priority?: boolean;
};

export function RecipeCover({
  title,
  coverImageUrl,
  className,
  priority,
}: RecipeCoverProps) {
  if (coverImageUrl) {
    return (
      <div
        className={cn(
          "relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted",
          className,
        )}
      >
        <Image
          src={coverImageUrl}
          alt={`Foto: ${title}`}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl",
        "bg-gradient-to-br from-primary/15 via-accent/30 to-primary/5",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.72_0.12_145/0.25),transparent_55%)]" />
      <ChefHat className="relative size-10 text-primary/50" strokeWidth={1.5} />
    </div>
  );
}
