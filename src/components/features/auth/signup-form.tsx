"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Sparkles } from "lucide-react";

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
import { signupAction, type AuthActionState } from "@/lib/actions/auth";
import { GoogleAuthButton } from "@/components/features/auth/google-auth-button";
import {
  AuthCaptchaProvider,
  AuthTurnstileField,
  useAuthCaptcha,
} from "@/components/features/auth/auth-captcha";
import { Separator } from "@/components/ui/separator";

const initialState: AuthActionState = {};

type SignupFormProps = {
  next?: string;
};

export function SignupForm({ next }: SignupFormProps) {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState,
  );

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <AuthCaptchaProvider>
      <SignupFormContent
        next={next}
        state={state}
        loginHref={loginHref}
        formAction={formAction}
        pending={pending}
      />
    </AuthCaptchaProvider>
  );
}

function SignupFormContent({
  next,
  state,
  loginHref,
  formAction,
  pending,
}: {
  next?: string;
  state: AuthActionState;
  loginHref: string;
  formAction: (payload: FormData) => void;
  pending: boolean;
}) {
  const { enabled, isReady } = useAuthCaptcha();
  const submitBlocked = pending || (enabled && !isReady);

  return (
    <Card className="w-full max-w-md border-border/60 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-6" />
        </div>
        <CardTitle className="font-heading text-2xl">Criar conta</CardTitle>
        <CardDescription>
          Comece grátis e transforme sua despensa em receitas incríveis.
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
            <Label htmlFor="fullName">Nome</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Seu nome"
              required
              autoComplete="name"
              className="h-10"
            />
          </div>
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
            <Label htmlFor="password">Senha</Label>
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
          <AuthTurnstileField />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="h-10 w-full"
            disabled={submitBlocked}
          >
            {pending ? "Criando..." : "Criar conta grátis"}
          </Button>
          <div className="flex w-full items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>
          <GoogleAuthButton next={next} label="Cadastrar com Google" />
          <p className="text-center text-xs text-muted-foreground">
            Ao criar conta, você concorda com os{" "}
            <Link href="/termos" className="underline hover:text-foreground">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link
              href="/privacidade"
              className="underline hover:text-foreground"
            >
              Política de Privacidade
            </Link>
            .
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link
              href={loginHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
