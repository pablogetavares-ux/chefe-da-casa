import { Skeleton } from "@/components/ui/skeleton";

type PanelSkeletonProps = {
  rows?: number;
  label?: string;
};

export function PanelSkeleton({
  rows = 4,
  label = "Carregando...",
}: PanelSkeletonProps) {
  return (
    <div className="space-y-4" aria-busy aria-label={label}>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
