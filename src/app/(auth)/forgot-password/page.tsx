import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Recuperar senha",
  robots: { index: false },
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const next = getSafeRedirectPath(params.next);

  return (
    <section className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
      <ForgotPasswordForm next={next} />
    </section>
  );
}
