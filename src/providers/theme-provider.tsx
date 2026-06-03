"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

import { themeConfig } from "@/config/theme";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={themeConfig.defaultTheme}
      enableSystem
      disableTransitionOnChange
      scriptProps={{ type: "application/json" }}
    >
      {children}
    </NextThemesProvider>
  );
}
