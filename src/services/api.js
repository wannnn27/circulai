/**
 * @file api.js
 * @description Unified API client for CIRCULAI.
 *
 * Resolves the correct backend implementation at module load time based on
 * the DATA_BACKEND environment variable, then re-exports a single `api`
 * object that the rest of the application uses.
 *
 * Available backends:
 *   - `supabase`  — Production Supabase backend (default)
 *   - `local`     — Local Node.js development server
 *   - `auto`      — Supabase when configured, otherwise local
 */

import { API_BASE_URL } from '../config/api';
import {
  API_REQUEST_TIMEOUT_MS,
  GEMINI_MAX_OUTPUT_TOKENS,
  GEMINI_TEMPERATURE,
} from '../config/constants';
import { DATA_BACKEND, isSupabaseConfigured } from '../config/supabase';
import { supabaseApi } from './supabaseApi';

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

class ApiError extends Error {
  /**
   * @param {string}  message  Human-readable description.
   * @param {number}  status   HTTP status code.
   * @param {*}       details  Additional error payload from the server.
   */
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Thin fetch wrapper with a configurable timeout and structured error handling.
 *
 * @param {string} path     Relative API path (e.g. `/api/bootstrap`).
 * @param {object} options  Optional fetch options (method, body, headers).
 * @returns {Promise<*>}    Parsed `data` field from the JSON response.
 */
async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    API_REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(options.headers ?? {}),
      },
      body: options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
      signal: controller.signal,
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        json.error?.message ?? 'Request backend gagal',
        response.status,
        json.error?.details,
      );
    }

    return json.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Gemini AI Stylist helper ─────────────────────────────────────────────────

/**
 * Calls the Gemini API directly from the client using the publishable key
 * stored in `EXPO_PUBLIC_GEMINI_API_KEY`.
 *
 * This is intentionally a standalone function so it can be shared between
 * `localApi` and `supabaseApi` (where it acts as a fallback when the
 * `stylist-recommend` Edge Function is not deployed).
 *
 * @param {{ skinTone?: string, bodyShape?: string, height?: string, styleVibe?: string[], occasion?: string[] }} answers
 * @param {{ archetype?: string, tagline?: string, cuttings?: string[], fabrics?: string[] }} styleResult
 * @returns {Promise<{ narrative: string | null }>}
 */
async function callGeminiStylist(answers, styleResult) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  const isPlaceholder = !apiKey || apiKey === 'AIza_YOUR_KEY_HERE';

  if (isPlaceholder) {
    return { narrative: null };
  }

  const prompt = [
    'Kamu adalah AI Fashion Stylist profesional untuk CIRCULAI (platform fashion berkelanjutan Indonesia).',
    'Pengguna mengisi kuis gaya dengan profil:',
    `- Warna Kulit: ${answers.skinTone ?? 'tidak ditentukan'}`,
    `- Bentuk Tubuh: ${answers.bodyShape ?? 'tidak ditentukan'}`,
    `- Tinggi Badan: ${answers.height ?? 'tidak ditentukan'}`,
    `- Preferensi Gaya: ${(answers.styleVibe ?? []).join(', ') || 'Clean Casual'}`,
    `- Kebutuhan/Acara: ${(answers.occasion ?? []).join(', ') || 'Daily Wear'}`,
    '',
    'Hasil rekomendasi sistem:',
    `- Archetype: ${styleResult?.archetype ?? 'The Circular Stylist'}`,
    `- Tagline: "${styleResult?.tagline ?? ''}"`,
    `- Rekomendasi Potongan: ${(styleResult?.cuttings ?? []).join(', ')}`,
    `- Kain Direkomendasikan: ${(styleResult?.fabrics ?? []).join(', ')}`,
    '',
    'Tugasmu: Tulis personal insight singkat (2-3 kalimat, maks 70 kata) dalam Bahasa Indonesia yang terasa hangat, personal, dan encouraging.',
    'Jelaskan MENGAPA kombinasi ini cocok untuk profil mereka dan berikan 1 saran padu-padan praktis.',
    'Jangan ulangi data mentah — tulis seperti berbicara langsung kepada pengguna.',
    'Akhiri dengan satu kalimat tentang dampak positif pilihan sustainable fashion mereka.',
  ].join('\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: GEMINI_TEMPERATURE,
            maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
          },
        }),
      },
    );

    if (!response.ok) {
      return { narrative: null };
    }

    const json = await response.json();
    const narrative =
      json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;

    return { narrative };
  } catch {
    return { narrative: null };
  }
}

// ─── Local API (Node.js development server) ───────────────────────────────────

export const localApi = {
  type: 'local',
  baseUrl: API_BASE_URL,

  bootstrap: () => request('/api/bootstrap'),
  resetDemo: () => request('/api/dev/reset', { method: 'POST' }),

  addCartItem: ({ product, customization = {}, quantity = 1 }) =>
    request('/api/cart/items', {
      method: 'POST',
      body: { productId: product.id, product, customization, quantity },
    }),

  updateCartItem: (cartItemId, delta) =>
    request(`/api/cart/items/${encodeURIComponent(cartItemId)}`, {
      method: 'PATCH',
      body: { delta },
    }),

  removeCartItem: (cartItemId) =>
    request(`/api/cart/items/${encodeURIComponent(cartItemId)}`, {
      method: 'DELETE',
    }),

  clearCart: () => request('/api/cart', { method: 'DELETE' }),

  addAddress: (draft) =>
    request('/api/addresses', { method: 'POST', body: draft }),

  removeAddress: (addressId) =>
    request(`/api/addresses/${encodeURIComponent(addressId)}`, {
      method: 'DELETE',
    }),

  updateProfile: (profile) =>
    request('/api/profile', { method: 'PATCH', body: profile }),

  saveMeasurements: (measurements) =>
    request('/api/measurements', { method: 'PATCH', body: measurements }),

  updatePreferences: (preferences) =>
    request('/api/preferences', { method: 'PATCH', body: preferences }),

  saveStyleProfile: (profile) =>
    request('/api/style-profile', { method: 'PUT', body: profile }),

  resetStyleProfile: () =>
    request('/api/style-profile', { method: 'DELETE' }),

  toggleWishlist: (productId, favorite) =>
    request(`/api/wishlist/${encodeURIComponent(productId)}`, {
      method: favorite ? 'POST' : 'DELETE',
    }),

  placeOrder: ({ address, paymentMethod }) =>
    request('/api/orders', {
      method: 'POST',
      body: { addressId: address.id, paymentMethodId: paymentMethod.id },
    }),

  updateOrderStatus: (orderId, nextStatus, actor) =>
    request(`/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: { nextStatus, actor },
    }),

  submitReturnRequest: (orderId, draft) =>
    request(`/api/orders/${encodeURIComponent(orderId)}/returns`, {
      method: 'POST',
      body: draft,
    }),

  sendTailorMessage: (tailorName, text, context = {}) =>
    request(
      `/api/conversations/${encodeURIComponent(tailorName)}/messages`,
      { method: 'POST', body: { text, context } },
    ),

  createMidtransSnap: (orderId) =>
    request('/api/payments/midtrans/snap', {
      method: 'POST',
      body: { orderId },
    }),

  signIn: async ({ email, password }) => ({ email, name: email.split('@')[0] }),
  signUp: async ({ name, email, password }) => ({ name, email }),
  signOut: async () => true,

  updateProductImage: async (productId, localUri) => localUri,

  /** Direct Gemini call — works without a backend server. */
  getAiStylistRecommendation: callGeminiStylist,
};

// ─── Backend resolution ───────────────────────────────────────────────────────

const useSupabase =
  DATA_BACKEND === 'supabase' ||
  (DATA_BACKEND === 'auto' && isSupabaseConfigured());

/**
 * The active API client for this session.
 * All modules should import `api` rather than `localApi` or `supabaseApi`
 * directly so the backend can be swapped via environment variables alone.
 */
export const api = useSupabase ? supabaseApi : localApi;

export { ApiError, callGeminiStylist };
