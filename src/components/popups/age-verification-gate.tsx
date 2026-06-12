"use client";

import { useState, useEffect } from "react";
import AgeVerification from "./age-verification";

export default function AgeVerificationGate() {
  const [config, setConfig] = useState<{ enabled: boolean; minAge: number } | null>(null);

  useEffect(() => {
    try {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("kauvex-storefront="));
      if (cookie) {
        JSON.parse(decodeURIComponent(cookie.split("=")[1]));
        setConfig({ enabled: true, minAge: 18 });
      } else {
        setConfig({ enabled: false, minAge: 18 });
      }
    } catch {
      setConfig({ enabled: false, minAge: 18 });
    }
  }, []);

  if (!config?.enabled) return null;

  return <AgeVerification minAge={config.minAge} />;
}
