"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Camera,
  Check,
  Loader2,
  ScanLine,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RECIPE_GENERATION_MODES,
  RECIPE_MODE_LABELS,
  type RecipeGenerationMode,
} from "@/lib/ai/constants/recipe-modes";
import {
  useAiStatus,
  useAiUsage,
  useScanAndGenerate,
  useScanIngredients,
  useUploadScan,
} from "@/hooks/use-api";
import { cn } from "@/lib/utils";

type IngredientScannerPanelProps = {
  onIngredientsDetected?: (names: string[]) => void;
};

export function IngredientScannerPanel({
  onIngredientsDetected,
}: IngredientScannerPanelProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadScan = useUploadScan();
  const scanIngredients = useScanIngredients();
  const scanAndGenerate = useScanAndGenerate();
  const { data: usage } = useAiUsage();
  const { data: aiStatus } = useAiStatus();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [context, setContext] = useState("");
  const [mode, setMode] = useState<RecipeGenerationMode>("STANDARD");
  const [detectedNames, setDetectedNames] = useState<string[]>([]);
  const [sceneDescription, setSceneDescription] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedDetected, setSelectedDetected] = useState<Set<string>>(
    new Set(),
  );

  const isBusy =
    uploadScan.isPending ||
    scanIngredients.isPending ||
    scanAndGenerate.isPending;

  const limitReached = usage ? usage.remaining <= 0 : false;
  const aiDisabled = aiStatus?.configured === false;
  const actionsDisabled = !selectedFile || isBusy || limitReached || aiDisabled;

  function resetPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStoragePath(null);
    setSelectedFile(null);
    setDetectedNames([]);
    setSceneDescription("");
    setSuggestions([]);
    setSelectedDetected(new Set());
  }

  function handleFileSelect(file: File) {
    resetPreview();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleUploadAndScan(addToPantry: boolean) {
    if (!selectedFile) return;

    try {
      const uploaded = await uploadScan.mutateAsync(selectedFile);
      setStoragePath(uploaded.storagePath);

      const result = await scanIngredients.mutateAsync({
        storagePath: uploaded.storagePath,
        context: context.trim() || undefined,
        addToPantry,
      });

      setDetectedNames(result.ingredientNames);
      setSceneDescription(result.sceneDescription);
      setSuggestions(result.suggestions);
      setSelectedDetected(new Set(result.ingredientNames));
      onIngredientsDetected?.(result.ingredientNames);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao escanear ingredientes.",
      );
    }
  }

  async function handleScanAndGenerate() {
    if (!selectedFile && !storagePath) return;

    try {
      let path = storagePath;
      if (!path && selectedFile) {
        const uploaded = await uploadScan.mutateAsync(selectedFile);
        path = uploaded.storagePath;
        setStoragePath(path);
      }

      if (!path) return;

      const result = await scanAndGenerate.mutateAsync({
        storagePath: path,
        context: context.trim() || undefined,
        mode,
      });

      if (result.scan?.ingredientNames?.length) {
        setDetectedNames(result.scan.ingredientNames);
        setSceneDescription(result.scan.sceneDescription);
        setSuggestions(result.scan.suggestions);
      }

      router.push(`/app/recipes/${result.recipe.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao gerar receita do scan.",
      );
    }
  }

  function toggleDetected(name: string) {
    setSelectedDetected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <Card className="surface-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="size-5 text-primary" />
          Scanner de ingredientes
        </CardTitle>
        <CardDescription>
          Fotografe sua despensa, geladeira ou bancada. A IA reconhece os
          alimentos e gera receitas automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {!previewUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-12 transition-colors hover:border-primary/50 hover:bg-primary/10"
          >
            <div className="inline-flex rounded-2xl bg-primary/10 p-4 text-primary">
              <Camera className="size-8" />
            </div>
            <div className="text-center">
              <p className="font-medium">Tirar foto ou enviar imagem</p>
              <p className="mt-1 text-sm text-muted-foreground">
                JPEG, PNG ou WebP · máx. 5 MB
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="gap-1">
                <Camera className="size-3" />
                Câmera
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Upload className="size-3" />
                Galeria
              </Badge>
            </div>
          </button>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview do scan"
              className="max-h-64 w-full object-cover"
              decoding="async"
            />
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              className="absolute top-2 right-2"
              aria-label="Remover imagem"
              onClick={resetPreview}
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="scan-context">Contexto (opcional)</Label>
          <Input
            id="scan-context"
            placeholder="Ex: ingredientes na geladeira, prateleira da despensa..."
            value={context}
            onChange={(event) => setContext(event.target.value)}
            disabled={isBusy}
          />
        </div>

        <div className="space-y-2">
          <Label>Modo da receita</Label>
          <div className="flex flex-wrap gap-2">
            {RECIPE_GENERATION_MODES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  mode === item
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                {RECIPE_MODE_LABELS[item].label}
              </button>
            ))}
          </div>
        </div>

        {isBusy && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <p className="text-sm text-muted-foreground">
              Analisando imagem com visão computacional...
            </p>
          </div>
        )}

        {sceneDescription && (
          <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
            {sceneDescription}
          </div>
        )}

        {detectedNames.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Ingredientes detectados ({selectedDetected.size}/
              {detectedNames.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {detectedNames.map((name) => {
                const active = selectedDetected.has(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleDetected(name)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {active && <Check className="size-3.5" />}
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {suggestions.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={actionsDisabled}
            onClick={() => handleUploadAndScan(false)}
          >
            {scanIngredients.isPending || uploadScan.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ScanLine className="size-4" />
            )}
            Escanear ingredientes
          </Button>

          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={actionsDisabled}
            onClick={() => handleUploadAndScan(true)}
          >
            <Upload className="size-4" />
            Escanear + despensa
          </Button>

          <Button
            type="button"
            className="gap-2 sm:ml-auto"
            disabled={actionsDisabled}
            onClick={handleScanAndGenerate}
          >
            {scanAndGenerate.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Escanear e gerar receita
          </Button>
        </div>

        {(limitReached || aiDisabled) && (
          <p className="text-center text-xs text-muted-foreground">
            {aiDisabled
              ? "Configure OPENAI_API_KEY no .env para habilitar o scanner."
              : "Limite mensal de IA atingido."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
