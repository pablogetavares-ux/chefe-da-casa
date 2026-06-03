"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Refrigerator,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "chef-onboarding-v1";

const STEPS = [
  {
    icon: ChefHat,
    title: "Bem-vindo ao Chef da Casa",
    description:
      "Sua cozinha inteligente: cadastre ingredientes, gere receitas com IA e organize suas compras.",
  },
  {
    icon: Refrigerator,
    title: "Monte sua despensa",
    description:
      "Adicione o que você tem em casa. Quanto mais completa, melhores as sugestões da IA.",
  },
  {
    icon: Sparkles,
    title: "Gere receitas personalizadas",
    description:
      "Escolha ingredientes, preferências dietéticas e deixe a IA criar receitas saudáveis em segundos.",
  },
] as const;

type OnboardingDialogProps = {
  /** Mostrar onboarding quando despensa está vazia (primeiro uso). */
  showWhenEmpty?: boolean;
};

export function OnboardingDialog({
  showWhenEmpty = true,
}: OnboardingDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (!showWhenEmpty) return;

    const timer = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(timer);
  }, [showWhenEmpty]);

  function complete() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    complete();
  }

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onClose={complete}>
        <DialogHeader>
          <div className="mb-2 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
            <Icon className="size-6" aria-hidden />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <DialogTitle>{current.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {current.description}
              </DialogDescription>
            </motion.div>
          </AnimatePresence>
        </DialogHeader>

        <div className="mt-6 flex justify-center gap-2">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === step ? "w-8 bg-primary" : "w-1.5 bg-muted",
              )}
              aria-hidden
            />
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={complete}>
            Pular
          </Button>
          {isLast ? (
            <Link href="/app/pantry" onClick={complete}>
              <Button type="button" className="gap-2">
                <CheckCircle2 className="size-4" />
                Começar
              </Button>
            </Link>
          ) : (
            <Button type="button" onClick={handleNext} className="gap-2">
              Próximo
              <ArrowRight className="size-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
