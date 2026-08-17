/**
 * @file supabaseApi.js
 * @description Supabase backend implementation for the CIRCULAI API contract.
 *
 * All public methods mirror those of `localApi` so the rest of the application
 * can switch between backends purely through the DATA_BACKEND env variable.
 */

import {
  canRequestReturn,
  categories as fallbackCategories,
  computeEcoScore,
  createOrderFromCart,
  normalizeOrder,
  orderSteps,
  paymentMethods,
  returnReasons,
  returnStatusMeta,
  savedAddresses,
  sortOptions as fallbackSortOptions,
} from '../data/appData';
import { isSupabaseConfigured } from '../config/supabase';
import { supabase } from './supabaseClient';
// callGeminiStylist is imported lazily to avoid a circular-module edge case
// (api.js imports supabaseApi; supabaseApi imports from api.js).
// Using require() inside the function body sidesteps this cleanly.


const defaultUserProfile = {
  id: 'USR-001',
  name: 'Adi Arwan Syah',
  email: 'adi.arwansyah@email.com',
  phone: '0812 3456 7890',
  photoUri: null
};
const defaultMeasurements = {
  height: '168',
  chest: '92',
  waist: '78',
  hips: '96'
};
const defaultPreferences = {
  notifications: {
    orderUpdates: true,
    promotions: false,
    impactTips: true
  },
  security: {
    biometric: false,
    loginAlerts: true
  },
  privacy: {
    personalization: true,
    analytics: false
  }
};

function assertSupabase() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase belum dikonfigurasi');
  }
}

function throwIfError(error) {
  if (error) throw error;
}

function productFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    tailor: row.tailor_name,
    tailorCity: row.tailor_city,
    price: row.price,
    badges: row.badges ?? [],
    category: row.category,
    eta: row.eta,
    rating: Number(row.rating ?? 0),
    savedFabric: row.saved_fabric,
    ecoScore: Number(row.eco_score ?? computeEcoScore(row)),
    material: row.material,
    color: row.color,
    image: row.image,
    description: row.description,
    measurements: row.measurements ?? [],
    recommendations: row.recommendations ?? [],
    orderType: row.order_type ?? 'catalog'
  };
}

function tailorFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    specialty: row.specialty,
    rating: Number(row.rating ?? 0),
    sold: row.sold ?? 0,
    experience: row.experience,
    responseTime: row.response_time,
    verified: row.verified,
    image: row.image
  };
}

function profileFromRow(row) {
  return {
    id: row?.app_user_code ?? defaultUserProfile.id,
    name: row?.name ?? defaultUserProfile.name,
    email: row?.email ?? defaultUserProfile.email,
    phone: row?.phone ?? defaultUserProfile.phone,
    photoUri: row?.photo_uri ?? null
  };
}

function profileToRow(userId, profile) {
  return {
    user_id: userId,
    app_user_code: profile.id ?? defaultUserProfile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    photo_uri: profile.photoUri ?? null
  };
}

function addressFromRow(row) {
  return {
    id: row.id,
    label: row.label,
    receiver: row.receiver,
    phone: row.phone,
    detail: row.detail
  };
}

function cartItemFromRow(row) {
  return {
    cartItemId: row.id,
    productId: row.product_id,
    product: row.product_snapshot,
    customization: row.customization ?? {},
    quantity: row.quantity,
    unitPrice: row.unit_price
  };
}

function orderFromRow(row) {
  return normalizeOrder({
    ...(row.payload ?? {}),
    id: row.id,
    status: row.status,
    returnRequest: row.return_request ?? row.payload?.returnRequest
  });
}

function messageFromRow(row) {
  return {
    id: row.id,
    sender: row.sender,
    text: row.text,
    createdAt: row.created_at,
    context: row.context ?? {}
  };
}

function measurementsFromRow(row) {
  return {
    height: row?.height ?? defaultMeasurements.height,
    chest: row?.chest ?? defaultMeasurements.chest,
    waist: row?.waist ?? defaultMeasurements.waist,
    hips: row?.hips ?? defaultMeasurements.hips
  };
}

function getLocalCartSummary(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = cart.length > 0 ? 18000 : 0;
  const discount = subtotal >= 400000 ? 20000 : 0;
  return { subtotal, shipping, discount, total: subtotal + shipping - discount };
}

function createReturnRequest(orderId, draft) {
  const createdAt = new Date();
  const reason = returnReasons.find((item) => item.id === draft.reasonId);
  return {
    id: `RTR-${String(orderId).replace(/\D/g, '').padStart(3, '0')}-${String(createdAt.getTime()).slice(-5)}`,
    status: 'REVIEWING',
    reasonId: draft.reasonId,
    reasonLabel: reason?.label ?? 'Alasan lain',
    notes: draft.notes.trim(),
    evidencePhotos: draft.evidencePhotos ?? [],
    createdAt: createdAt.toISOString(),
    createdAtLabel: createdAt.toLocaleDateString('id-ID'),
    timeline: [
      {
        label: createdAt.toLocaleDateString('id-ID'),
        title: 'Pengajuan diterima',
        desc: 'Bukti foto dan alasan sedang diverifikasi oleh tim CIRCULAI.'
      }
    ]
  };
}

async function ensureSession() {
  assertSupabase();
  const sessionResult = await supabase.auth.getSession();
  throwIfError(sessionResult.error);
  let session = sessionResult.data.session;

  if (!session) {
    const signIn = await supabase.auth.signInAnonymously();
    throwIfError(signIn.error);
    session = signIn.data.session;
  }

  const user = session?.user;
  if (!user) throw new Error('Supabase session tidak tersedia');

  const bootstrapRows = await Promise.all([
    supabase.from('profiles').upsert(profileToRow(user.id, defaultUserProfile), {
      onConflict: 'user_id',
      ignoreDuplicates: true
    }),
    supabase.from('measurements').upsert({ user_id: user.id, ...defaultMeasurements }, {
      onConflict: 'user_id',
      ignoreDuplicates: true
    }),
    supabase.from('preferences').upsert({ user_id: user.id, ...defaultPreferences }, {
      onConflict: 'user_id',
      ignoreDuplicates: true
    })
  ]);
  bootstrapRows.map((result) => result.error).filter(Boolean).forEach(throwIfError);

  return user;
}

async function uploadLocalFile(bucket, userId, uri) {
  if (!uri || uri.startsWith('http')) return uri;

  const extension = uri.split('?')[0].match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() || 'jpg';
  const response = await fetch(uri);
  const file = await response.arrayBuffer();
  const path = `${userId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
    upsert: false
  });
  throwIfError(error);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
  throwIfError(error);
  return data.map(productFromRow);
}

async function fetchTailors() {
  const { data, error } = await supabase.from('tailors').select('*').order('id', { ascending: true });
  throwIfError(error);
  return data.map(tailorFromRow);
}

async function fetchWishlist(userId) {
  const { data, error } = await supabase.from('wishlists').select('product_id').eq('user_id', userId);
  throwIfError(error);
  return data.map((row) => row.product_id);
}

async function fetchCart(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  throwIfError(error);
  return data.map(cartItemFromRow);
}

async function fetchOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  throwIfError(error);
  return data.map(orderFromRow);
}

async function fetchConversations(userId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  throwIfError(error);
  return data.reduce((acc, row) => {
    acc[row.tailor_name] = [...(acc[row.tailor_name] ?? []), messageFromRow(row)];
    return acc;
  }, {});
}

async function fetchUserState(userId) {
  const [profileResult, measurementsResult, preferencesResult, styleResult, addressResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('measurements').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('preferences').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('style_profiles').select('payload').eq('user_id', userId).maybeSingle(),
    supabase.from('addresses').select('*').eq('user_id', userId).order('created_at', { ascending: true })
  ]);

  [
    profileResult.error,
    measurementsResult.error,
    preferencesResult.error,
    styleResult.error,
    addressResult.error
  ].filter(Boolean).forEach(throwIfError);

  return {
    user: profileFromRow(profileResult.data),
    measurements: measurementsFromRow(measurementsResult.data),
    preferences: {
      notifications: { ...defaultPreferences.notifications, ...(preferencesResult.data?.notifications ?? {}) },
      security: { ...defaultPreferences.security, ...(preferencesResult.data?.security ?? {}) },
      privacy: { ...defaultPreferences.privacy, ...(preferencesResult.data?.privacy ?? {}) }
    },
    styleProfile: styleResult.data?.payload ?? null,
    addresses: addressResult.data?.length ? addressResult.data.map(addressFromRow) : savedAddresses
  };
}

async function getTailorMessages(userId, tailorName) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .eq('tailor_name', tailorName)
    .order('created_at', { ascending: true });
  throwIfError(error);
  return data.map(messageFromRow);
}

export const supabaseApi = {
  type: 'supabase',
  baseUrl: 'supabase',

  async bootstrap() {
    const user = await ensureSession();
    const [products, tailors, wishlist, cart, orders, conversations, userState] = await Promise.all([
      fetchProducts(),
      fetchTailors(),
      fetchWishlist(user.id),
      fetchCart(user.id),
      fetchOrders(user.id),
      fetchConversations(user.id),
      fetchUserState(user.id)
    ]);

    return {
      ...userState,
      wishlist,
      products,
      tailors,
      categories: fallbackCategories,
      sortOptions: fallbackSortOptions,
      paymentMethods,
      cart,
      cartSummary: getLocalCartSummary(cart),
      orders,
      conversations,
      orderSteps,
      returnReasons,
      returnStatusMeta
    };
  },

  async resetDemo() {
    const user = await ensureSession();
    const deleteResults = await Promise.all([
      supabase.from('wishlists').delete().eq('user_id', user.id),
      supabase.from('cart_items').delete().eq('user_id', user.id),
      supabase.from('messages').delete().eq('user_id', user.id),
      supabase.from('orders').delete().eq('user_id', user.id),
      supabase.from('addresses').delete().eq('user_id', user.id),
      supabase.from('style_profiles').delete().eq('user_id', user.id)
    ]);
    deleteResults.map((result) => result.error).filter(Boolean).forEach(throwIfError);
    const resetResults = await Promise.all([
      supabase.from('profiles').upsert(profileToRow(user.id, defaultUserProfile), { onConflict: 'user_id' }),
      supabase.from('measurements').upsert({ user_id: user.id, ...defaultMeasurements }, { onConflict: 'user_id' }),
      supabase.from('preferences').upsert({ user_id: user.id, ...defaultPreferences }, { onConflict: 'user_id' })
    ]);
    resetResults.map((result) => result.error).filter(Boolean).forEach(throwIfError);
    return supabaseApi.bootstrap();
  },

  async addCartItem({ product, customization = {}, quantity = 1 }) {
    const user = await ensureSession();
    const { error } = await supabase.from('cart_items').insert({
      user_id: user.id,
      product_id: String(product.id),
      product_snapshot: product,
      customization,
      quantity,
      unit_price: product.price + (customization.fabric?.extraCost ?? 0)
    });
    throwIfError(error);
    const items = await fetchCart(user.id);
    return { item: items[items.length - 1], items, summary: getLocalCartSummary(items) };
  },

  async updateCartItem(cartItemId, delta) {
    const user = await ensureSession();
    const { data: item, error: readError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('id', cartItemId)
      .maybeSingle();
    throwIfError(readError);
    if (!item) {
      const items = await fetchCart(user.id);
      return { items, summary: getLocalCartSummary(items) };
    }

    const nextQuantity = Math.max(0, item.quantity + Number(delta));
    const operation = nextQuantity === 0
      ? supabase.from('cart_items').delete().eq('user_id', user.id).eq('id', cartItemId)
      : supabase.from('cart_items').update({ quantity: nextQuantity }).eq('user_id', user.id).eq('id', cartItemId);
    const { error } = await operation;
    throwIfError(error);
    const items = await fetchCart(user.id);
    return { items, summary: getLocalCartSummary(items) };
  },

  async removeCartItem(cartItemId) {
    const user = await ensureSession();
    const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id).eq('id', cartItemId);
    throwIfError(error);
    const items = await fetchCart(user.id);
    return { items, summary: getLocalCartSummary(items) };
  },

  async clearCart() {
    const user = await ensureSession();
    const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
    throwIfError(error);
    return { items: [], summary: getLocalCartSummary([]) };
  },

  async addAddress(draft) {
    const user = await ensureSession();
    const address = {
      id: `ADDR-${Date.now()}`,
      user_id: user.id,
      label: draft.label?.trim() || 'Alamat Baru',
      receiver: draft.receiver.trim(),
      phone: draft.phone.trim(),
      detail: draft.detail.trim()
    };
    const { data, error } = await supabase.from('addresses').insert(address).select('*').single();
    throwIfError(error);
    return addressFromRow(data);
  },

  async removeAddress(addressId) {
    const user = await ensureSession();
    const { error } = await supabase.from('addresses').delete().eq('user_id', user.id).eq('id', addressId);
    throwIfError(error);
    return { ok: true };
  },

  async updateProfile(profile) {
    const user = await ensureSession();
    const uploadedPhotoUri = await uploadLocalFile('avatars', user.id, profile.photoUri);
    const nextProfile = { ...profile, photoUri: uploadedPhotoUri };
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileToRow(user.id, nextProfile), { onConflict: 'user_id' })
      .select('*')
      .single();
    throwIfError(error);
    return profileFromRow(data);
  },

  async saveMeasurements(measurements) {
    const user = await ensureSession();
    const { data, error } = await supabase
      .from('measurements')
      .upsert({ user_id: user.id, ...measurements }, { onConflict: 'user_id' })
      .select('*')
      .single();
    throwIfError(error);
    return measurementsFromRow(data);
  },

  async updatePreferences(preferences) {
    const user = await ensureSession();
    const { data, error } = await supabase
      .from('preferences')
      .upsert({ user_id: user.id, ...preferences }, { onConflict: 'user_id' })
      .select('*')
      .single();
    throwIfError(error);
    return {
      notifications: { ...defaultPreferences.notifications, ...(data.notifications ?? {}) },
      security: { ...defaultPreferences.security, ...(data.security ?? {}) },
      privacy: { ...defaultPreferences.privacy, ...(data.privacy ?? {}) }
    };
  },

  async saveStyleProfile(profile) {
    const user = await ensureSession();
    const { error } = await supabase
      .from('style_profiles')
      .upsert({ user_id: user.id, payload: profile }, { onConflict: 'user_id' });
    throwIfError(error);
    return profile;
  },

  async resetStyleProfile() {
    const user = await ensureSession();
    const { error } = await supabase.from('style_profiles').delete().eq('user_id', user.id);
    throwIfError(error);
    return { ok: true };
  },

  async toggleWishlist(productId, favorite) {
    const user = await ensureSession();
    if (favorite) {
      const { error } = await supabase
        .from('wishlists')
        .upsert({ user_id: user.id, product_id: String(productId) }, { onConflict: 'user_id,product_id' });
      throwIfError(error);
    } else {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', String(productId));
      throwIfError(error);
    }
    return fetchWishlist(user.id);
  },

  async placeOrder({ address, paymentMethod }) {
    const user = await ensureSession();
    const cart = await fetchCart(user.id);
    if (!cart.length) return null;
    const order = createOrderFromCart(cart, Date.now(), {
      address,
      paymentMethod,
      total: getLocalCartSummary(cart).total
    });
    const { error } = await supabase.rpc('place_order', {
      p_order_id: order.id,
      p_status: order.status,
      p_payload: order
    });
    throwIfError(error);
    return order;
  },

  async updateOrderStatus(orderId, nextStatus, actor) {
    await ensureSession();
    if (nextStatus !== 'COMPLETED' || actor !== 'customer') {
      throw new Error('Perubahan status tidak diizinkan untuk peran ini');
    }
    const { data, error } = await supabase.rpc('complete_order', {
      p_order_id: orderId
    });
    throwIfError(error);
    return orderFromRow(data);
  },

  async submitReturnRequest(orderId, draft) {
    const user = await ensureSession();
    const { data: row, error: readError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('id', orderId)
      .single();
    throwIfError(readError);

    const order = orderFromRow(row);
    if (!canRequestReturn(order)) throw new Error('Pengajuan retur belum tersedia untuk pesanan ini');
    const evidencePhotos = await Promise.all(
      (draft.evidencePhotos ?? []).map((uri) => uploadLocalFile('return-evidence', user.id, uri))
    );
    const request = createReturnRequest(orderId, { ...draft, evidencePhotos });
    const { data, error } = await supabase.rpc('submit_return_request', {
      p_order_id: orderId,
      p_request: request
    });
    throwIfError(error);
    return data?.payload ?? request;
  },

  async sendTailorMessage(tailorName, text, context = {}) {
    const user = await ensureSession();
    const cleanText = text.trim();
    if (!cleanText) return getTailorMessages(user.id, tailorName);

    const outgoing = {
      user_id: user.id,
      tailor_name: tailorName,
      sender: 'user',
      text: cleanText,
      context
    };
    const { error } = await supabase.from('messages').insert(outgoing);
    throwIfError(error);
    return getTailorMessages(user.id, tailorName);
  },

  async createMidtransSnap(orderId) {
    await ensureSession();
    const { data, error } = await supabase.functions.invoke('create-midtrans-snap', {
      body: { orderId }
    });
    throwIfError(error);
    if (data?.error) throw new Error(data.error);
    return data?.data ?? data;
  },

  async subscribeUserChanges({ onOrders, onConversations }) {
    const user = await ensureSession();
    const ordersChannel = supabase
      .channel(`orders:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        async () => {
          try {
            onOrders?.(await fetchOrders(user.id));
          } catch {
            // A later realtime event or manual refresh will retry synchronization.
          }
        }
      )
      .subscribe();
    const messagesChannel = supabase
      .channel(`messages:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `user_id=eq.${user.id}` },
        async () => {
          try {
            onConversations?.(await fetchConversations(user.id));
          } catch {
            // A later realtime event or manual refresh will retry synchronization.
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(messagesChannel);
    };
  },

  /**
   * Returns a Gemini-generated personal style narrative for the given quiz
   * answers and rule-based analysis result.
   *
   * Strategy (in priority order):
   *   1. Direct Gemini API call via `EXPO_PUBLIC_GEMINI_API_KEY` — works
   *      immediately as long as the key is configured, no Supabase Edge
   *      Function setup required.
   *   2. Supabase Edge Function `stylist-recommend` — used as an optional
   *      server-side enhancement when the function is deployed (e.g. for
   *      key rotation or server-side logging).
   *   3. Graceful fallback: `{ narrative: null }` — the UI already handles
   *      this case and simply hides the AI insight card.
   *
   * @param {object} answers        Quiz answers from the user.
   * @param {object} ruleBasedResult Archetype / palette computed locally.
   * @returns {Promise<{ narrative: string | null }>}
   */
  async getAiStylistRecommendation(answers, ruleBasedResult) {
    // ── 1. Try direct Gemini first (fastest, no server dependency) ──────────
    try {
      // Lazy require avoids a circular module dependency between api.js and
      // supabaseApi.js (api.js imports supabaseApi, supabaseApi imports api).
      const { callGeminiStylist } = require('./api');
      const geminiResult = await callGeminiStylist(answers, ruleBasedResult);
      if (geminiResult?.narrative) {
        return geminiResult;
      }
    } catch {
      // callGeminiStylist not available yet — fall through to Edge Function.
    }

    // ── 2. Try the Supabase Edge Function (server-side, optional) ───────────
    try {
      await ensureSession();
      const { data, error } = await supabase.functions.invoke(
        'stylist-recommend',
        { body: { ...answers, ruleBasedResult } },
      );
      if (!error && !data?.error) {
        return data?.data ?? data ?? { narrative: null };
      }
    } catch {
      // Edge Function not deployed or network error — fall through.
    }

    return { narrative: null };
  }
};
