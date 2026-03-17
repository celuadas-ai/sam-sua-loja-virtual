import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const normalizeTwilioFrom = (value: string | null | undefined) => {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;

  // Twilio sender is typically a US long code; accept common formats.
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;

  return `+${digits}`;
};

const normalizeMozPhone = (value: string | null | undefined) => {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  return digits.startsWith('258') ? `+${digits}` : `+258${digits}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json().catch(() => null);
    const phone = normalizeMozPhone(typeof payload?.phone === 'string' ? payload.phone : null);

    if (!phone) {
      return json({ error: 'Valid phone number is required' }, 400);
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = toE164(Deno.env.get('TWILIO_PHONE_NUMBER'));

    if (!accountSid || !authToken || !twilioPhone) {
      console.error('Missing Twilio environment variables', {
        hasAccountSid: !!accountSid,
        hasAuthToken: !!authToken,
        hasPhoneNumber: !!twilioPhone,
      });
      return json({ error: 'Twilio not configured' }, 500);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return json({ error: 'Backend not configured' }, 500);
    }

    await fetch(`${supabaseUrl}/rest/v1/phone_otps?phone=eq.${encodeURIComponent(phone)}`, {
      method: 'DELETE',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    const storeRes = await fetch(`${supabaseUrl}/rest/v1/phone_otps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        phone,
        otp_code: otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      }),
    });

    if (!storeRes.ok) {
      const errText = await storeRes.text();
      console.error('Failed to store OTP:', errText);
      return json({ error: 'Failed to store OTP' }, 500);
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams({
      To: phone,
      From: twilioPhone,
      Body: `SAM - O seu código de verificação é: ${otp}. Válido por 5 minutos.`,
    });

    const twilioRes = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
      },
      body: body.toString(),
    });

    const twilioData = await twilioRes.json().catch(() => ({}));

    if (!twilioRes.ok) {
      console.error('Twilio error:', twilioData);
      return json(
        {
          error: (twilioData as { message?: string })?.message || 'Failed to send SMS',
          code: (twilioData as { code?: number })?.code || null,
        },
        500,
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
});
