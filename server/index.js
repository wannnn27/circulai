const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(__dirname, '..', '.env'));

const {
  canRequestReturn,
  canTransitionOrderStatus,
  calculateCartSummary,
  createOrderFromCart,
  createTailorReply,
  enrichCart,
  getNextNumericId,
  getProduct,
  orderSteps,
  paymentMethods,
  returnReasons,
  returnStatusMeta
} = require('./lib/domain');
const { loadStore, resetStore, updateStore } = require('./lib/store');

const PORT = Number(process.env.PORT || 4000);
const MAX_BODY_SIZE = 2 * 1024 * 1024;

function createError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > MAX_BODY_SIZE) {
        reject(createError(413, 'Body terlalu besar'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(createError(400, 'JSON body tidak valid'));
      }
    });
    req.on('error', reject);
  });
}

function decode(value) {
  return decodeURIComponent(value ?? '');
}

function getPublicState(data) {
  return {
    user: data.user,
    measurements: data.measurements,
    preferences: data.preferences,
    styleProfile: data.styleProfile,
    wishlist: data.wishlist,
    products: data.products,
    tailors: data.tailors,
    categories: data.categories,
    sortOptions: data.sortOptions,
    paymentMethods: data.paymentMethods,
    addresses: data.addresses,
    cart: enrichCart(data),
    cartSummary: calculateCartSummary(data.cart, data.products),
    orders: data.orders,
    conversations: data.conversations,
    orderSteps,
    returnReasons,
    returnStatusMeta
  };
}

function filterProducts(data, searchParams) {
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();
  const category = searchParams.get('category');
  const wishlistOnly = searchParams.get('wishlistOnly') === 'true';
  const sort = searchParams.get('sort') ?? 'Terbaru';

  return data.products
    .filter((product) => {
      const categoryMatch = !category || category === 'Semua' || product.category === category;
      const searchMatch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.tailor.toLowerCase().includes(query) ||
        product.badges.some((badge) => badge.toLowerCase().includes(query));
      const wishlistMatch = !wishlistOnly || data.wishlist.includes(product.id);
      return categoryMatch && searchMatch && wishlistMatch;
    })
    .sort((a, b) => {
      if (sort === 'Harga Terendah') return a.price - b.price;
      if (sort === 'Harga Tertinggi') return b.price - a.price;
      if (sort === 'Rating') return b.rating - a.rating;
      return b.id - a.id;
    });
}

function addCartItem(data, body) {
  let product = getProduct(data, body.productId ?? body.product?.id);
  if (!product && body.product?.id) {
    product = {
      ...body.product,
      price: Number(body.product.price) || 0,
      orderType: body.product.orderType ?? 'custom'
    };
    data.products.push(product);
  }
  if (!product) throw createError(404, 'Produk tidak ditemukan');
  const quantity = Math.max(1, Number(body.quantity) || 1);
  const extraCost = Number(body.customization?.fabric?.extraCost) || 0;
  const item = {
    cartItemId: `CART-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    productId: product.id,
    customization: body.customization ?? {},
    quantity,
    unitPrice: product.price + extraCost
  };
  data.cart.push(item);
  return { ...item, product };
}

function createReturnRequest(data, orderId, body) {
  const order = data.orders.find((item) => item.id === orderId);
  if (!order) throw createError(404, 'Pesanan tidak ditemukan');
  if (!canRequestReturn(order)) throw createError(409, 'Pengajuan retur belum tersedia untuk pesanan ini');

  const reason = returnReasons.find((item) => item.id === body.reasonId);
  if (!reason) throw createError(400, 'Alasan pengembalian tidak valid');
  if (!body.notes || String(body.notes).trim().length < 12) {
    throw createError(400, 'Catatan pengembalian minimal 12 karakter');
  }
  if (!Array.isArray(body.evidencePhotos) || body.evidencePhotos.length < 1) {
    throw createError(400, 'Minimal 1 foto bukti diperlukan');
  }

  const createdAt = new Date();
  const request = {
    id: `RTR-${String(orderId).replace(/\D/g, '').padStart(3, '0')}-${String(createdAt.getTime()).slice(-5)}`,
    status: 'REVIEWING',
    reasonId: reason.id,
    reasonLabel: reason.label,
    notes: String(body.notes).trim(),
    evidencePhotos: body.evidencePhotos.slice(0, 3),
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

  order.returnRequest = request;
  return request;
}

function updateOrderStatus(data, orderId, body) {
  const order = data.orders.find((item) => item.id === orderId);
  if (!order) throw createError(404, 'Pesanan tidak ditemukan');
  const nextStatus = body.nextStatus;
  const actor = body.actor;
  if (!canTransitionOrderStatus(order.status, nextStatus, actor)) {
    throw createError(403, 'Perubahan status tidak diizinkan untuk peran ini');
  }
  if (
    order.status === 'WAITING_PAYMENT' &&
    order.paymentData?.expiresAt &&
    new Date(order.paymentData.expiresAt).getTime() <= Date.now()
  ) {
    throw createError(409, 'Batas pembayaran pesanan sudah berakhir');
  }

  const nextStep = orderSteps.find((step) => step.id === nextStatus);
  const updatedAt = new Date();
  const passports = (order.passports ?? [order.passport]).filter(Boolean).map((passport) => ({
    ...passport,
    status: nextStatus === 'COMPLETED' ? 'ACTIVE' : 'PENDING',
    verification: nextStatus === 'COMPLETED' ? 'Passport aktif & terverifikasi' : 'Aktif setelah pesanan selesai',
    activatedAt: nextStatus === 'COMPLETED' ? updatedAt.toLocaleDateString('id-ID') : passport.activatedAt ?? null
  }));

  order.status = nextStatus;
  order.passport = passports[0];
  order.passports = passports;
  order.shipmentStatus =
    nextStatus === 'SHIPPED'
      ? 'Paket dalam perjalanan'
      : nextStatus === 'DELIVERED' || nextStatus === 'COMPLETED'
        ? 'Paket telah diterima'
        : order.shipmentStatus;
  order.statusHistory = [
    ...(order.statusHistory ?? []),
    {
      status: nextStatus,
      label: updatedAt.toLocaleDateString('id-ID'),
      note: nextStep?.desc ?? 'Status pesanan diperbarui',
      actor
    }
  ];

  return order;
}

async function createMidtransSnap(data, body) {
  const order = data.orders.find((item) => item.id === body.orderId);
  if (!order) throw createError(404, 'Pesanan tidak ditemukan');
  if (order.paymentData?.snapToken && order.paymentData?.redirectUrl) {
    return {
      orderId: order.id,
      token: order.paymentData.snapToken,
      redirectUrl: order.paymentData.redirectUrl,
      environment: order.paymentData.environment
    };
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw createError(503, 'MIDTRANS_SERVER_KEY belum dikonfigurasi di environment backend');
  }

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const baseUrl = isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';
  const grossAmount = order.rawPrice || Number(String(order.price).replace(/[^0-9]/g, ''));
  const payload = {
    transaction_details: {
      order_id: order.id,
      gross_amount: grossAmount
    },
    customer_details: {
      first_name: data.user.name,
      email: data.user.email,
      phone: data.user.phone
    },
    item_details: [
      {
        id: order.productId,
        price: grossAmount,
        quantity: 1,
        name: order.product
      }
    ]
  };

  const response = await fetch(`${baseUrl}/snap/v1/transactions`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const midtrans = await response.json();
  if (!response.ok) {
    throw createError(response.status, 'Gagal membuat transaksi Midtrans', midtrans);
  }

  order.paymentMethod = paymentMethods.find((item) => item.id === 'MIDTRANS_SNAP');
  order.paymentData = {
    ...order.paymentData,
    amount: order.price,
    midtransOrderId: order.id,
    snapToken: midtrans.token,
    redirectUrl: midtrans.redirect_url,
    environment: isProduction ? 'production' : 'sandbox',
    createdAt: new Date().toISOString()
  };
  data.paymentAttempts.push({
    orderId: order.id,
    provider: 'midtrans',
    status: 'SNAP_CREATED',
    createdAt: new Date().toISOString()
  });

  return {
    orderId: order.id,
    token: midtrans.token,
    redirectUrl: midtrans.redirect_url,
    environment: isProduction ? 'production' : 'sandbox'
  };
}

function handleMidtransWebhook(data, body) {
  const orderId = body.order_id;
  const order = data.orders.find((item) => item.id === orderId);
  if (!order) throw createError(404, 'Pesanan tidak ditemukan');

  const transactionStatus = body.transaction_status;
  const fraudStatus = body.fraud_status;
  const paid =
    transactionStatus === 'settlement' ||
    (transactionStatus === 'capture' && fraudStatus === 'accept');
  const failed = ['deny', 'cancel', 'expire', 'failure'].includes(transactionStatus);

  order.paymentData = {
    ...order.paymentData,
    midtransStatus: transactionStatus,
    fraudStatus,
    lastNotificationAt: new Date().toISOString(),
    rawNotification: body
  };

  if (paid && order.status === 'WAITING_PAYMENT') {
    updateOrderStatus(data, order.id, {
      nextStatus: 'PAYMENT_CONFIRMED',
      actor: 'payment_gateway'
    });
  }
  if (failed) {
    order.paymentData.failedAt = new Date().toISOString();
  }

  return {
    orderId: order.id,
    orderStatus: order.status,
    transactionStatus
  };
}

async function routeRequest(req, parsedUrl, body) {
  const method = req.method;
  const segments = parsedUrl.pathname.split('/').filter(Boolean).map(decode);

  if (segments[0] !== 'api') throw createError(404, 'Endpoint tidak ditemukan');

  if (method === 'GET' && segments[1] === 'health') {
    return {
      status: 'ok',
      service: 'circulai-backend',
      timestamp: new Date().toISOString()
    };
  }

  if (method === 'GET' && segments[1] === 'bootstrap') {
    return getPublicState(loadStore());
  }

  if (method === 'POST' && segments[1] === 'dev' && segments[2] === 'reset') {
    return getPublicState(resetStore());
  }

  if (method === 'GET' && segments[1] === 'products' && !segments[2]) {
    return filterProducts(loadStore(), parsedUrl.searchParams);
  }

  if (method === 'GET' && segments[1] === 'products' && segments[2]) {
    const product = getProduct(loadStore(), segments[2]);
    if (!product) throw createError(404, 'Produk tidak ditemukan');
    return product;
  }

  if (method === 'GET' && segments[1] === 'tailors' && !segments[2]) {
    return loadStore().tailors;
  }

  if (method === 'GET' && segments[1] === 'tailors' && segments[2]) {
    const tailor = loadStore().tailors.find((item) => String(item.id) === segments[2] || item.name === segments[2]);
    if (!tailor) throw createError(404, 'Tailor tidak ditemukan');
    return tailor;
  }

  if (segments[1] === 'profile') {
    if (method === 'GET') return loadStore().user;
    if (method === 'PATCH') {
      return updateStore((data) => {
        data.user = { ...data.user, ...body };
        return data.user;
      });
    }
  }

  if (segments[1] === 'measurements') {
    if (method === 'GET') return loadStore().measurements;
    if (method === 'PUT' || method === 'PATCH') {
      return updateStore((data) => {
        data.measurements = { ...data.measurements, ...body };
        return data.measurements;
      });
    }
  }

  if (segments[1] === 'preferences') {
    if (method === 'GET') return loadStore().preferences;
    if (method === 'PATCH') {
      return updateStore((data) => {
        data.preferences = {
          notifications: { ...data.preferences.notifications, ...(body.notifications ?? {}) },
          security: { ...data.preferences.security, ...(body.security ?? {}) },
          privacy: { ...data.preferences.privacy, ...(body.privacy ?? {}) }
        };
        return data.preferences;
      });
    }
  }

  if (segments[1] === 'style-profile') {
    if (method === 'GET') return loadStore().styleProfile;
    if (method === 'PUT') {
      return updateStore((data) => {
        data.styleProfile = body;
        return data.styleProfile;
      });
    }
    if (method === 'DELETE') {
      return updateStore((data) => {
        data.styleProfile = null;
        return { ok: true };
      });
    }
  }

  if (segments[1] === 'addresses') {
    if (method === 'GET' && !segments[2]) return loadStore().addresses;
    if (method === 'POST' && !segments[2]) {
      return updateStore((data) => {
        const address = {
          id: getNextNumericId(data.addresses, 'ADDR'),
          label: body.label?.trim() || 'Alamat Baru',
          receiver: body.receiver?.trim(),
          phone: body.phone?.trim(),
          detail: body.detail?.trim()
        };
        if (!address.receiver || !address.phone || !address.detail) {
          throw createError(400, 'Receiver, phone, dan detail alamat wajib diisi');
        }
        data.addresses.push(address);
        return address;
      });
    }
    if ((method === 'PATCH' || method === 'PUT') && segments[2]) {
      return updateStore((data) => {
        const address = data.addresses.find((item) => item.id === segments[2]);
        if (!address) throw createError(404, 'Alamat tidak ditemukan');
        Object.assign(address, body);
        return address;
      });
    }
    if (method === 'DELETE' && segments[2]) {
      return updateStore((data) => {
        data.addresses = data.addresses.filter((item) => item.id !== segments[2]);
        return { ok: true };
      });
    }
  }

  if (segments[1] === 'wishlist' && segments[2]) {
    const productId = Number(segments[2]);
    if (method === 'POST' || method === 'PUT') {
      return updateStore((data) => {
        if (!data.products.some((item) => item.id === productId)) throw createError(404, 'Produk tidak ditemukan');
        if (!data.wishlist.includes(productId)) data.wishlist.push(productId);
        return data.wishlist;
      });
    }
    if (method === 'DELETE') {
      return updateStore((data) => {
        data.wishlist = data.wishlist.filter((id) => id !== productId);
        return data.wishlist;
      });
    }
  }

  if (segments[1] === 'cart') {
    if (method === 'GET') {
      const data = loadStore();
      return { items: enrichCart(data), summary: calculateCartSummary(data.cart, data.products) };
    }
    if (method === 'DELETE') {
      return updateStore((data) => {
        data.cart = [];
        return { items: [], summary: calculateCartSummary(data.cart, data.products) };
      });
    }
    if (method === 'POST' && segments[2] === 'items') {
      return updateStore((data) => {
        const item = addCartItem(data, body);
        return { item, items: enrichCart(data), summary: calculateCartSummary(data.cart, data.products) };
      });
    }
    if ((method === 'PATCH' || method === 'PUT') && segments[2] === 'items' && segments[3]) {
      return updateStore((data) => {
        const item = data.cart.find((entry) => entry.cartItemId === segments[3]);
        if (!item) throw createError(404, 'Item keranjang tidak ditemukan');
        if (body.delta !== undefined) {
          item.quantity = Math.max(0, item.quantity + Number(body.delta));
        } else {
          item.quantity = Math.max(0, Number(body.quantity) || 0);
        }
        data.cart = data.cart.filter((entry) => entry.quantity > 0);
        return { items: enrichCart(data), summary: calculateCartSummary(data.cart, data.products) };
      });
    }
    if (method === 'DELETE' && segments[2] === 'items' && segments[3]) {
      return updateStore((data) => {
        data.cart = data.cart.filter((entry) => entry.cartItemId !== segments[3]);
        return { items: enrichCart(data), summary: calculateCartSummary(data.cart, data.products) };
      });
    }
  }

  if (segments[1] === 'orders') {
    if (method === 'GET' && !segments[2]) return loadStore().orders;
    if (method === 'POST' && !segments[2]) {
      return updateStore((data) => {
        const order = createOrderFromCart(data, {
          addressId: body.addressId,
          paymentMethodId: body.paymentMethodId
        });
        data.orders.unshift(order);
        data.cart = [];
        return order;
      });
    }
    if (method === 'GET' && segments[2] && !segments[3]) {
      const order = loadStore().orders.find((item) => item.id === segments[2]);
      if (!order) throw createError(404, 'Pesanan tidak ditemukan');
      return order;
    }
    if (method === 'PATCH' && segments[2] && segments[3] === 'status') {
      return updateStore((data) => updateOrderStatus(data, segments[2], body));
    }
    if (method === 'POST' && segments[2] && segments[3] === 'returns') {
      return updateStore((data) => createReturnRequest(data, segments[2], body));
    }
    if (method === 'GET' && segments[2] && segments[3] === 'passports') {
      const order = loadStore().orders.find((item) => item.id === segments[2]);
      if (!order) throw createError(404, 'Pesanan tidak ditemukan');
      return order.passports ?? [];
    }
  }

  if (method === 'GET' && segments[1] === 'returns') {
    return loadStore().orders
      .filter((order) => order.returnRequest)
      .map((order) => ({ orderId: order.id, product: order.product, request: order.returnRequest }));
  }

  if (method === 'GET' && segments[1] === 'passports' && segments[2]) {
    const orders = loadStore().orders;
    const passport = orders.flatMap((order) => order.passports ?? []).find((item) => item.id === segments[2]);
    if (!passport) throw createError(404, 'Passport tidak ditemukan');
    return passport;
  }

  if (segments[1] === 'conversations' && segments[2]) {
    const tailorName = segments[2];
    if (method === 'GET') return loadStore().conversations[tailorName] ?? [];
    if (method === 'POST' && segments[3] === 'messages') {
      return updateStore((data) => {
        const cleanText = String(body.text ?? '').trim();
        if (!cleanText) throw createError(400, 'Pesan tidak boleh kosong');
        const context = body.context ?? {};
        const outgoing = {
          id: `MSG-${Date.now()}-USER`,
          sender: 'user',
          text: cleanText,
          createdAt: new Date().toISOString(),
          context
        };
        const reply = {
          id: `MSG-${Date.now()}-TAILOR`,
          sender: 'tailor',
          text: createTailorReply(cleanText, context),
          createdAt: new Date(Date.now() + 700).toISOString(),
          context
        };
        data.conversations[tailorName] = [...(data.conversations[tailorName] ?? []), outgoing, reply];
        return data.conversations[tailorName];
      });
    }
  }

  if (segments[1] === 'payments' && segments[2] === 'midtrans') {
    if (method === 'POST' && segments[3] === 'snap') {
      return updateStore((data) => createMidtransSnap(data, body));
    }
    if (method === 'POST' && segments[3] === 'webhook') {
      return updateStore((data) => handleMidtransWebhook(data, body));
    }
  }

  throw createError(404, 'Endpoint tidak ditemukan');
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? await readJson(req) : {};
    const result = await routeRequest(req, parsedUrl, body);
    sendJson(res, 200, { data: result });
  } catch (error) {
    const status = error.status || 500;
    sendJson(res, status, {
      error: {
        message: error.message || 'Internal server error',
        details: error.details
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`CIRCULAI backend running on http://localhost:${PORT}`);
});
