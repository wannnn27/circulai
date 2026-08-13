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
import { deleteProfilePhoto } from '../utils/profilePhoto';

const AppContext = createContext(null);
const STORAGE_KEY = '@circulai/app-state-v3';
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

function createTailorReply(text, context = {}) {
  const message = text.toLowerCase();
  const subject = context.orderId
    ? `pesanan ${context.orderId}`
    : context.productName
      ? context.productName
      : 'outfit pilihanmu';

  if (message.includes('ukuran') || message.includes('size') || message.includes('fit')) {
    return `Bisa, ukuran ${subject} dapat kami sesuaikan. Kirim ukuran utama atau catatan fit yang kamu inginkan ya.`;
  }
  if (message.includes('kain') || message.includes('bahan') || message.includes('warna')) {
    return `Tentu. Untuk ${subject}, saya akan cek pilihan kain dan warna yang masih tersedia lalu mengabari kamu di sini.`;
  }
  if (message.includes('status') || message.includes('proses') || message.includes('pesanan')) {
    return `Saya cek progres ${subject} dulu ya. Update produksi berikutnya akan saya kirim lewat chat ini.`;
  }
  if (message.includes('halo') || message.includes('hai') || message.includes('hi')) {
    return `Halo juga. Senang bisa membantu kamu terkait ${subject}. Ada detail yang ingin didiskusikan?`;
  }
  return `Terima kasih, catatanmu tentang ${subject} sudah saya terima. Saya akan menyesuaikannya dan mengabari kamu jika ada detail yang perlu dikonfirmasi.`;
}

function getLocalCartSummary(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = cart.length > 0 ? 18000 : 0;
  const discount = subtotal >= 400000 ? 20000 : 0;
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
  const [wishlist, setWishlist] = useState([1, 5]);
  const [orders, setOrders] = useState(initialOrders.map(normalizeOrder));
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState(savedAddresses);
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
  const [circularPoints, setCircularPoints] = useState(320);
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
    setOrders(Array.isArray(data.orders) ? data.orders.map(normalizeOrder) : initialOrders.map(normalizeOrder));
    setCart(normalizeCart(data.cart));
    setAddresses(Array.isArray(data.addresses) && data.addresses.length ? data.addresses : savedAddresses);
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
      : initialOrders.length + 1;
  }, []);

  const refreshBackend = useCallback(async ({ silent = false } = {}) => {
    try {
      const data = await api.bootstrap();
      applyBootstrap(data);
      backendOnlineRef.current = true;
      setBackendStatus('online');
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
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored);
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
      })
      .catch(() => {})
      .finally(() => {
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
    }, 10000);
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
      STORAGE_KEY,
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

  const login = useCallback((userData = {}) => {
    setIsLoggedIn(true);
    if (userData.name || userData.email) {
      setUserProfile((prev) => ({ ...prev, ...userData }));
    }
    setNotice(`Selamat datang, ${userData.name || userProfile.name || 'Member'}!`);
  }, [userProfile.name]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setNotice('Kamu telah keluar dari akun');
  }, []);

  const requireAuth = useCallback((onSuccess, message = 'Silakan masuk ke akun kamu terlebih dahulu untuk melanjutkan pesanan.') => {
    if (isLoggedIn) {
      if (onSuccess) onSuccess();
      return true;
    }
    openAuthModal(message, onSuccess);
    return false;
  }, [isLoggedIn, openAuthModal]);

  const runRemote = useCallback(async (operation, onSuccess) => {
    if (!backendOnlineRef.current) return false;
    try {
      const result = await operation();
      onSuccess?.(result);
      return true;
    } catch {
      backendOnlineRef.current = false;
      setBackendStatus('offline');
      setNotice('Backend tidak merespons. Perubahan disimpan sementara di app.');
      return false;
    }
  }, []);

  const toggleWishlist = useCallback((productId) => {
    const favorite = !wishlist.includes(productId);
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
    runRemote(
      () => api.toggleWishlist(productId, favorite),
      (nextWishlist) => setWishlist(Array.isArray(nextWishlist) ? nextWishlist : [])
    );
  }, [runRemote, wishlist]);

  const addToCart = useCallback((product, customization = {}) => {
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
  }, [runRemote]);

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

  const addAddress = useCallback(async (draft) => {
    const localAddress = {
      id: `ADDR-${Date.now()}`,
      label: draft.label?.trim() || 'Alamat Baru',
      receiver: draft.receiver.trim(),
      phone: draft.phone.trim(),
      detail: draft.detail.trim()
    };

    if (backendOnlineRef.current) {
      try {
        const address = await api.addAddress(draft);
        setAddresses((current) => [...current, address]);
        return address;
      } catch {
        backendOnlineRef.current = false;
        setBackendStatus('offline');
      }
    }

    setAddresses((current) => [...current, localAddress]);
    return localAddress;
  }, []);

  const removeAddress = useCallback((addressId) => {
    setAddresses((current) => current.filter((address) => address.id !== addressId));
    setNotice('Alamat dihapus');
    runRemote(() => api.removeAddress(addressId));
  }, [runRemote]);

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

  const saveMeasurements = useCallback((nextMeasurements) => {
    const merged = { ...measurements, ...nextMeasurements };
    setMeasurements(merged);
    setNotice('Ukuran tubuh berhasil disimpan');
    runRemote(
      () => api.saveMeasurements(merged),
      (payload) => payload && setMeasurements({ ...defaultMeasurements, ...payload })
    );
  }, [measurements, runRemote]);

  const saveStyleProfile = useCallback((profile) => {
    setStyleProfile(profile);
    runRemote(() => api.saveStyleProfile(profile));
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

  const sendTailorMessage = useCallback((tailorName, text, context = {}) => {
    const cleanText = text.trim();
    if (!tailorName || !cleanText) return false;

    const sentAt = new Date().toISOString();
    const outgoing = {
      id: `MSG-${Date.now()}-USER`,
      sender: 'user',
      text: cleanText,
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

    setTimeout(() => {
      const reply = {
        id: `MSG-${Date.now()}-TAILOR`,
        sender: 'tailor',
        text: createTailorReply(cleanText, context),
        createdAt: new Date().toISOString(),
        context
      };
      setConversations((current) => ({
        ...current,
        [tailorName]: [...(current[tailorName] ?? []), reply]
      }));
    }, 700);

    return true;
  }, []);

  const cartSummary = useMemo(() => getLocalCartSummary(cart), [cart]);

  // ─── Circular Exchange Actions ──────────────────────────────────────────────
  const submitExchange = useCallback(async (draft) => {
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
  }, []);

  const redeemPoints = useCallback((option) => {
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
  }, [circularPoints]);

  const placeOrder = useCallback(async ({ address, paymentMethod }) => {
    if (cart.length === 0 || !address?.id || !paymentMethod?.id) return null;

    if (backendOnlineRef.current) {
      try {
        const order = await api.placeOrder({ address, paymentMethod });
        setOrders((current) => [normalizeOrder(order), ...current.filter((item) => item.id !== order.id)]);
        setCart([]);
        setNotice(`Pesanan ${order.id} berhasil dibuat`);
        return order;
      } catch {
        backendOnlineRef.current = false;
        setBackendStatus('offline');
      }
    }

    const newOrder = createOrderFromCart(cart, orderCounter.current - 1, {
      address,
      paymentMethod,
      total: cartSummary.total
    });
    orderCounter.current += 1;
    setOrders((current) => [newOrder, ...current]);
    setCart([]);
    setNotice(`Pesanan ${newOrder.id} berhasil dibuat`);
    return newOrder;
  }, [cart, cartSummary.total]);

  const createMidtransPayment = useCallback(async (orderId) => {
    if (!backendOnlineRef.current || !api.createMidtransSnap) {
      throw new Error('Midtrans hanya tersedia saat backend cloud terhubung');
    }
    try {
      return await api.createMidtransSnap(orderId);
    } catch (error) {
      setNotice(error?.message ?? 'Midtrans belum dapat dibuka');
      throw error;
    }
  }, []);

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
      updateUserProfile,
      userProfile,
      userVouchers,
      wishlist
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppProvider');
  }
  return context;
}
