"use client";

import { AuthProvider } from "@/lib/hooks/use-auth";
import { SettingsProvider } from "@/lib/hooks/use-settings";
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
