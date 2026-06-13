"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

import { BillingStatusBanner } from "@/components/shared/billing-status-banner";
import { NetworkRecoveryListener } from "@/components/shared/network-recovery-listener";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { usePantryItems } from "@/hooks/use-api";

const OnboardingDialog = dynamic(
  () =>
    import("@/components/features/onboarding/onboarding-dialog").then(
      (mod) => mod.OnboardingDialog,
    ),
  { ssr: false },
);

const ONBOARDING_KEY = "chef-onboarding-v1";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type AppExperienceProps = {
  children: React.ReactNode;
};

export function AppExperience({ children }: AppExperienceProps) {
  const mounted = useMounted();
  const needsPantryCheck =
    mounted &&
    typeof window !== "undefined" &&
    !localStorage.getItem(ONBOARDING_KEY);

  const { data: pantryItems, isLoading } = usePantryItems({
    enabled: needsPantryCheck,
  });
  const pantryEmpty =
    needsPantryCheck && !isLoading && (pantryItems?.length ?? 0) === 0;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg focus:ring-2 focus:ring-ring"
      >
        Pular para o conteúdo
      </a>
      <OfflineBanner />
      <BillingStatusBanner />
      <NetworkRecoveryListener />
      {children}
      {needsPantryCheck && <OnboardingDialog showWhenEmpty={pantryEmpty} />}
    </>
  );
}
