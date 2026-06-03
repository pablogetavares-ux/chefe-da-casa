"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, ShieldAlert, Trash2 } from "lucide-react";

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
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDeleteAccount, useExportMyData } from "@/hooks/use-api";
import { createClient } from "@/lib/supabase/client";

type PrivacyDataSectionProps = {
  email: string;
};

export function PrivacyDataSection({ email }: PrivacyDataSectionProps) {
  const exportData = useExportMyData();
  const deleteAccount = useDeleteAccount();
  const { confirm, dialog } = useConfirmDialog();
  const [confirmEmail, setConfirmEmail] = useState("");

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Excluir conta permanentemente?",
      description:
        "Todos os seus dados serão removidos: receitas, despensa, favoritos e histórico. Esta ação não pode ser desfeita.",
      confirmLabel: "Excluir conta",
      destructive: true,
    });
    if (!ok) return;

    deleteAccount.mutate(
      { confirmEmail },
      {
        onSuccess: async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          window.location.href = "/login?deleted=1";
        },
      },
    );
  };

  return (
    <>
      <Card className="surface-card border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-primary" />
            Privacidade e dados (LGPD)
          </CardTitle>
          <CardDescription>
            Exporte seus dados ou exclua sua conta conforme a Lei Geral de
            Proteção de Dados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Exportar meus dados</p>
              <p className="text-sm text-muted-foreground">
                Baixa um arquivo JSON com perfil, receitas, despensa e
                histórico.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => exportData.mutate()}
              disabled={exportData.isPending}
            >
              <Download className="mr-2 size-4" />
              {exportData.isPending ? "Preparando..." : "Baixar dados"}
            </Button>
          </div>

          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                Excluir conta
              </p>
              <p className="text-sm text-muted-foreground">
                Digite seu e-mail (<strong>{email}</strong>) para confirmar.
              </p>
            </div>
            <div className="space-y-2 max-w-md">
              <Label htmlFor="confirmEmail">Confirmar e-mail</Label>
              <Input
                id="confirmEmail"
                type="email"
                value={confirmEmail}
                onChange={(event) => setConfirmEmail(event.target.value)}
                placeholder={email}
                autoComplete="off"
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                deleteAccount.isPending ||
                confirmEmail.trim().toLowerCase() !== email.toLowerCase()
              }
            >
              <Trash2 className="mr-2 size-4" />
              {deleteAccount.isPending ? "Excluindo..." : "Excluir minha conta"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Leia também:{" "}
            <Link href="/privacidade" className="underline">
              Política de Privacidade
            </Link>
            {" · "}
            <Link href="/termos" className="underline">
              Termos de Uso
            </Link>
          </p>
        </CardContent>
      </Card>
      {dialog}
    </>
  );
}
