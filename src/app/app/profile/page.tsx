import type { Metadata } from "next";
import { Suspense } from "react";

import { ProfilePanel } from "@/components/features/profile/profile-panel";
import { AuthLoading } from "@/hooks/use-auth";
import { isBillingAvailable, isBillingMockMode } from "@/lib/billing/mock";

export const metadata: Metadata = {
  title: "Perfil",
  robots: { index: false },
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<AuthLoading label="Carregando perfil..." />}>
      <ProfilePanel
        billingAvailable={isBillingAvailable()}
        billingMock={isBillingMockMode()}
      />
    </Suspense>
  );
}
