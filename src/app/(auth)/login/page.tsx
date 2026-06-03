import type { Metadata } from "next";

import { LoginForm } from "@/components/features/auth/login-form";
import {
  getAuthCallbackErrorMessage,
  getSafeRedirectPath,
} from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false },
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string; deleted?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = getSafeRedirectPath(params.next);
  const callbackError = getAuthCallbackErrorMessage(params.error);
  const accountDeleted = params.deleted === "1";

  return (
    <section className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
      <LoginForm
        next={next}
        callbackError={callbackError}
        accountDeleted={accountDeleted}
      />
    </section>
  );
}
