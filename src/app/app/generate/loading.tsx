import { Skeleton } from "@/components/ui/skeleton";

export default function GenerateLoading() {
  return (
    <div className="space-y-8" aria-busy aria-label="Carregando gerador">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}
