import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApiCheck {
  name: string;
  ok: boolean;
  status?: string;
  error?: string;
}

async function checkGeocoding(key: string): Promise<ApiCheck> {
  try {
    const r = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=-25.9676,32.5654&key=${key}`
    );
    const j = await r.json();
    return {
      name: "Geocoding API",
      ok: j.status === "OK" || j.status === "ZERO_RESULTS",
      status: j.status,
      error: j.error_message,
    };
  } catch (e) {
    return { name: "Geocoding API", ok: false, error: String(e) };
  }
}

async function checkDirections(key: string): Promise<ApiCheck> {
  try {
    const r = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=-25.9676,32.5654&destination=-25.96,32.57&key=${key}`
    );
    const j = await r.json();
    return {
      name: "Directions API",
      ok: j.status === "OK" || j.status === "ZERO_RESULTS",
      status: j.status,
      error: j.error_message,
    };
  } catch (e) {
    return { name: "Directions API", ok: false, error: String(e) };
  }
}

async function checkPlaces(key: string): Promise<ApiCheck> {
  try {
    // Places Autocomplete (new) — uses the legacy endpoint that most apps depend on
    const r = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Maputo&key=${key}`
    );
    const j = await r.json();
    return {
      name: "Places API",
      ok: j.status === "OK" || j.status === "ZERO_RESULTS",
      status: j.status,
      error: j.error_message,
    };
  } catch (e) {
    return { name: "Places API", ok: false, error: String(e) };
  }
}

async function checkMapsJs(key: string): Promise<ApiCheck> {
  try {
    // Loader script returns 200 even with errors, but body contains the real status
    const r = await fetch(
      `https://maps.googleapis.com/maps/api/js?key=${key}`
    );
    const text = await r.text();
    const hasError =
      text.includes("InvalidKeyMapError") ||
      text.includes("ApiNotActivatedMapError") ||
      text.includes("BillingNotEnabledMapError") ||
      text.includes("RefererNotAllowedMapError") ||
      text.includes("ApiTargetBlockedMapError");
    if (hasError) {
      const match = text.match(/"([A-Z][a-zA-Z]+MapError)"/);
      return {
        name: "Maps JavaScript API",
        ok: false,
        status: match ? match[1] : "ERROR",
        error: match ? match[1] : "Unknown loader error",
      };
    }
    return { name: "Maps JavaScript API", ok: r.ok, status: "OK" };
  } catch (e) {
    return { name: "Maps JavaScript API", ok: false, error: String(e) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        reason: "missing_key",
        message: "Chave Google Maps não configurada no servidor.",
        checks: [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const [mapsJs, geocoding, places, directions] = await Promise.all([
    checkMapsJs(apiKey),
    checkGeocoding(apiKey),
    checkPlaces(apiKey),
    checkDirections(apiKey),
  ]);

  const checks = [mapsJs, geocoding, places, directions];
  const failed = checks.filter((c) => !c.ok);

  // Detect billing problems specifically
  const billingIssue = checks.some(
    (c) =>
      c.status === "BillingNotEnabledMapError" ||
      c.error?.toLowerCase().includes("billing") ||
      c.status === "REQUEST_DENIED"
  );

  let reason = "ok";
  let message = "Todas as APIs do Google Maps estão funcionais.";

  if (failed.length > 0) {
    if (billingIssue) {
      reason = "billing_disabled";
      message =
        "O billing do Google Cloud não está ativo ou a chave não tem permissão. Ative o billing e as APIs no Google Cloud Console.";
    } else {
      reason = "apis_inactive";
      const names = failed.map((c) => c.name).join(", ");
      message = `As seguintes APIs não estão ativas ou acessíveis: ${names}.`;
    }
  }

  return new Response(
    JSON.stringify({
      ok: failed.length === 0,
      reason,
      message,
      checks,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
