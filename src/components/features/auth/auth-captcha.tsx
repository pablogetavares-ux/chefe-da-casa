"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { TurnstileWidget } from "@/components/features/auth/turnstile-widget";
import { CAPTCHA_FORM_FIELD } from "@/lib/auth/captcha";

const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;

type AuthCaptchaContextValue = {
  enabled: boolean;
  token: string | null;
  isReady: boolean;
  onSuccess: (token: string) => void;
  onExpire: () => void;
};

const AuthCaptchaContext = createContext<AuthCaptchaContextValue | null>(null);

export function AuthCaptchaProvider({ children }: { children: ReactNode }) {
  const enabled = Boolean(turnstileSiteKey);
  const [token, setToken] = useState<string | null>(null);

  const onSuccess = useCallback((value: string) => {
    setToken(value);
  }, []);

  const onExpire = useCallback(() => {
    setToken(null);
  }, []);

  const value = useMemo<AuthCaptchaContextValue>(
    () => ({
      enabled,
      token,
      isReady: !enabled || Boolean(token),
      onSuccess,
      onExpire,
    }),
    [enabled, token, onSuccess, onExpire],
  );

  return (
    <AuthCaptchaContext.Provider value={value}>
      {children}
    </AuthCaptchaContext.Provider>
  );
}

export function useAuthCaptcha() {
  const context = useContext(AuthCaptchaContext);
  if (!context) {
    throw new Error("useAuthCaptcha must be used within AuthCaptchaProvider");
  }
  return context;
}

export function AuthTurnstileField() {
  const { enabled, token, onSuccess, onExpire } = useAuthCaptcha();

  if (!enabled || !turnstileSiteKey) return null;

  return (
    <div className="space-y-2">
      <TurnstileWidget
        siteKey={turnstileSiteKey}
        onSuccess={onSuccess}
        onExpire={onExpire}
      />
      <input
        type="hidden"
        name={CAPTCHA_FORM_FIELD}
        value={token ?? ""}
        readOnly
      />
    </div>
  );
}
