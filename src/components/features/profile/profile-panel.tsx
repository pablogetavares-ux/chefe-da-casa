"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { User } from "lucide-react";

import { ChangePasswordForm } from "@/components/features/profile/change-password-form";
import { BillingSection } from "@/components/features/profile/billing-section";
import { FitnessProfileSection } from "@/components/features/profile/fitness-profile-section";
import { OfferPreferencesSection } from "@/components/features/profile/offer-preferences-section";
import { PrivacyDataSection } from "@/components/features/profile/privacy-data-section";
import { SeniorModeSection } from "@/components/features/profile/senior-mode-section";
import { AnimatedPage } from "@/components/shared/motion";
import { ErrorFallback } from "@/components/shared/error-fallback";
import { PageHeader } from "@/components/shared/page-header";
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
import { useProfile, useUpdateProfile } from "@/hooks/use-api";
import { AuthLoading } from "@/hooks/use-auth";

type ProfilePanelProps = {
  billingAvailable: boolean;
  billingMock?: boolean;
};

export function ProfilePanel({
  billingAvailable,
  billingMock = false,
}: ProfilePanelProps) {
  const searchParams = useSearchParams();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const [editedName, setEditedName] = useState<string | null>(null);
  const fullName = editedName ?? profile?.full_name ?? "";

  useEffect(() => {
    const billing = searchParams.get("billing");
    if (billing === "success") {
      toast.success(
        "Assinatura confirmada! Seu plano será atualizado em instantes.",
      );
    }
    if (billing === "mock-success") {
      toast.success("Plano atualizado (modo demonstração).");
    }
    if (billing === "canceled") {
      toast.message("Checkout cancelado.");
    }
  }, [searchParams]);

  if (isLoading) {
    return <AuthLoading label="Carregando perfil..." />;
  }

  if (error) {
    return (
      <AnimatedPage>
        <PageHeader
          title="Perfil"
          description="Gerencie sua conta, senha e plano."
        />
        <ErrorFallback
          title="Erro ao carregar perfil"
          message={error.message}
        />
      </AnimatedPage>
    );
  }

  const handleSaveProfile = () => {
    updateProfile.mutate(
      { fullName: fullName.trim() },
      { onSuccess: () => setEditedName(null) },
    );
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="Perfil"
        description="Gerencie sua conta, senha e plano."
      />

      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5 text-primary" />
            Dados da conta
          </CardTitle>
          <CardDescription>Informações básicas do seu perfil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(event) => setEditedName(event.target.value)}
              placeholder="Seu nome"
              className="h-10 max-w-md"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              value={profile?.email ?? ""}
              disabled
              className="h-10 max-w-md"
            />
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={updateProfile.isPending || fullName.trim().length < 2}
          >
            {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>

      <FitnessProfileSection profile={profile!} />

      <SeniorModeSection profile={profile!} />

      <OfferPreferencesSection />

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>Altere sua senha de acesso.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <BillingSection
        billingAvailable={billingAvailable}
        billingMock={billingMock}
      />

      <PrivacyDataSection email={profile?.email ?? ""} />
    </AnimatedPage>
  );
}
