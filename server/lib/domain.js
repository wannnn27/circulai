const orderSteps = [
  { id: 'WAITING_PAYMENT', label: 'Menunggu Pembayaran', desc: 'Selesaikan pembayaran sebelum batas waktu', estimate: 'Maks. 24 jam' },
  { id: 'PAYMENT_CONFIRMED', label: 'Pembayaran Dikonfirmasi', desc: 'Pembayaran diterima dan detail diteruskan ke tailor', estimate: '< 1 hari' },
  { id: 'IN_PRODUCTION', label: 'Sedang Diproduksi', desc: 'Tailor sedang memotong dan menjahit pakaianmu', estimate: '5-10 hari' },
  { id: 'QUALITY_CHECK', label: 'Quality Check', desc: 'Ukuran, jahitan, dan hasil akhir sedang diperiksa', estimate: '1-2 hari' },
  { id: 'SHIPPED', label: 'Dikirim', desc: 'Paket sedang dalam perjalanan ke alamatmu', estimate: '2-4 hari' },
  { id: 'DELIVERED', label: 'Sudah Diterima', desc: 'Paket telah sampai dan menunggu konfirmasi', estimate: 'Konfirmasi penerimaan' },
  { id: 'COMPLETED', label: 'Pesanan Selesai', desc: 'Pesanan selesai dan passport telah aktif', estimate: 'Selesai' }
];

const orderStatusTransitions = {
  WAITING_PAYMENT: ['PAYMENT_CONFIRMED'],
  PAYMENT_CONFIRMED: ['IN_PRODUCTION'],
  IN_PRODUCTION: ['QUALITY_CHECK'],
  QUALITY_CHECK: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: []
};

const orderStatusActors = {
  PAYMENT_CONFIRMED: ['payment_gateway'],
  IN_PRODUCTION: ['tailor'],
  QUALITY_CHECK: ['tailor'],
  SHIPPED: ['tailor', 'courier'],
  DELIVERED: ['courier'],
  COMPLETED: ['customer']
};

const paymentMethods = [
  { id: 'QRIS', label: 'QRIS', desc: 'Scan dengan aplikasi pembayaran apa pun', icon: 'maximize' },
  { id: 'GOPAY', label: 'GoPay', desc: 'Bayar langsung melalui GoPay', icon: 'smartphone' },
  { id: 'BANK_TRANSFER', label: 'Transfer Bank / Virtual Account', desc: 'BCA Virtual Account', icon: 'credit-card' },
  { id: 'MIDTRANS_SNAP', label: 'Midtrans', desc: 'Bayar via QRIS, e-wallet, kartu, atau VA Midtrans', icon: 'credit-card' }
];

const returnReasons = [
  { id: 'wrong_size', label: 'Ukuran tidak sesuai', desc: 'Fit terlalu besar/kecil dari ukuran pesanan.' },
  { id: 'wrong_item', label: 'Produk tidak sesuai', desc: 'Model, warna, atau detail berbeda dari pesanan.' },
  { id: 'defect', label: 'Ada cacat produksi', desc: 'Jahitan, noda, atau kerusakan saat diterima.' },
  { id: 'other', label: 'Alasan lain', desc: 'Jelaskan kondisi produk melalui catatan tambahan.' }
];

const returnStatusMeta = {
  REVIEWING: {
    label: 'Dalam Review',
    desc: 'Tim CIRCULAI sedang memverifikasi foto bukti dan alasan pengembalian.'
  },
  APPROVED: {
    label: 'Disetujui',
    desc: 'Pengembalian disetujui. Tim akan mengirim instruksi pengiriman balik.'
  },
  REJECTED: {
    label: 'Ditolak',
    desc: 'Pengajuan belum memenuhi syarat retur berdasarkan verifikasi.'
  }
};

function formatCurrency(value) {
  if (value === null || value === undefined) return 'Rp0';
  const digits = String(value).replace(/[^0-9]/g, '');
  if (!digits) return 'Rp0';
  return `Rp${parseInt(digits, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

function parseCurrency(value) {
  const digits = String(value ?? '').replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function formatOrderDate(value = new Date()) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(value);
}

function createPassportHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

function formatImpact(savedFabric) {
  const fabricAmount = parseFloat(savedFabric ?? '0');
  const safeAmount = Number.isNaN(fabricAmount) ? 0 : fabricAmount;
  return {
    savedFabric: `${safeAmount.toFixed(1)}m`,
    estimatedCo2: `${(safeAmount * 2.7).toFixed(1)} kg`,
    localMakerCount: 1
  };
}

function createProductPassport({
  orderId,
  product,
  unitIndex = 1,
  material,
  tailor,
  tailorCity,
  savedFabric,
  issuedAt,
  orderStatus
}) {
  const orderCode = String(orderId ?? 'ORD-000').replace(/\D/g, '').padStart(3, '0');
  const productCode = String(product?.id ?? createPassportHash(product?.name ?? 'PRODUCT').slice(0, 3)).padStart(3, '0');
  const unitCode = String(unitIndex).padStart(2, '0');
  const seedSource = [
    orderId,
    product?.id,
    product?.name,
    unitIndex,
    material,
    tailor,
    tailorCity,
    issuedAt
  ].join('|');
  const verificationCode = createPassportHash(seedSource);
  const active = orderStatus === 'COMPLETED';

  return {
    id: `CPP-${orderCode}-${productCode}-${unitCode}`,
    serialNumber: `CRL-${verificationCode.slice(0, 4)}-${verificationCode.slice(4)}`,
    verificationCode,
    qrSeed: parseInt(verificationCode, 16),
    status: active ? 'ACTIVE' : 'PENDING',
    verification: active ? 'Passport aktif & terverifikasi' : 'Aktif setelah pesanan selesai',
    productId: product?.id,
    productName: product?.name ?? 'Produk CIRCULAI',
    image: product?.image,
    materialOrigin: material ?? product?.material ?? 'Material lokal pilihan',
    tailor,
    productionLocation: tailorCity,
    impact: formatImpact(savedFabric ?? product?.savedFabric),
    issuedAt,
    activatedAt: active ? issuedAt : null
  };
}

function canTransitionOrderStatus(currentStatus, nextStatus, actor) {
  const validNextStatus = orderStatusTransitions[currentStatus]?.includes(nextStatus) ?? false;
  const validActor = orderStatusActors[nextStatus]?.includes(actor) ?? false;
  return validNextStatus && validActor;
}

function canRequestReturn(order) {
  if (!order || order.returnRequest) return false;
  return ['DELIVERED', 'COMPLETED'].includes(order.status);
}

function getNextNumericId(items, prefix) {
  const max = items.reduce((currentMax, item) => {
    const value = Number(String(item.id ?? '').replace(/\D/g, '')) || 0;
    return Math.max(currentMax, value);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

function getTailorByName(data, name) {
  return data.tailors.find((tailor) => tailor.name === name) ?? {
    name,
    city: 'Indonesia',
    specialty: 'Made-to-order fashion',
    rating: 4.8,
    sold: 0,
    experience: 'Berpengalaman',
    responseTime: '< 30 menit',
    verified: true,
    image: null
  };
}

function getProduct(data, productId) {
  return data.products.find((product) => String(product.id) === String(productId));
}

function calculateCartSummary(cart, products) {
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((entry) => String(entry.id) === String(item.productId));
    const unitPrice = item.unitPrice ?? product?.price ?? 0;
    return sum + unitPrice * item.quantity;
  }, 0);
  const shipping = cart.length > 0 ? 18000 : 0;
  const discount = subtotal >= 400000 ? 20000 : 0;
  return { subtotal, shipping, discount, total: subtotal + shipping - discount };
}

function enrichCart(data) {
  return data.cart.map((item) => ({
    ...item,
    product: getProduct(data, item.productId)
  }));
}

function createOrderFromCart(data, checkout) {
  if (!data.cart.length) {
    const error = new Error('Keranjang kosong');
    error.status = 400;
    throw error;
  }

  const address = data.addresses.find((item) => item.id === checkout.addressId);
  const paymentMethod = paymentMethods.find((item) => item.id === checkout.paymentMethodId);
  if (!address || !paymentMethod) {
    const error = new Error('Alamat atau metode pembayaran tidak valid');
    error.status = 400;
    throw error;
  }

  const orderId = getNextNumericId(data.orders, 'ORD');
  const suffix = String(orderId).replace(/\D/g, '').padStart(3, '0');
  const createdAt = new Date();
  const issuedAt = formatOrderDate(createdAt);
  const cartItems = enrichCart(data);
  const firstItem = cartItems[0];
  const firstProduct = firstItem.product;
  const tailorNames = [...new Set(cartItems.map((item) => item.product.tailor))];
  const tailorProfiles = tailorNames.map((name) => getTailorByName(data, name));
  const multipleTailors = tailorProfiles.length > 1;
  const materials = [...new Set(cartItems.map((item) => item.customization?.fabric?.label ?? item.product.material).filter(Boolean))];
  const savedFabricTotal = cartItems.reduce((sum, item) => {
    const amount = parseFloat(item.product.savedFabric ?? '0');
    return sum + (Number.isNaN(amount) ? 0 : amount * item.quantity);
  }, 0);
  const summary = calculateCartSummary(data.cart, data.products);
  let passportIndex = 0;
  const passports = cartItems.flatMap((item) =>
    Array.from({ length: item.quantity }, () => {
      passportIndex += 1;
      return createProductPassport({
        orderId,
        product: item.product,
        unitIndex: passportIndex,
        material: item.customization?.fabric?.label ?? item.product.material,
        tailor: item.product.tailor,
        tailorCity: item.product.tailorCity,
        savedFabric: item.product.savedFabric,
        issuedAt,
        orderStatus: 'WAITING_PAYMENT'
      });
    })
  );

  return {
    id: orderId,
    orderType: firstProduct.orderType ?? 'catalog',
    productId: firstProduct.id,
    product: cartItems.length > 1 ? `${firstProduct.name} + ${cartItems.length - 1} produk` : firstProduct.name,
    description: `${cartItems.reduce((sum, item) => sum + item.quantity, 0)} item made-to-order dari checkout CIRCULAI`,
    tailor: multipleTailors ? `${tailorProfiles.length} tailor lokal` : firstProduct.tailor,
    tailorCity: multipleTailors ? 'Beberapa lokasi produksi' : firstProduct.tailorCity,
    tailorProfile: tailorProfiles[0],
    tailorProfiles,
    price: formatCurrency(summary.total),
    rawPrice: summary.total,
    status: 'WAITING_PAYMENT',
    statusHistory: [
      {
        status: 'WAITING_PAYMENT',
        label: issuedAt,
        note: 'Pesanan dibuat dan menunggu pembayaran',
        actor: 'system'
      }
    ],
    eta: firstProduct.eta,
    placedAt: createdAt.toISOString(),
    placedAtLabel: issuedAt,
    image: firstProduct.image,
    badges: firstProduct.badges ?? [],
    savedFabric: `${savedFabricTotal.toFixed(1)}m`,
    material: materials.join(', '),
    size: firstItem.customization?.size ?? 'M',
    measurements: firstItem.customization?.measurements ?? null,
    notes: firstItem.customization?.notes?.trim() || 'Tidak ada catatan khusus',
    shippingAddress: `${address.receiver}, ${address.detail}`,
    address,
    paymentMethod,
    paymentData: {
      bankName: paymentMethod.id === 'BANK_TRANSFER' ? 'BCA Virtual Account' : paymentMethod.label,
      vaNumber: paymentMethod.id === 'BANK_TRANSFER' ? `8808${suffix}2026` : null,
      amount: formatCurrency(summary.total),
      expiresAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString()
    },
    courier: 'CIRCULAI Delivery',
    trackingCode: `CRL-${suffix}-ID`,
    shipmentStatus: 'Menunggu proses produksi',
    items: cartItems,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    passport: passports[0],
    passports
  };
}

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

module.exports = {
  orderSteps,
  orderStatusTransitions,
  orderStatusActors,
  paymentMethods,
  returnReasons,
  returnStatusMeta,
  formatCurrency,
  parseCurrency,
  formatOrderDate,
  createProductPassport,
  canTransitionOrderStatus,
  canRequestReturn,
  getNextNumericId,
  getTailorByName,
  getProduct,
  calculateCartSummary,
  enrichCart,
  createOrderFromCart,
  createTailorReply
};
