import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IVA_RATE = 0.16;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'order_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order with customer NUIT
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, total, customer_nuit, customer_name, created_at, payment_method, transaction_id_external')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found', details: orderError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, product_name, product_price, quantity, min_quantity')
      .eq('order_id', order_id);

    if (itemsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch order items', details: itemsError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Primavera-compatible JSON
    const subtotal = Number(order.total);
    const ivaValue = Math.round(subtotal * IVA_RATE * 100) / 100;
    const totalComIva = Math.round((subtotal + ivaValue) * 100) / 100;

    const primaveraPayload = {
      // Document header
      Entidade: order.customer_nuit || '',
      NomeEntidade: order.customer_name || '',
      NumDoc: order.order_number?.toString() || order.id,
      DataDoc: order.created_at,
      TipoDoc: 'FT', // Fatura
      Serie: 'A',
      Moeda: 'MZN',
      CondPag: mapPaymentMethod(order.payment_method),
      RefExterna: order.transaction_id_external || '',

      // Tax info
      TotalMerc: subtotal,
      TotalIva: ivaValue,
      TotalDoc: totalComIva,

      // Line items
      Linhas: (items || []).map((item, index) => {
        const lineTotal = Number(item.product_price) * item.quantity * item.min_quantity;
        const lineIva = Math.round(lineTotal * IVA_RATE * 100) / 100;

        return {
          NumLinha: index + 1,
          CodArtigo: item.product_id,
          DescArtigo: item.product_name,
          Quantidade: item.quantity * item.min_quantity,
          PrecoUnitario: Number(item.product_price),
          TotalLinha: lineTotal,
          CodIva: 'IVA16',
          TaxaIva: IVA_RATE * 100,
          ValorIva: lineIva,
        };
      }),
    };

    // Log for debugging (in production, this would POST to Primavera Web API)
    console.log('Primavera Invoice Payload:', JSON.stringify(primaveraPayload, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Primavera invoice payload prepared successfully',
        payload: primaveraPayload,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error preparing Primavera invoice:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function mapPaymentMethod(method: string): string {
  switch (method) {
    case 'mpesa': return 'MPESA';
    case 'emola': return 'EMOLA';
    case 'pos': return 'POS';
    case 'cash': return 'NUM';
    default: return 'OUT';
  }
}
