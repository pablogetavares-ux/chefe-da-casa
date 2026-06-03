"use client";

import { motion } from "framer-motion";
import { type ReactNode, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Preferência do SO sem o aviso de dev do Framer Motion. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** SSR-safe: motion prefs só após mount para evitar hydration mismatch. */
function useMotionReady() {
  const reduce = usePrefersReducedMotion();
  const mounted = useMounted();

  return { mounted, reduce: mounted && reduce };
}

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { mounted, reduce } = useMotionReady();

  if (!mounted || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInView({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { mounted, reduce } = useMotionReady();

  if (!mounted || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { mounted, reduce } = useMotionReady();

  if (!mounted || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { mounted, reduce } = useMotionReady();

  if (!mounted || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { mounted, reduce } = useMotionReady();

  if (!mounted || reduce) {
    return <div className={cn("space-y-8", className)}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
      className={cn("space-y-8", className)}
    >
      {children}
    </motion.div>
  );
}
