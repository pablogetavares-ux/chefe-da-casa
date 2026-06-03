const AUTH_ERROR_MESSAGES: Record<string, string> = {
  email_not_confirmed: "E-mail ainda não confirmado. Tente entrar novamente.",
  invalid_credentials: "E-mail ou senha incorretos.",
  user_already_exists: "Este e-mail já está cadastrado. Tente entrar.",
  over_email_send_rate_limit:
    "Muitas tentativas. Aguarde alguns segundos e tente novamente.",
  over_request_rate_limit:
    "Muitas tentativas. Aguarde alguns segundos e tente novamente.",
  captcha_failed:
    "Verificação de segurança falhou. Recarregue a página e tente novamente.",
  invalid_captcha:
    "Verificação de segurança expirada. Confirme novamente antes de continuar.",
  same_password: "A nova senha deve ser diferente da senha atual.",
};

export function translateAuthError(message: string, code?: string) {
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }

  const rateLimitMatch = message.match(/after (\d+) seconds?/i);
  if (rateLimitMatch) {
    return `Aguarde ${rateLimitMatch[1]} segundos antes de tentar novamente.`;
  }

  if (message.toLowerCase().includes("email not confirmed")) {
    return AUTH_ERROR_MESSAGES.email_not_confirmed;
  }

  return message;
}
