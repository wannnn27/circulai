import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  payload: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY')!;
    if (!supabaseUrl || !anonKey || !serviceRoleKey || !midtransServerKey) {
      return jsonResponse({ error: 'Supabase atau Midtrans secrets belum lengkap' }, 503);
    }
    const isProduction = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true';
    const baseUrl = isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { orderId } = await req.json();
    if (!orderId) return jsonResponse({ error: 'orderId wajib diisi' }, 400);

    const { data: orderData, error: orderError } = await userClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    const order = orderData as OrderRow | null;
    if (orderError || !order) return jsonResponse({ error: 'Order tidak ditemukan' }, 404);

    const payload = order.payload;
    const existingPaymentData = payload.paymentData as Record<string, unknown> | undefined;
    if (existingPaymentData?.snapToken && existingPaymentData?.redirectUrl) {
      return jsonResponse({
        data: {
          orderId: order.id,
          token: existingPaymentData.snapToken,
          redirectUrl: existingPaymentData.redirectUrl,
          environment: existingPaymentData.environment,
        },
      });
    }
    const grossAmount = Number(payload.rawPrice ?? String(payload.price ?? '').replace(/[^0-9]/g, ''));
    if (!grossAmount) return jsonResponse({ error: 'Nominal order tidak valid' }, 400);

    const profileResult = await userClient.from('profiles').select('*').eq('user_id', userData.user.id).maybeSingle();
    const profile = profileResult.data ?? {};
    const snapPayload = {
      transaction_details: {
        order_id: order.id,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: profile.name ?? 'CIRCULAI User',
        email: profile.email ?? userData.user.email,
        phone: profile.phone,
      },
      item_details: [
        {
          id: String(payload.productId ?? order.id),
          price: grossAmount,
          quantity: 1,
          name: String(payload.product ?? 'CIRCULAI Order').slice(0, 50),
        },
      ],
    };

    const midtransResponse = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${midtransServerKey}:`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snapPayload),
    });
    const midtrans = await midtransResponse.json();
    if (!midtransResponse.ok) {
      return jsonResponse({ error: 'Gagal membuat Snap Midtrans', details: midtrans }, midtransResponse.status);
    }

    const paymentData = {
      ...(existingPaymentData ?? {}),
      midtransOrderId: order.id,
      snapToken: midtrans.token,
      redirectUrl: midtrans.redirect_url,
      environment: isProduction ? 'production' : 'sandbox',
      createdAt: new Date().toISOString(),
    };
    const nextPayload = {
      ...payload,
      paymentMethod: {
        id: 'MIDTRANS_SNAP',
        label: 'Midtrans',
        desc: 'Bayar via QRIS, e-wallet, kartu, atau VA Midtrans',
        icon: 'credit-card',
      },
      paymentData,
    };

    const { error: updateError } = await adminClient
      .from('orders')
      .update({ payload: nextPayload })
      .eq('id', order.id)
      .eq('user_id', userData.user.id);
    if (updateError) throw updateError;
    const { error: attemptError } = await adminClient.from('payment_attempts').insert({
      user_id: userData.user.id,
      order_id: order.id,
      provider: 'midtrans',
      status: 'SNAP_CREATED',
      payload: midtrans,
    });
    if (attemptError) throw attemptError;

    return jsonResponse({
      data: {
        orderId: order.id,
        token: midtrans.token,
        redirectUrl: midtrans.redirect_url,
        environment: isProduction ? 'production' : 'sandbox',
      },
    });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Internal error' }, 500);
  }
});
