import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Maps API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { lat, lng, language } = await req.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return new Response(JSON.stringify({ error: "lat and lng are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=${language || "pt"}`
    );
    const data = await geocodeResponse.json();

    if (!geocodeResponse.ok || data.status !== "OK" || !data.results?.length) {
      const status = data?.status || "UNKNOWN_ERROR";
      let message = "Não foi possível obter o endereço.";

      if (status === "REQUEST_DENIED") {
        message = "A configuração do Google Maps não permite obter moradas a partir da localização.";
      } else if (status === "OVER_QUERY_LIMIT") {
        message = "O serviço de mapas excedeu o limite de pedidos.";
      } else if (status === "ZERO_RESULTS") {
        message = "Não foi encontrada uma morada para esta localização.";
      }

      return new Response(JSON.stringify({ error: message, status }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        address: data.results[0].formatted_address,
        placeId: data.results[0].place_id ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});