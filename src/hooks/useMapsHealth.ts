import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MapsHealthCheck {
  name: string;
  ok: boolean;
  status?: string;
  error?: string;
}

export interface MapsHealth {
  ok: boolean;
  reason: "ok" | "missing_key" | "billing_disabled" | "apis_inactive" | "network_error";
  message: string;
  checks: MapsHealthCheck[];
}

// Cache the result in-memory for 5 minutes to avoid spamming the edge function
let cached: { value: MapsHealth; expiresAt: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

export function useMapsHealth() {
  const [health, setHealth] = useState<MapsHealth | null>(
    cached && cached.expiresAt > Date.now() ? cached.value : null
  );
  const [isChecking, setIsChecking] = useState(!health);

  const check = async (force = false) => {
    if (!force && cached && cached.expiresAt > Date.now()) {
      setHealth(cached.value);
      setIsChecking(false);
      return cached.value;
    }
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-maps-apis");
      if (error || !data) {
        const fallback: MapsHealth = {
          ok: false,
          reason: "network_error",
          message: "Não foi possível verificar o estado do Google Maps.",
          checks: [],
        };
        setHealth(fallback);
        return fallback;
      }
      const result = data as MapsHealth;
      cached = { value: result, expiresAt: Date.now() + TTL_MS };
      setHealth(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!health) check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { health, isChecking, recheck: () => check(true) };
}
