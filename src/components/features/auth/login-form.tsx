"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ChefHat } from "lucide-react";

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
import { loginAction, type AuthActionState } from "@/lib/actions/auth";
import { GoogleAuthButton } from "@/components/features/auth/google-auth-button";
import {
  AuthCaptchaProvider,
  AuthTurnstileField,
  useAuthCaptcha,
} from "@/components/features/auth/auth-captcha";
import { Separator } from "@/components/ui/separator";

const initialState: AuthActionState = {};

type LoginFormProps = {
  next?: string;
  callbackError?: string;
  accountDeleted?: boolean;
};

export function LoginForm({
  next,
  callbackError,
  accountDeleted,
}: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  const error = state.error ?? callbackError;
  const signupHref = next
    ? `/signup?next=${encodeURIComponent(next)}`
    : "/signup";
  const forgotHref = next
    ? `/forgot-password?next=${encodeURIComponent(next)}`
    : "/forgot-password";

  return (
    <AuthCaptchaProvider>
      <LoginFormContent
        next={next}
        error={error}
        accountDeleted={accountDeleted}
        signupHref={signupHref}
        forgotHref={forgotHref}
        formAction={formAction}
        pending={pending}
      />
    </AuthCaptchaProvider>
  );
}

function LoginFormContent({
  next,
  error,
  accountDeleted,
  signupHref,
  forgotHref,
  formAction,
  pending,
}: {
  next?: string;
  error?: string;
  accountDeleted?: boolean;
  signupHref: string;
  forgotHref: string;
  formAction: (payload: FormData) => void;
  pending: boolean;
}) {
  const { enabled, isReady } = useAuthCaptcha();
  const submitBlocked = pending || (enabled && !isReady);

  return (
    <Card className="w-full max-w-md border-border/60 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ChefHat className="size-6" />
        </div>
        <CardTitle className="font-heading text-2xl">
          Bem-vindo de volta
        </CardTitle>
        <CardDescription>
          Entre para continuar cozinhando com inteligência.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {accountDeleted && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              Sua conta foi excluída com sucesso. Obrigado por usar o Chefe da
              Casa.
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href={forgotHref}
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
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
            {pending ? "Entrando..." : "Entrar"}
          </Button>
          <div className="flex w-full items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>
          <GoogleAuthButton next={next} />
          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link
              href={signupHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Criar conta grátis
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
