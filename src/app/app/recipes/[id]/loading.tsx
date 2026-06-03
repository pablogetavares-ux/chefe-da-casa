import { Skeleton } from "@/components/ui/skeleton";

export default function RecipeDetailLoading() {
  return (
    <div className="space-y-8" aria-busy aria-label="Carregando receita">
      <Skeleton className="h-10 w-2/3 max-w-lg" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
