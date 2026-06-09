"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { StorefrontProvider } from "@/lib/storefront-context";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <StorefrontProvider>
      {children}
    </StorefrontProvider>
  );
}
