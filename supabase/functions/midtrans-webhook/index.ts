import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

async function sha512Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-512', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }
    const notification = await req.json();
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (!serverKey || !supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: 'Supabase atau Midtrans secrets belum lengkap' }, 503);
    }
    const expectedSignature = await sha512Hex(
      `${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`,
    );

    if (notification.signature_key !== expectedSignature) {
      return jsonResponse({ error: 'Invalid Midtrans signature' }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', notification.order_id)
      .single();
    if (orderError || !order) return jsonResponse({ error: 'Order tidak ditemukan' }, 404);

    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paid =
      transactionStatus === 'settlement' ||
      (transactionStatus === 'capture' && fraudStatus === 'accept');
    const failed = ['deny', 'cancel', 'expire', 'failure'].includes(transactionStatus);

    const payload = order.payload ?? {};
    const paymentData = {
      ...(payload.paymentData ?? {}),
      midtransStatus: transactionStatus,
      fraudStatus,
      lastNotificationAt: new Date().toISOString(),
      rawNotification: notification,
    };
    let nextStatus = order.status;
    let nextPayload = {
      ...payload,
      paymentData,
    };

    if (paid && order.status === 'WAITING_PAYMENT') {
      nextStatus = 'PAYMENT_CONFIRMED';
      nextPayload = {
        ...nextPayload,
        status: nextStatus,
        statusHistory: [
          ...(payload.statusHistory ?? []),
          {
            status: nextStatus,
            label: new Date().toLocaleDateString('id-ID'),
            note: 'Pembayaran diterima dan detail diteruskan ke tailor',
            actor: 'payment_gateway',
          },
        ],
      };
    }

    if (failed) {
      nextPayload = {
        ...nextPayload,
        paymentData: {
          ...paymentData,
          failedAt: new Date().toISOString(),
        },
      };
    }

    const { error: updateError } = await adminClient
      .from('orders')
      .update({
        status: nextStatus,
        payload: nextPayload,
      })
      .eq('id', order.id);
    if (updateError) throw updateError;
    const { error: attemptError } = await adminClient.from('payment_attempts').insert({
      user_id: order.user_id,
      order_id: order.id,
      provider: 'midtrans',
      status: transactionStatus,
      payload: notification,
    });
    if (attemptError) throw attemptError;

    return jsonResponse({
      data: {
        orderId: order.id,
        orderStatus: nextStatus,
        transactionStatus,
      },
    });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Internal error' }, 500);
  }
});
