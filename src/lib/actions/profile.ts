"use server";

import { revalidatePath } from "next/cache";

import { translateAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/server";
import { changePasswordSchema } from "@/lib/validations";

export type ProfileActionState = {
  error?: string;
  success?: string;
};

export async function changePasswordAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
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

  if (!user?.email) {
    return { error: "Sessão expirada. Entre novamente." };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (verifyError) {
    return { error: "Senha atual incorreta." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: translateAuthError(error.message, error.code),
    };
  }

  revalidatePath("/app/profile");
  return { success: "Senha atualizada com sucesso." };
}
