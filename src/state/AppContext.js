/**
 * @file AppContext.js
 * @description Global application state provider for CIRCULAI.
 *
 * Uses React Context + a single provider component (`AppProvider`) to share
 * state across the entire component tree. All mutations are exposed as
 * stable callbacks (wrapped in `useCallback`) to prevent unnecessary
 * re-renders in consuming components.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  canRequestReturn,
  canTransitionOrderStatus,
  categories as fallbackCategories,
  createOrderFromCart,
  initialOrders,
  normalizeOrder,
  orderSteps,
  paymentMethods as fallbackPaymentMethods,
  products as fallbackProducts,
  returnReasons,
  savedAddresses,
  sortOptions as fallbackSortOptions,
  tailors as fallbackTailors,
  calcExchangePoints
} from '../data/appData';
import { api } from '../services/api';
import { syncQueue } from '../services/syncQueue';
import { deleteProfilePhoto } from '../utils/profilePhoto';

import {
  APP_STORAGE_KEY,
  BACKEND_RETRY_INTERVAL_MS,
  CART_DISCOUNT_AMOUNT,
  CART_DISCOUNT_THRESHOLD,
  CART_SHIPPING_FEE,
  INITIAL_CIRCULAR_POINTS,
  TAILOR_REPLY_DELAY_MS,
} from '../config/constants';
import { isSupabaseConfigured } from '../config/supabase';

const AppContext = createContext(null);
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

/**
 * Rule-based fallback reply generator. Used when the Gemini API is
 * unavailable or the API key is not configured.
 *
 * @param {string} text     The user's message.
 * @param {object} context  Optional context ({ orderId, productName }).
 * @param {string} image    Optional attached image URI.
 * @returns {string} A contextually appropriate auto-reply.
 */
function createTailorReply(text, context = {}, image = null) {
  const message = (text ?? '').toLowerCase();
  const subject = context.orderId
    ? `pesanan ${context.orderId}`
    : context.productName
      ? context.productName
      : 'outfit pilihanmu';

  if (image || message.includes('foto') || message.includes('sketsa') || message.includes('gambar') || message.includes('desain')) {
    return `Foto referensinya sudah kami terima dengan jelas! Model dan siluet ini sangat bagus. Kami bisa buatkan pola potong khusus dan jahit sesuai bentuk tubuhmu.`;
  }
  if (message.includes('rekomendasi ukuran') || message.includes('tanya ukuran') || message.includes('panduan ukuran')) {
    return `Untuk ${subject}, silakan kirimkan lingkar dada, lingkar pinggang, dan panjang baju yang diinginkan agar kami buatkan fit yang paling nyaman.`;
  }
  if (message.includes('ketersediaan kain') || message.includes('pilihan kain') || message.includes('kain sisa') || message.includes('bahan')) {
    return `Saat ini tersedia deadstock kain linen premium, katun poplin atelier, dan rayon motif earth tone. Semua kain sudah kami kurasi dan siap digunakan.`;
  }
  if (message.includes('estimasi') || message.includes('lama pengerjaan') || message.includes('kapan jadi')) {
    return `Proses jahit made-to-order biasanya memerlukan 4-7 hari kerja termasuk pemotongan pola dan quality check sebelum dikirim.`;
  }
  if (message.includes('fitting') || message.includes('jadwal') || message.includes('ukur')) {
    return `Bisa banget! Kamu bisa fitting langsung di studio kami atau konsultasi pengukuran via video call/chat dengan penjahit.`;
  }
  if (message.includes('ukuran') || message.includes('size') || message.includes('fit')) {
    return `Bisa, ukuran ${subject} dapat kami sesuaikan. Kirim ukuran utama atau catatan fit yang kamu inginkan ya.`;
  }
  if (message.includes('status') || message.includes('proses') || message.includes('pesanan')) {
    return `Saya cek progres ${subject} dulu ya. Update produksi berikutnya akan saya kirim lewat chat ini.`;
  }
  if (message.includes('halo') || message.includes('hai') || message.includes('hi')) {
    return `Halo juga! Senang bisa membantu kamu terkait ${subject}. Ada detail desain atau ukuran yang ingin didiskusikan?`;
  }
  return `Terima kasih, catatanmu tentang ${subject} sudah saya terima. Saya akan menyesuaikannya dan mengabari kamu jika ada detail yang perlu dikonfirmasi.`;
}

/**
 * Calls Gemini to generate a contextual tailor reply in character.
 * Returns null if the key is missing or the request fails.
 *
 * @param {string} tailorName  The tailor's studio name.
 * @param {string} userMessage The message sent by the user.
 * @param {object} context     Optional context ({ orderId, productName }).
 * @param {string} image       Optional attached image.
 * @returns {Promise<string | null>}
 */
async function callGeminiTailorReply(tailorName, userMessage, context = {}, image = null) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  if (!apiKey || apiKey === 'AIza_YOUR_KEY_HERE') return null;

  const subject = context.orderId
    ? `pesanan ${context.orderId} — ${context.productName ?? ''}`
    : context.productName ?? 'produk custom CIRCULAI';

  const prompt = [
    `Kamu adalah ${tailorName}, seorang penjahit lokal profesional dari platform fashion berkelanjutan CIRCULAI Indonesia.`,
    `Kamu sedang melayani chat dengan pelanggan yang bertanya tentang: ${subject}.`,
    image ? 'Pelanggan juga melampirkan sebuah FOTO REFERENSI / SKETSA model busana.' : '',
    '',
    `Pesan pelanggan: "${userMessage}"`,
    '',
    'Balas sebagai penjahit yang ramah, antusias, profesional, dan paham tentang:',
    '- Teknik jahit dan pola kustom (made-to-order)',
    '- Pilihan kain sisa premium (sustainable fashion upcycling)',
    '- Proses pengerjaan, estimasi waktu, dan jadwal fitting',
    '- Penyesuaian ukuran tubuh yang tepat',
    '',
    'Aturan:',
    '- Gunakan Bahasa Indonesia yang hangat, bersahabat, dan profesional',
    '- Maksimal 2-3 kalimat pendek — ini chat instan, bukan email',
    '- Jangan terlalu kaku, berikan apresiasi jika pengguna melampirkan referensi',
  ].join('\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 120 },
        }),
      },
    );
    if (!response.ok) return null;
    const json = await response.json();
    return json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
  } catch {
    return null;
  }
}

function getLocalCartSummary(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = cart.length > 0 ? CART_SHIPPING_FEE : 0;
  const discount = subtotal >= CART_DISCOUNT_THRESHOLD ? CART_DISCOUNT_AMOUNT : 0;
  return { subtotal, shipping, discount, total: subtotal + shipping - discount };
}

function applyOrderStatusLocally(order, nextStatus, actor) {
  const nextStep = orderSteps.find((step) => step.id === nextStatus);
  const updatedAt = new Date();
  const passports = (order.passports ?? [order.passport]).filter(Boolean).map((passport) => ({
    ...passport,
    status: nextStatus === 'COMPLETED' ? 'ACTIVE' : 'PENDING',
    verification:
      nextStatus === 'COMPLETED'
        ? 'Passport aktif & terverifikasi'
        : 'Aktif setelah pesanan selesai',
    activatedAt:
      nextStatus === 'COMPLETED'
        ? updatedAt.toLocaleDateString('id-ID')
        : passport.activatedAt ?? null
  }));

  return {
    ...order,
    status: nextStatus,
    passport: passports[0],
    passports,
    shipmentStatus:
      nextStatus === 'SHIPPED'
        ? 'Paket dalam perjalanan'
        : nextStatus === 'DELIVERED' || nextStatus === 'COMPLETED'
          ? 'Paket telah diterima'
          : order.shipmentStatus,
    statusHistory: [
      ...(order.statusHistory ?? []),
      {
        status: nextStatus,
        label: updatedAt.toLocaleDateString('id-ID'),
        note: nextStep?.desc ?? 'Status pesanan diperbarui',
        actor
      }
    ]
  };
}

function createLocalReturnRequest(orderId, draft) {
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

function normalizeCart(items = []) {
  return items
    .map((item) => {
      const product = item.product ?? fallbackProducts.find((entry) => String(entry.id) === String(item.productId));
      if (!product) return null;
      return {
        ...item,
        productId: item.productId ?? product.id,
        product
      };
    })
    .filter(Boolean);
}

export function AppProvider({ children }) {
  const [products, setProducts] = useState(fallbackProducts);
  const [tailors, setTailors] = useState(fallbackTailors);
  const [categories, setCategories] = useState(fallbackCategories);
  const [sortOptions, setSortOptions] = useState(fallbackSortOptions);
  const [paymentMethods, setPaymentMethods] = useState(fallbackPaymentMethods);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [styleProfile, setStyleProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(defaultUserProfile);
  const [measurements, setMeasurements] = useState(defaultMeasurements);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [conversations, setConversations] = useState({});
  const [notice, setNotice] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [backendStatus, setBackendStatus] = useState('connecting');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({ visible: false, message: '', onSuccess: null });
  // ─── Circular Exchange ────────────────────────────────────────────────────
  const [circularPoints, setCircularPoints] = useState(INITIAL_CIRCULAR_POINTS);
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const [userVouchers, setUserVouchers] = useState([]);
  const backendOnlineRef = useRef(false);
  const orderCounter = useRef(initialOrders.length + 1);
  const cartCounter = useRef(1);

  const applyBootstrap = useCallback((data) => {
    setProducts(Array.isArray(data.products) ? data.products : fallbackProducts);
    setTailors(Array.isArray(data.tailors) ? data.tailors : fallbackTailors);
    setCategories(Array.isArray(data.categories) ? data.categories : fallbackCategories);
    setSortOptions(Array.isArray(data.sortOptions) ? data.sortOptions : fallbackSortOptions);
    setPaymentMethods(Array.isArray(data.paymentMethods) ? data.paymentMethods : fallbackPaymentMethods);
    setWishlist(Array.isArray(data.wishlist) ? data.wishlist : []);
    setOrders(Array.isArray(data.orders) ? data.orders.map(normalizeOrder) : []);
    setCart(normalizeCart(data.cart));
    setAddresses(Array.isArray(data.addresses) && data.addresses.length ? data.addresses : []);
    setStyleProfile(data.styleProfile ?? null);
    setUserProfile({ ...defaultUserProfile, ...(data.user ?? {}) });
    if (typeof data.isLoggedIn === 'boolean') setIsLoggedIn(data.isLoggedIn);
    setMeasurements({ ...defaultMeasurements, ...(data.measurements ?? {}) });
    setPreferences({
      notifications: { ...defaultPreferences.notifications, ...(data.preferences?.notifications ?? {}) },
      security: { ...defaultPreferences.security, ...(data.preferences?.security ?? {}) },
      privacy: { ...defaultPreferences.privacy, ...(data.preferences?.privacy ?? {}) }
    });
    setConversations(data.conversations && typeof data.conversations === 'object' ? data.conversations : {});
    if (typeof data.circularPoints === 'number') setCircularPoints(data.circularPoints);
    if (Array.isArray(data.exchangeHistory)) setExchangeHistory(data.exchangeHistory);
    if (Array.isArray(data.userVouchers)) setUserVouchers(data.userVouchers);
    orderCounter.current = Array.isArray(data.orders)
      ? data.orders.reduce((max, order) => {
          const value = Number(String(order.id).replace(/\D/g, '')) || 0;
          return Math.max(max, value + 1);
        }, 1)
      : 1;
  }, []);

  const refreshBackend = useCallback(async ({ silent = false } = {}) => {
    try {
      const data = await api.bootstrap();
      applyBootstrap(data);
      backendOnlineRef.current = true;
      setBackendStatus('online');
      syncQueue.flush(api).catch(() => {});
      if (!silent) setNotice('Data tersinkron dengan backend');
      return true;
    } catch {
      backendOnlineRef.current = false;
      setBackendStatus('offline');
      if (!silent) setNotice(`Backend belum terhubung: ${api.baseUrl}`);
      return false;
    }
  }, [applyBootstrap]);

  useEffect(() => {
    AsyncStorage.getItem(APP_STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored);
        // When Supabase is active, only restore non-user catalog data from cache
        // (products, tailors, categories) for faster initial render.
        // All user-specific data (orders, cart, addresses, wishlist, profile, etc.)
        // will be fetched fresh from Supabase cloud in refreshBackend().
        if (isSupabaseConfigured()) {
          applyBootstrap({
            products: parsed.products,
            tailors: parsed.tailors,
            categories: parsed.categories,
            sortOptions: parsed.sortOptions,
            paymentMethods: parsed.paymentMethods
          });
        } else {
          applyBootstrap({
            products: parsed.products,
            tailors: parsed.tailors,
            categories: parsed.categories,
            sortOptions: parsed.sortOptions,
            paymentMethods: parsed.paymentMethods,
            wishlist: parsed.wishlist,
            orders: parsed.orders,
            cart: parsed.cart,
            addresses: parsed.addresses,
            styleProfile: parsed.styleProfile,
            user: parsed.userProfile,
            isLoggedIn: parsed.isLoggedIn,
            measurements: parsed.measurements,
            preferences: parsed.preferences,
            conversations: parsed.conversations,
            circularPoints: parsed.circularPoints,
            exchangeHistory: parsed.exchangeHistory,
            userVouchers: parsed.userVouchers
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        // Also clear stale user data from AsyncStorage if Supabase is active
        if (isSupabaseConfigured()) {
          AsyncStorage.getItem(APP_STORAGE_KEY)
            .then((raw) => {
              if (!raw) return;
              const cached = JSON.parse(raw);
              // Keep only catalog data in cache, wipe user-specific stale data
              const cleanCache = {
                products: cached.products,
                tailors: cached.tailors,
                categories: cached.categories,
                sortOptions: cached.sortOptions,
                paymentMethods: cached.paymentMethods
              };
              AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify(cleanCache));
            })
            .catch(() => {});
        }
        setHydrated(true);
      });
  }, [applyBootstrap]);

  useEffect(() => {
    if (!hydrated) return;
    refreshBackend({ silent: true });
  }, [hydrated, refreshBackend]);

  useEffect(() => {
    if (!hydrated || backendStatus === 'online') return undefined;
    const timer = setInterval(() => {
      refreshBackend({ silent: true });
    }, BACKEND_RETRY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [backendStatus, hydrated, refreshBackend]);

  useEffect(() => {
    if (!hydrated || backendStatus !== 'online' || !api.subscribeUserChanges) return undefined;
    let cleanup;
    let active = true;

    api.subscribeUserChanges({
      onOrders: (nextOrders) => {
        if (active) setOrders(nextOrders.map(normalizeOrder));
      },
      onConversations: (nextConversations) => {
        if (active) setConversations(nextConversations);
      }
    })
      .then((unsubscribe) => {
        cleanup = unsubscribe;
      })
      .catch(() => {});

    return () => {
      active = false;
      cleanup?.();
    };
  }, [backendStatus, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      APP_STORAGE_KEY,
      JSON.stringify({
        products,
        tailors,
        categories,
        sortOptions,
        paymentMethods,
        wishlist,
        orders,
        cart,
        addresses,
        styleProfile,
        userProfile,
        isLoggedIn,
        measurements,
        preferences,
        conversations,
        circularPoints,
        exchangeHistory,
        userVouchers
      })
    ).catch(() => {});
  }, [
    addresses,
    cart,
    categories,
    circularPoints,
    conversations,
    exchangeHistory,
    hydrated,
    isLoggedIn,
    measurements,
    orders,
    paymentMethods,
    preferences,
    products,
    sortOptions,
    styleProfile,
    tailors,
    userProfile,
    userVouchers,
    wishlist
  ]);

  const openAuthModal = useCallback((message = '', onSuccess = null) => {
    setAuthModalConfig({ visible: true, message, onSuccess });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  const login = useCallback(async (credentials = {}) => {
    try {
      if (credentials.email && credentials.password && api.signIn) {
        await api.signIn(credentials);
      }
      setIsLoggedIn(true);
      if (credentials.name || credentials.email) {
        setUserProfile((prev) => ({ ...prev, ...credentials }));
      }
      await refreshBackend({ silent: true });
      setNotice(`Selamat datang, ${credentials.name || userProfile.name || 'Member'}!`);
      return true;
    } catch (err) {
      if (credentials.email && !credentials.password) {
        setIsLoggedIn(true);
        setUserProfile((prev) => ({ ...prev, ...credentials }));
        setNotice(`Selamat datang, ${credentials.name || userProfile.name || 'Member'}!`);
        return true;
      }
      throw err;
    }
  }, [refreshBackend, userProfile.name]);

  const register = useCallback(async (data = {}) => {
    try {
      if (api.signUp) {
        await api.signUp(data);
      }
      setIsLoggedIn(true);
      if (data.name || data.email) {
        setUserProfile((prev) => ({ ...prev, ...data }));
      }
      await refreshBackend({ silent: true });
      setNotice(`Selamat datang di CIRCULAI, ${data.name || 'Member'}!`);
      return true;
    } catch (err) {
      throw err;
    }
  }, [refreshBackend]);

  const logout = useCallback(async () => {
    try {
      if (api.signOut) {
        await api.signOut();
      }
    } catch {
      // ignore
    }
    setIsLoggedIn(false);
    setCart([]);
    setOrders([]);
    setAddresses([]);
    setWishlist([]);
    setUserProfile(defaultUserProfile);
    setMeasurements(defaultMeasurements);
    setNotice('Kamu telah keluar dari akun');
    await refreshBackend({ silent: true });
  }, [refreshBackend]);

  const requireAuth = useCallback((onSuccess, message = 'Silakan masuk ke akun kamu terlebih dahulu untuk melanjutkan.') => {
    if (isLoggedIn) {
      if (onSuccess) onSuccess();
      return true;
    }
    openAuthModal(message, onSuccess);
    return false;
  }, [isLoggedIn, openAuthModal]);

  const runRemote = useCallback(async (operation, onSuccess, actionMeta) => {
    if (!backendOnlineRef.current) {
      if (actionMeta) {
        syncQueue.enqueue(actionMeta.action, actionMeta.payload).catch(() => {});
      }
      return false;
    }
    try {
      const result = await operation();
      onSuccess?.(result);
      return true;
    } catch {
      backendOnlineRef.current = false;
      setBackendStatus('offline');
      if (actionMeta) {
        syncQueue.enqueue(actionMeta.action, actionMeta.payload).catch(() => {});
      }
      setNotice('Backend tidak merespons. Perubahan disimpan sementara di app.');
      return false;
    }
  }, []);

  const toggleWishlist = useCallback((productId) => {
    if (!isLoggedIn) {
      openAuthModal('Masuk ke akun untuk menyimpan produk ke favorit.', () => {
        toggleWishlist(productId);
      });
      return;
    }
    const favorite = !wishlist.includes(productId);
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
    runRemote(
      () => api.toggleWishlist(productId, favorite),
      (nextWishlist) => setWishlist(Array.isArray(nextWishlist) ? nextWishlist : []),
      { action: 'TOGGLE_WISHLIST', payload: { productId, favorite } }
    );
  }, [isLoggedIn, openAuthModal, runRemote, wishlist]);

  const addToCart = useCallback((product, customization = {}) => {
    if (!isLoggedIn) {
      openAuthModal('Masuk ke akun untuk menambahkan produk ke keranjang belanja.', () => {
        addToCart(product, customization);
      });
      return null;
    }
    const extraCost = customization.fabric?.extraCost ?? 0;
    const item = {
      cartItemId: `LOCAL-CART-${Date.now()}-${cartCounter.current++}`,
      productId: product.id,
      product,
      customization,
      quantity: 1,
      unitPrice: product.price + extraCost
    };
    setCart((current) => [...current, item]);
    setNotice(`${product.name} masuk ke keranjang`);
    runRemote(
      () => api.addCartItem({ product, customization, quantity: 1 }),
      (payload) => {
        if (payload?.items) setCart(normalizeCart(payload.items));
      }
    );
    return item;
  }, [isLoggedIn, openAuthModal, runRemote]);

  const removeFromCart = useCallback((cartItemId) => {
    setCart((current) => current.filter((item) => item.cartItemId !== cartItemId));
    runRemote(
      () => api.removeCartItem(cartItemId),
      (payload) => {
        if (payload?.items) setCart(normalizeCart(payload.items));
      }
    );
  }, [runRemote]);

  const updateCartQuantity = useCallback((cartItemId, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
    runRemote(
      () => api.updateCartItem(cartItemId, delta),
      (payload) => {
        if (payload?.items) setCart(normalizeCart(payload.items));
      }
    );
  }, [runRemote]);

  const clearCart = useCallback(() => {
    setCart([]);
    runRemote(() => api.clearCart());
  }, [runRemote]);

  const selectedAddress = useMemo(() => {
    if (!addresses || addresses.length === 0) return null;
    return addresses.find((item) => item.id === selectedAddressId) ?? addresses[0];
  }, [addresses, selectedAddressId]);

  const selectAddress = useCallback((addressId) => {
    if (!addressId) return;
    setSelectedAddressId(addressId);
  }, []);

  const addAddress = useCallback(async (draft) => {
    const localAddress = {
      id: `ADDR-${Date.now()}`,
      label: draft.label?.trim() || 'Alamat Baru',
      receiver: draft.receiver.trim(),
      phone: draft.phone.trim(),
      detail: draft.detail.trim()
    };

    let created = localAddress;
    if (backendOnlineRef.current) {
      try {
        const address = await api.addAddress(draft);
        setAddresses((current) => [...current, address]);
        created = address;
      } catch {
        backendOnlineRef.current = false;
        setBackendStatus('offline');
        syncQueue.enqueue('ADD_ADDRESS', draft).catch(() => {});
        setAddresses((current) => [...current, localAddress]);
      }
    } else {
      syncQueue.enqueue('ADD_ADDRESS', draft).catch(() => {});
      setAddresses((current) => [...current, localAddress]);
    }

    setSelectedAddressId(created.id);
    return created;
  }, []);

  const removeAddress = useCallback((addressId) => {
    setAddresses((current) => {
      const next = current.filter((address) => address.id !== addressId);
      if (selectedAddressId === addressId) {
        setSelectedAddressId(next[0]?.id ?? null);
      }
      return next;
    });
    setNotice('Alamat dihapus');
    runRemote(
      () => api.removeAddress(addressId),
      null,
      { action: 'REMOVE_ADDRESS', payload: { id: addressId } }
    );
  }, [runRemote, selectedAddressId]);

  const updatePreference = useCallback((section, key, value) => {
    if (!defaultPreferences[section] || !(key in defaultPreferences[section])) return;
    const nextPreferences = {
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: value
      }
    };
    setPreferences(nextPreferences);
    runRemote(
      () => api.updatePreferences(nextPreferences),
      (payload) => payload && setPreferences(payload)
    );
  }, [preferences, runRemote]);

  const updateUserProfile = useCallback((nextProfile) => {
    const profile = { ...userProfile, ...nextProfile };
    setUserProfile(profile);
    setNotice('Profil berhasil diperbarui');
    runRemote(
      () => api.updateProfile(profile),
      (payload) => payload && setUserProfile({ ...defaultUserProfile, ...payload })
    );
  }, [runRemote, userProfile]);

  const updateProductImage = useCallback(async (productId, localUri) => {
    if (!api.updateProductImage) {
      setNotice('Fitur ini membutuhkan koneksi Supabase');
      return null;
    }
    try {
      const publicUrl = await api.updateProductImage(productId, localUri);
      setProducts((prev) =>
        prev.map((p) => (String(p.id) === String(productId) ? { ...p, image: publicUrl } : p))
      );
      setNotice('Foto produk berhasil diperbarui!');
      return publicUrl;
    } catch (err) {
      setNotice(err?.message ?? 'Gagal mengupload foto produk');
      return null;
    }
  }, [setProducts]);

  const saveMeasurements = useCallback((nextMeasurements) => {
    if (!isLoggedIn) {
      openAuthModal('Masuk ke akun untuk menyimpan ukuran tubuh agar tersinkron di semua perangkat.', () => {
        saveMeasurements(nextMeasurements);
      });
      return;
    }
    const merged = { ...measurements, ...nextMeasurements };
    setMeasurements(merged);
    setNotice('Ukuran tubuh berhasil disimpan');
    runRemote(
      () => api.saveMeasurements(merged),
      (payload) => payload && setMeasurements({ ...defaultMeasurements, ...payload }),
      { action: 'SAVE_MEASUREMENTS', payload: merged }
    );
  }, [isLoggedIn, measurements, openAuthModal, runRemote]);

  const saveStyleProfile = useCallback((profile) => {
    setStyleProfile(profile);
    runRemote(
      () => api.saveStyleProfile(profile),
      null,
      { action: 'SAVE_STYLE_PROFILE', payload: profile }
    );
  }, [runRemote]);

  const resetStyleProfile = useCallback(() => {
    setStyleProfile(null);
    runRemote(() => api.resetStyleProfile());
  }, [runRemote]);

  const resetAccountData = useCallback(async () => {
    deleteProfilePhoto(userProfile.photoUri);
    if (backendOnlineRef.current) {
      try {
        const data = await api.resetDemo();
        applyBootstrap(data);
        setNotice('Sesi akun dan backend demo telah direset');
        return;
      } catch {
        backendOnlineRef.current = false;
        setBackendStatus('offline');
      }
    }
    setWishlist([]);
    setCart([]);
    setAddresses(savedAddresses);
    setStyleProfile(null);
    setUserProfile(defaultUserProfile);
    setMeasurements(defaultMeasurements);
    setPreferences(defaultPreferences);
    setConversations({});
    setNotice('Sesi akun telah direset');
  }, [applyBootstrap, userProfile.photoUri]);

  /**
   * Sends a message to a tailor and orchestrates the auto-reply flow.
   *
   * @param {string} tailorName   Studio name (used as the conversation key).
   * @param {string} text         The user's outgoing message text.
   * @param {object} context      Optional { orderId, productName }.
   * @param {string} image        Optional attached image URI (sketch / photo).
   * @returns {boolean} false when params are invalid, true otherwise.
   */
  const sendTailorMessage = useCallback((tailorName, text, context = {}, image = null) => {
    if (!isLoggedIn) {
      openAuthModal('Masuk ke akun untuk berkonsultasi langsung dengan penjahit.');
      return false;
    }
    const cleanText = (text ?? '').trim();
    if (!tailorName || (!cleanText && !image)) return false;

    const sentAt = new Date().toISOString();
    const outgoing = {
      id: `MSG-${Date.now()}-USER`,
      sender: 'user',
      text: cleanText || (image ? 'Mengirim foto referensi' : ''),
      image: image ?? null,
      createdAt: sentAt,
      context
    };

    setConversations((current) => ({
      ...current,
      [tailorName]: [...(current[tailorName] ?? []), outgoing]
    }));

    if (backendOnlineRef.current) {
      api.sendTailorMessage(tailorName, cleanText, context)
        .then((messages) => {
          setConversations((current) => ({
            ...current,
            [tailorName]: messages
          }));
        })
        .catch(() => {
          backendOnlineRef.current = false;
          setBackendStatus('offline');
        });
      return true;
    }

    // Offline / demo mode — generate an AI-powered reply via Gemini.
    setTimeout(async () => {
      // Try Gemini first, fall back to rule-based reply.
      let replyText = await callGeminiTailorReply(tailorName, cleanText || 'Mengirim foto referensi', context, image);
      if (!replyText) {
        replyText = createTailorReply(cleanText, context, image);
      }

      const reply = {
        id: `MSG-${Date.now()}-TAILOR`,
        sender: 'tailor',
        text: replyText,
        createdAt: new Date().toISOString(),
        context
      };

      setConversations((current) => ({
        ...current,
        [tailorName]: [...(current[tailorName] ?? []), reply]
      }));
    }, TAILOR_REPLY_DELAY_MS);

    return true;
  }, [isLoggedIn, openAuthModal]);

  const cartSummary = useMemo(() => getLocalCartSummary(cart), [cart]);

  // ─── Circular Exchange Actions ──────────────────────────────────────────────
  const submitExchange = useCallback(async (draft) => {
    if (!isLoggedIn) {
      openAuthModal('Masuk ke akun untuk mengajukan penukaran atau donasi pakaian.');
      return null;
    }
    const { itemTypeId, quantity, mode, donationPartnerId, notes } = draft;
    const earnedPoints = mode === 'donate' ? 0 : calcExchangePoints(itemTypeId, quantity);
    const exchangeId = `EXC-${Date.now().toString(36).toUpperCase()}`;
    const createdAt = new Date();
    const record = {
      id: exchangeId,
      itemTypeId,
      quantity,
      mode,
      donationPartnerId: mode === 'donate' ? donationPartnerId : null,
      notes: notes?.trim() || '',
      earnedPoints,
      status: 'PENDING_SHIPMENT',
      createdAt: createdAt.toISOString(),
      createdAtLabel: createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setExchangeHistory((current) => [record, ...current]);
    if (mode === 'points') {
      setCircularPoints((current) => current + earnedPoints);
      setNotice(`+${earnedPoints} CircularPoints ditambahkan!`);
    } else {
      setNotice('Donasi barang berhasil diajukan. Terima kasih!');
    }
    return record;
  }, [isLoggedIn, openAuthModal]);

  const redeemPoints = useCallback((option) => {
    if (!isLoggedIn) {
      openAuthModal('Masuk ke akun untuk menukarkan Circular Points.');
      return null;
    }
    if (circularPoints < option.pointCost) {
      setNotice('Poin tidak cukup untuk penukaran ini');
      return null;
    }
    const voucherId = `VCH-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + option.validDays * 24 * 60 * 60 * 1000);
    const voucher = {
      id: voucherId,
      optionId: option.id,
      label: option.label,
      value: option.value,
      type: option.type,
      minPurchase: option.minPurchase,
      expiresAt: expiresAt.toISOString(),
      expiresAtLabel: expiresAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      used: false
    };
    setCircularPoints((current) => current - option.pointCost);
    setUserVouchers((current) => [voucher, ...current]);
    setNotice(`Voucher ${option.label} berhasil ditukar!`);
    return voucher;
  }, [circularPoints, isLoggedIn, openAuthModal]);

  const placeOrder = useCallback(async ({ address, paymentMethod, total }) => {
    if (!cart || cart.length === 0 || !address || !paymentMethod?.id) return null;

    const validAddress = address.id ? address : { ...address, id: `ADDR-${Date.now()}` };
    const orderTotal = total ?? cartSummary.total;

    if (backendOnlineRef.current) {
      try {
        const order = await api.placeOrder({ address: validAddress, paymentMethod, cart, total: orderTotal });
        if (order) {
          const normalized = normalizeOrder(order);
          setOrders((current) => [normalized, ...current.filter((item) => item.id !== normalized.id)]);
          setCart([]);
          setNotice(`Pesanan ${normalized.id} berhasil dibuat`);
          return normalized;
        }
      } catch (err) {
        console.warn('[placeOrder] Cloud place order error:', err);
      }
    }

    const newOrder = createOrderFromCart(cart, orderCounter.current - 1, {
      address: validAddress,
      paymentMethod,
      total: orderTotal
    });
    orderCounter.current += 1;
    setOrders((current) => [newOrder, ...current]);
    setCart([]);
    setNotice(`Pesanan ${newOrder.id} berhasil dibuat`);
    return newOrder;
  }, [cart, cartSummary.total]);

  const createMidtransPayment = useCallback(async (orderId, orderPayload = null) => {
    if (!api.createMidtransSnap) {
      throw new Error('Midtrans Snap tidak didukung pada API backend saat ini');
    }
    try {
      const targetPayload = orderPayload || orders.find((o) => o.id === orderId);
      return await api.createMidtransSnap(orderId, targetPayload);
    } catch (error) {
      setNotice(error?.message ?? 'Midtrans belum dapat dibuka');
      throw error;
    }
  }, [orders, setNotice]);

  const updateOrderStatus = useCallback(async (orderId, nextStatus, actor) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder || !canTransitionOrderStatus(targetOrder.status, nextStatus, actor)) {
      setNotice('Perubahan status tidak diizinkan untuk peran ini');
      return false;
    }
    if (
      targetOrder.status === 'WAITING_PAYMENT' &&
      targetOrder.paymentData?.expiresAt &&
      new Date(targetOrder.paymentData.expiresAt).getTime() <= Date.now()
    ) {
      setNotice('Batas pembayaran pesanan sudah berakhir');
      return false;
    }

    if (backendOnlineRef.current) {
      try {
        const order = await api.updateOrderStatus(orderId, nextStatus, actor);
        setOrders((current) => current.map((item) => (item.id === orderId ? normalizeOrder(order) : item)));
        const nextStep = orderSteps.find((step) => step.id === nextStatus);
        setNotice(`Status pesanan: ${nextStep?.label ?? nextStatus}`);
        return true;
      } catch {
        backendOnlineRef.current = false;
        setBackendStatus('offline');
      }
    }

    const nextStep = orderSteps.find((step) => step.id === nextStatus);
    setOrders((current) =>
      current.map((order) => (
        order.id === orderId ? applyOrderStatusLocally(order, nextStatus, actor) : order
      ))
    );
    setNotice(`Status pesanan: ${nextStep?.label ?? nextStatus}`);
    return true;
  }, [orders]);

  const submitReturnRequest = useCallback(async (orderId, draft) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder || !canRequestReturn(targetOrder)) {
      setNotice('Pengajuan retur belum tersedia untuk pesanan ini');
      return false;
    }

    if (backendOnlineRef.current) {
      try {
        const request = await api.submitReturnRequest(orderId, draft);
        setOrders((current) =>
          current.map((order) => (
            order.id === orderId ? { ...order, returnRequest: request } : order
          ))
        );
        setNotice(`Pengajuan retur ${request.id} dikirim`);
        return true;
      } catch {
        backendOnlineRef.current = false;
        setBackendStatus('offline');
      }
    }

    const request = createLocalReturnRequest(orderId, draft);
    setOrders((current) =>
      current.map((order) => (
        order.id === orderId ? { ...order, returnRequest: request } : order
      ))
    );
    setNotice(`Pengajuan retur ${request.id} dikirim`);
    return true;
  }, [orders]);

  const getTailorByName = useCallback((name) => tailors.find((tailor) => tailor.name === name) ?? {
    name,
    city: 'Indonesia',
    specialty: 'Made-to-order fashion',
    rating: 4.8,
    sold: 0,
    experience: 'Berpengalaman',
    responseTime: '< 30 menit',
    verified: true,
    image: null
  }, [tailors]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      authModalConfig,
      openAuthModal,
      closeAuthModal,
      login,
      register,
      logout,
      requireAuth,
      products,
      tailors,
      categories,
      sortOptions,
      paymentMethods,
      wishlist,
      orders,
      cart,
      cartSummary,
      addresses,
      selectedAddressId,
      selectedAddress,
      selectAddress,
      styleProfile,
      userProfile,
      measurements,
      preferences,
      conversations,
      notice,
      circularPoints,
      exchangeHistory,
      userVouchers,
      backend: {
        status: backendStatus,
        baseUrl: api.baseUrl,
        refresh: refreshBackend
      },
      setNotice,
      toggleWishlist,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      addAddress,
      removeAddress,
      updateUserProfile,
      updateProductImage,
      saveMeasurements,
      updatePreference,
      sendTailorMessage,
      resetAccountData,
      placeOrder,
      createMidtransPayment,
      updateOrderStatus,
      submitReturnRequest,
      saveStyleProfile,
      resetStyleProfile,
      getTailorByName,
      submitExchange,
      redeemPoints
    }),
    [
      addAddress,
      addToCart,
      addresses,
      authModalConfig,
      backendStatus,
      cart,
      cartSummary,
      categories,
      circularPoints,
      clearCart,
      closeAuthModal,
      conversations,
      createMidtransPayment,
      exchangeHistory,
      getTailorByName,
      isLoggedIn,
      login,
      register,
      logout,
      measurements,
      notice,
      openAuthModal,
      orders,
      paymentMethods,
      placeOrder,
      preferences,
      products,
      redeemPoints,
      refreshBackend,
      removeAddress,
      removeFromCart,
      requireAuth,
      resetAccountData,
      resetStyleProfile,
      saveMeasurements,
      saveStyleProfile,
      selectAddress,
      selectedAddress,
      selectedAddressId,
      sendTailorMessage,
      sortOptions,
      styleProfile,
      submitExchange,
      submitReturnRequest,
      tailors,
      toggleWishlist,
      updateCartQuantity,
      updateOrderStatus,
      updatePreference,
      updateProductImage,
      updateUserProfile,
      userProfile,
      userVouchers,
      wishlist
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook that provides access to the global CIRCULAI app state and all
 * mutation actions. Must be used inside a component wrapped by `AppProvider`.
 *
 * @returns {ReturnType<typeof useMemo>} The full application context value.
 * @throws {Error} When called outside of an `AppProvider` tree.
 */
export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error(
      '[CIRCULAI] useAppState() must be called inside an <AppProvider>.',
    );
  }
  return context;
}
