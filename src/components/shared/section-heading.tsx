import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground text-pretty md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
