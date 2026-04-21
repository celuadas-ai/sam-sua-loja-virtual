import { ReactNode } from "react";
import { AlertTriangle, Loader2, RefreshCw, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useMapsHealth } from "@/hooks/useMapsHealth";

interface MapsHealthGuardProps {
  children: ReactNode;
  /** Shown while checking — defaults to a small spinner */
  loadingFallback?: ReactNode;
  /** If true, blocks children entirely on failure. If false, shows a warning above children. */
  block?: boolean;
}

/**
 * Wraps any map-rendering component. Verifies that Google Maps APIs + billing
 * are correctly configured before mounting the children.
 */
export function MapsHealthGuard({
  children,
  loadingFallback,
  block = true,
}: MapsHealthGuardProps) {
  const { health, isChecking, recheck } = useMapsHealth();

  if (isChecking && !health) {
    return (
      loadingFallback ?? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">A verificar serviço de mapas…</span>
        </div>
      )
    );
  }

  if (health && !health.ok) {
    const banner = (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm space-y-3"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-destructive">
              Mapa indisponível
            </p>
            <p className="text-foreground/80">{health.message}</p>
            {health.reason === "billing_disabled" && (
              <p className="text-xs text-muted-foreground mt-2">
                Vá ao Google Cloud Console → Billing e ative a faturação no projeto
                que contém a chave do Google Maps.
              </p>
            )}
            {health.reason === "apis_inactive" && (
              <ul className="text-xs text-muted-foreground mt-2 list-disc list-inside space-y-0.5">
                {health.checks
                  .filter((c) => !c.ok)
                  .map((c) => (
                    <li key={c.name}>
                      <span className="font-medium">{c.name}</span>
                      {c.status ? ` — ${c.status}` : ""}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
        <button
          onClick={recheck}
          disabled={isChecking}
          className="inline-flex items-center gap-2 text-xs font-medium text-destructive hover:underline disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
          Verificar novamente
        </button>
      </motion.div>
    );

    if (block) {
      return (
        <div className="space-y-3">
          {banner}
          <div className="rounded-xl bg-muted/40 border border-border flex flex-col items-center justify-center py-10 text-muted-foreground">
            <MapPin className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">Mapa não disponível</p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {banner}
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
