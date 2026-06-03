"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { translateAuthError } from "@/lib/auth/errors";
import {
  captchaAuthOptions,
  readCaptchaToken,
  validateCaptchaToken,
} from "@/lib/auth/captcha";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import {
  buildAuthCallbackUrl,
  getRequestOrigin,
} from "@/lib/auth/request-origin";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validations";

export type AuthActionState = {
  error?: string;
  success?: string;
};

function readRedirectTarget(formData: FormData) {
  const next = formData.get("next");
  return getSafeRedirectPath(typeof next === "string" ? next : null);
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const captchaToken = readCaptchaToken(formData);
  const captchaError = validateCaptchaToken(captchaToken);
  if (captchaError) return captchaError;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    ...parsed.data,
    options: captchaAuthOptions(captchaToken),
  });

  if (error) {
    return {
      error: translateAuthError(error.message, error.code),
    };
  }

  revalidatePath("/app", "layout");
  redirect(readRedirectTarget(formData));
}

export async function signupAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const captchaToken = readCaptchaToken(formData);
  const captchaError = validateCaptchaToken(captchaToken);
  if (captchaError) return captchaError;

  const redirectTo = readRedirectTarget(formData);
  const supabase = await createClient();
  const captchaOptions = captchaAuthOptions(captchaToken);
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      ...captchaOptions,
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    return {
      error: translateAuthError(error.message, error.code),
    };
  }

  if (data.session) {
    revalidatePath("/app", "layout");
    redirect(redirectTo);
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    options: captchaAuthOptions(captchaToken),
  });

  if (!signInError) {
    revalidatePath("/app", "layout");
    redirect(redirectTo);
  }

  if (
    signInError.message.toLowerCase().includes("email not confirmed") ||
    signInError.code === "email_not_confirmed"
  ) {
    return {
      success:
        "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.",
    };
  }

  return {
    error: translateAuthError(signInError.message, signInError.code),
  };
}

export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const captchaToken = readCaptchaToken(formData);
  const captchaError = validateCaptchaToken(captchaToken);
  if (captchaError) return captchaError;

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const redirectTo = buildAuthCallbackUrl(origin, "/reset-password");

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo,
      ...(captchaAuthOptions(captchaToken) ?? {}),
    },
  );

  if (error) {
    return {
      error: translateAuthError(error.message, error.code),
    };
  }

  return {
    success:
      "Se existir uma conta com este e-mail, enviamos um link para redefinir sua senha.",
  };
}

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Sessão expirada. Solicite um novo link de recuperação.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: translateAuthError(error.message, error.code),
    };
  }

  revalidatePath("/app", "layout");
  redirect(readRedirectTarget(formData));
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signInWithGoogleAction(formData: FormData) {
  const next = readRedirectTarget(formData);
  const captchaToken = readCaptchaToken(formData);
  const captchaError = validateCaptchaToken(captchaToken);
  if (captchaError) return captchaError;

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const captchaOptions = captchaAuthOptions(captchaToken);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      ...captchaOptions,
      redirectTo: buildAuthCallbackUrl(origin, next),
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    return {
      error: translateAuthError(error.message, error.code),
    } satisfies AuthActionState;
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "Não foi possível iniciar login com Google." };
}
