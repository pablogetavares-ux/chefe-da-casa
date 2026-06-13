"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/config/plans";
import { useBillingCheckout } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

type PlanSelectButtonProps = {
  planId: PlanId;
  isAuthenticated: boolean;
  isCurrent?: boolean;
  billingAvailable?: boolean;
  className?: string;
  variant?: "default" | "outline";
};

export function PlanSelectButton({
  planId,
  isAuthenticated,
  isCurrent = false,
  billingAvailable = false,
  className,
  variant,
}: PlanSelectButtonProps) {
  const router = useRouter();
  const checkout = useBillingCheckout();
  const isPro = planId === "pro";
  const isPending = checkout.isPending && checkout.variables === planId;
  const plan = PLANS[planId];

  const label = (() => {
    if (isCurrent) return "Plano atual";
    if (isPending) return "Atualizando...";
    if (!billingAvailable) return "Assinatura em breve";
    if (!isAuthenticated) {
      return planId === "free" ? "Começar grátis" : "Criar conta";
    }
    return planId === "free" ? "Usar plano grátis" : `Escolher ${plan.name}`;
  })();

  const disabled =
    isCurrent || isPending || (!billingAvailable && isAuthenticated);

  const buttonVariant = variant ?? (isPro ? "default" : "outline");

  if (!isAuthenticated && planId === "free") {
    return (
      <Link href="/signup" className={cn("mt-8 block", className)}>
        <Button className="min-h-11 w-full" variant={buttonVariant}>
          {label}
        </Button>
      </Link>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        className={cn("mt-8 min-h-11 w-full", className)}
        variant={buttonVariant}
        onClick={() => router.push("/signup")}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      className={cn("mt-8 min-h-11 w-full", className)}
      variant={buttonVariant}
      disabled={disabled}
      onClick={() => checkout.mutate(planId)}
    >
      {label}
    </Button>
  );
}
