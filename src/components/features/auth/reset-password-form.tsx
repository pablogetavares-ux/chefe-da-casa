"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction, type AuthActionState } from "@/lib/actions/auth";

const initialState: AuthActionState = {};

type ResetPasswordFormProps = {
  next?: string;
};

export function ResetPasswordForm({ next }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <Card className="w-full max-w-md border-border/60 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LockKeyhole className="size-6" />
        </div>
        <CardTitle className="font-heading text-2xl">Nova senha</CardTitle>
        <CardDescription>
          Escolha uma senha segura com no mínimo 8 caracteres.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {next && <input type="hidden" name="next" value={next} />}
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-10"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="h-10 w-full" disabled={pending}>
            {pending ? "Salvando..." : "Redefinir senha"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Voltar ao login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
