import type { Metadata } from "next";

import { SignupForm } from "@/components/features/auth/signup-form";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false },
};

type SignupPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const next = getSafeRedirectPath(params.next);

  return (
    <section className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
      <SignupForm next={next} />
    </section>
  );
}
