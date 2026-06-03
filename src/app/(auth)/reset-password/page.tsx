import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Redefinir senha",
  robots: { index: false },
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const next = getSafeRedirectPath(params.next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password");
  }

  return (
    <section className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
      <ResetPasswordForm next={next} />
    </section>
  );
}
