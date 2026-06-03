"use client";

import Link from "next/link";
import { useActionState } from "react";
import { KeyRound } from "lucide-react";

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
import { forgotPasswordAction, type AuthActionState } from "@/lib/actions/auth";
import {
  AuthCaptchaProvider,
  AuthTurnstileField,
  useAuthCaptcha,
} from "@/components/features/auth/auth-captcha";

const initialState: AuthActionState = {};

type ForgotPasswordFormProps = {
  next?: string;
};

export function ForgotPasswordForm({ next }: ForgotPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <AuthCaptchaProvider>
      <ForgotPasswordFormContent
        next={next}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </AuthCaptchaProvider>
  );
}

function ForgotPasswordFormContent({
  next,
  state,
  formAction,
  pending,
}: {
  next?: string;
  state: AuthActionState;
  formAction: (payload: FormData) => void;
  pending: boolean;
}) {
  const { enabled, isReady } = useAuthCaptcha();
  const submitBlocked = pending || (enabled && !isReady);

  return (
    <Card className="w-full max-w-md border-border/60 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <KeyRound className="size-6" />
        </div>
        <CardTitle className="font-heading text-2xl">Recuperar senha</CardTitle>
        <CardDescription>
          Enviaremos um link para redefinir sua senha.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
              {state.success}
            </div>
          )}
          {next && <input type="hidden" name="next" value={next} />}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="voce@email.com"
              required
              autoComplete="email"
              className="h-10"
            />
          </div>
          <AuthTurnstileField />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="h-10 w-full"
            disabled={submitBlocked}
          >
            {pending ? "Enviando..." : "Enviar link de recuperação"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Lembrou a senha?{" "}
            <Link
              href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
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
