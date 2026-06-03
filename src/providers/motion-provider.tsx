"use client";

import { MotionConfig } from "framer-motion";

import { usePrefersReducedMotion } from "@/components/shared/motion";

type MotionProviderProps = {
  children: React.ReactNode;
};

/** Evita aviso de dev do Framer Motion quando o Windows tem movimento reduzido. */
export function MotionProvider({ children }: MotionProviderProps) {
  const reduce = usePrefersReducedMotion();

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
