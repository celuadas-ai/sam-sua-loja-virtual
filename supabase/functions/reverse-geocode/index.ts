import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const RequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  language: z.string().min(2).max(10).optional(),
});

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

function coordinateAddress(lat: number, lng: number) {
  return `Localização GPS (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const { lat, lng, language } = parsed.data;
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({
        address: coordinateAddress(lat, lng),
        placeId: null,
        approximate: true,
      }), { status: 200, headers: jsonHeaders });
    }

    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=${language || "pt"}`
    );
    const data = await geocodeResponse.json();

    if (!geocodeResponse.ok || data.status !== "OK" || !data.results?.length) {
      const status = data?.status || "UNKNOWN_ERROR";
      console.error(`Reverse geocoding failed [${geocodeResponse.status}/${status}]: ${data?.error_message || "No address returned"}`);

      // The exact GPS coordinates are still a valid delivery location. Returning
      // them prevents provider restrictions or temporary outages from blocking checkout.
      return new Response(JSON.stringify({
        address: coordinateAddress(lat, lng),
        placeId: null,
        approximate: true,
      }), { status: 200, headers: jsonHeaders });
    }

    return new Response(
      JSON.stringify({
        address: data.results[0].formatted_address,
        placeId: data.results[0].place_id ?? null,
      }),
      { headers: jsonHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});