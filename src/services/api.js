import { API_BASE_URL } from '../config/api';
import { DATA_BACKEND, isSupabaseConfigured } from '../config/supabase';
import { supabaseApi } from './supabaseApi';

const REQUEST_TIMEOUT = 8000;

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {})
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(json.error?.message ?? 'Request backend gagal', response.status, json.error?.details);
    }

    return json.data;
  } finally {
    clearTimeout(timeout);
  }
}

export const localApi = {
  type: 'local',
  baseUrl: API_BASE_URL,
  bootstrap: () => request('/api/bootstrap'),
  resetDemo: () => request('/api/dev/reset', { method: 'POST' }),
  addCartItem: ({ product, customization = {}, quantity = 1 }) =>
    request('/api/cart/items', {
      method: 'POST',
      body: {
        productId: product.id,
        product,
        customization,
        quantity
      }
    }),
  updateCartItem: (cartItemId, delta) =>
    request(`/api/cart/items/${encodeURIComponent(cartItemId)}`, {
      method: 'PATCH',
      body: { delta }
    }),
  removeCartItem: (cartItemId) =>
    request(`/api/cart/items/${encodeURIComponent(cartItemId)}`, { method: 'DELETE' }),
  clearCart: () => request('/api/cart', { method: 'DELETE' }),
  addAddress: (draft) => request('/api/addresses', { method: 'POST', body: draft }),
  removeAddress: (addressId) =>
    request(`/api/addresses/${encodeURIComponent(addressId)}`, { method: 'DELETE' }),
  updateProfile: (profile) => request('/api/profile', { method: 'PATCH', body: profile }),
  saveMeasurements: (measurements) => request('/api/measurements', { method: 'PATCH', body: measurements }),
  updatePreferences: (preferences) => request('/api/preferences', { method: 'PATCH', body: preferences }),
  saveStyleProfile: (profile) => request('/api/style-profile', { method: 'PUT', body: profile }),
  resetStyleProfile: () => request('/api/style-profile', { method: 'DELETE' }),
  toggleWishlist: (productId, favorite) =>
    request(`/api/wishlist/${encodeURIComponent(productId)}`, {
      method: favorite ? 'POST' : 'DELETE'
    }),
  placeOrder: ({ address, paymentMethod }) =>
    request('/api/orders', {
      method: 'POST',
      body: {
        addressId: address.id,
        paymentMethodId: paymentMethod.id
      }
    }),
  updateOrderStatus: (orderId, nextStatus, actor) =>
    request(`/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: { nextStatus, actor }
    }),
  submitReturnRequest: (orderId, draft) =>
    request(`/api/orders/${encodeURIComponent(orderId)}/returns`, {
      method: 'POST',
      body: draft
    }),
  sendTailorMessage: (tailorName, text, context = {}) =>
    request(`/api/conversations/${encodeURIComponent(tailorName)}/messages`, {
      method: 'POST',
      body: { text, context }
    }),
  createMidtransSnap: (orderId) =>
    request('/api/payments/midtrans/snap', {
      method: 'POST',
      body: { orderId }
    })
};

export const api =
  (DATA_BACKEND === 'supabase' || (DATA_BACKEND === 'auto' && isSupabaseConfigured()))
    ? supabaseApi
    : localApi;

export { ApiError };
