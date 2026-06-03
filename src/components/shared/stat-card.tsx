import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  description: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  actionLabel?: string;
  accent?: "primary" | "accent" | "amber" | "rose";
};

const accentStyles = {
  primary: {
    card: "border-primary/20 bg-gradient-to-br from-primary/5 to-card",
    icon: "bg-primary/10 text-primary",
    value: "text-primary",
  },
  accent: {
    card: "border-accent-foreground/10 bg-gradient-to-br from-accent/40 to-card",
    icon: "bg-accent text-accent-foreground",
    value: "text-foreground",
  },
  amber: {
    card: "border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-card",
    icon: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-400",
  },
  rose: {
    card: "border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-card",
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    value: "text-rose-600 dark:text-rose-400",
  },
};

export function StatCard({
  title,
  description,
  value,
  icon: Icon,
  href,
  actionLabel = "Ver",
  accent = "primary",
}: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <Card
      className={cn(
        "overflow-hidden shadow-sm transition-shadow hover:shadow-md",
        styles.card,
      )}
    >
      <CardHeader className="pb-2">
        <div className={cn("mb-2 inline-flex rounded-xl p-2.5", styles.icon)}>
          <Icon className="size-5" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <span
          className={cn(
            "font-heading text-4xl font-semibold tabular-nums",
            styles.value,
          )}
        >
          {value}
        </span>
        {href && (
          <Link href={href}>
            <Button variant="outline" size="sm">
              {actionLabel}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
