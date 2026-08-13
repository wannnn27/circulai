export const onboarding = [
  {
    icon: 'tshirt-crew-outline',
    title: 'Fashion That Fits You',
    desc: 'Temukan outfit yang cocok dengan warna, bentuk tubuh, dan gaya personalmu.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    tag: 'PERSONAL STYLE'
  },
  {
    icon: 'recycle',
    title: 'Made After You Order',
    desc: 'Produk dibuat setelah pesanan masuk untuk mengurangi stok mati dan limbah fashion.',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80',
    tag: 'ZERO WASTE'
  },
  {
    icon: 'account-group-outline',
    title: 'Support Local Tailors',
    desc: 'Setiap pesanan membantu UMKM fashion dan penjahit lokal berkembang.',
    image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1000&q=80',
    tag: 'LOCAL ARTISANS'
  }
];

export const tabs = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'explore', label: 'Explore', icon: 'search' },
  { id: 'quiz', label: 'AI Stylist', icon: 'zap' },
  { id: 'orders', label: 'Orders', icon: 'package' },
  { id: 'profile', label: 'Profile', icon: 'user' }
];

export const categories = ['Semua', 'Outer', 'Dress', 'Kemeja', 'Casual', 'Formal'];
export const sortOptions = ['Terbaru', 'Harga Terendah', 'Harga Tertinggi', 'Rating'];

export const products = [
  {
    id: 1,
    name: 'Luna Wrap Top',
    tailor: 'Rahayu Tailor',
    tailorCity: 'Sleman, Yogyakarta',
    price: 155000, // ongkos jahit blouse/atasan Yogyakarta 2025: Rp80.000–160.000 (sumber: devotelabels.id)
    badges: ['Made-to-Order', 'Kain Sisa'],
    category: 'Outer',
    eta: '5-7 hari',
    rating: 4.9,
    savedFabric: '0.8m',
    ecoScore: 78,
    material: 'Rayon lokal sisa produksi', // rayon lokal Rp35.000–50.000/m (ulastempat.com)
    color: '#D7B39A',
    image: 'https://images.tokopedia.net/img/cache/700/aphluv/1997/1/1/6d2ec2e1f3f544a8b4d71c61e34a1467~.jpeg.webp',
    description: 'Wrap top serbaguna dengan tali pinggang yang membentuk siluet tanpa terasa ketat.',
    measurements: ['Lingkar dada', 'Panjang top', 'Lingkar lengan'],
    recommendations: ['Office-to-dinner', 'Rectangle body', 'Warm earth palette']
  },
  {
    id: 2,
    name: 'Olive Linen Dress',
    tailor: 'Kartika Studio',
    tailorCity: 'Bandung',
    price: 175000, // ongkos jahit dress kasual Bandung 2026: Rp120.000–180.000 (benang rapi, batas atas kota besar)
    badges: ['Made-to-Order'],
    category: 'Dress',
    eta: '7-10 hari',
    rating: 4.8,
    savedFabric: '1.0m',
    ecoScore: 50,
    material: 'Linen blend deadstock', // linen lokal Rp40.000–100.000/m (ulastempat.com)
    color: '#7D8C55',
    image: 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/99/MTA-185118741/brd-74257_full01-473f6415.webp',
    description: 'Dress olive dengan potongan loose, cocok untuk daily wear dan acara semi formal.',
    measurements: ['Lingkar dada', 'Lingkar pinggang', 'Panjang dress'],
    recommendations: ['Minimalist', 'Medium olive skin', 'Daily wear']
  },
  {
    id: 3,
    name: 'Earth Tone Blouse',
    tailor: 'Sari Tailor',
    tailorCity: 'Solo',
    price: 120000, // ongkos jahit kemeja/blouse Solo (daerah kecil, batas bawah kisaran): Rp90.000–160.000
    badges: ['Kain Sisa', 'Local Tailor'],
    category: 'Kemeja',
    eta: '4-6 hari',
    rating: 4.7,
    savedFabric: '0.5m',
    ecoScore: 55,
    material: 'Katun poplin sisa atelier', // katun lokal terjangkau, kualitas medium
    color: '#C97B63',
    image: 'https://batiksolo.com/cdn/shop/files/UCH04391EDIT_427x.jpg?v=1733903172',
    description: 'Blouse earthy yang ringan dengan detail clean untuk dipadukan dengan celana high waist.',
    measurements: ['Lingkar dada', 'Lebar bahu', 'Panjang lengan'],
    recommendations: ['Clean casual', 'Smart casual', 'Office']
  },
  {
    id: 4,
    name: 'Casual Outer Wrap',
    tailor: 'Jogja Atelier',
    tailorCity: 'Yogyakarta',
    price: 210000, // outer/blazer panjang lebih kompleks dari dress: estimasi Rp200.000–250.000 (2025/2026)
    badges: ['Low Waste'],
    category: 'Outer',
    eta: '6-9 hari',
    rating: 4.8,
    savedFabric: '1.2m',
    ecoScore: 32,
    material: 'Tenun rayon mixed scraps', // tenun rayon premium, sisa pabrik lokal
    color: '#8E6F5A',
    image: 'https://ethica-collection.com/wp-content/uploads/2023/12/MASAMI-04-KHAKI-WP-1-4.webp',
    description: 'Outer wrap dengan garis panjang untuk layering yang nyaman dan memanjangkan siluet.',
    measurements: ['Panjang outer', 'Lebar bahu', 'Lingkar lengan'],
    recommendations: ['Traveling', 'Layering', 'Apple body']
  },
  {
    id: 5,
    name: 'Terracotta Midi Dress',
    tailor: 'Kartika Studio',
    tailorCity: 'Bandung',
    price: 195000, // midi dress semi-formal Bandung; lebih dari dress kasual karena detail flowy & ukuran
    badges: ['Made-to-Order', 'Kain Sisa'],
    category: 'Dress',
    eta: '7-10 hari',
    rating: 4.9,
    savedFabric: '1.1m',
    ecoScore: 81,
    material: 'Rayon flowy',
    color: '#B96E5B',
    image: 'https://images.tokopedia.net/img/cache/700/aphluv/1997/1/1/43427d1d8a6642af8db7bbc290ee71d3~.jpeg.webp',
    description: 'Midi dress terracotta dengan potongan flowy untuk special event yang tetap mindful.',
    measurements: ['Lingkar dada', 'Lingkar pinggang', 'Panjang midi'],
    recommendations: ['Special event', 'Feminine soft', 'Medium warm skin']
  },
  {
    id: 6,
    name: 'Natural Linen Shirt',
    tailor: 'Rahayu Tailor',
    tailorCity: 'Sleman, Yogyakarta',
    price: 135000, // kemeja linen Sleman (pinggiran Yogya, lebih terjangkau dari pusat kota): Rp90.000–150.000
    badges: ['Local Tailor'],
    category: 'Kemeja',
    eta: '5-7 hari',
    rating: 4.7,
    savedFabric: '0.6m',
    ecoScore: 26,
    material: 'Linen natural lokal', // linen natural lokal, sesuai tren slow fashion 2025
    color: '#E8DCC8',
    image: 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/16d546dcae0c4256abf37973bdb49277~tplv-aphluv4xwc-white-pad-v1:500:500.jpeg',
    description: 'Kemeja linen natural dengan detail minimal untuk capsule wardrobe.',
    measurements: ['Lingkar dada', 'Panjang kemeja', 'Lebar bahu'],
    recommendations: ['Minimalist', 'Smart casual', 'Formal']
  }
];

export const tailors = [
  {
    id: 1,
    name: 'Rahayu Tailor',
    city: 'Sleman, Yogyakarta',
    specialty: 'Blouse, Outer, Casual Wear',
    rating: 4.9,
    sold: 284,
    experience: '9 tahun',
    responseTime: '< 15 menit',
    verified: true,
    // catatan: penjahit di Sleman (pinggiran) umumnya lebih terjangkau dari pusat kota (devotelabels.id 2025)
    image: 'https://images.unsplash.com/photo-1673201229733-69d19c5c4a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
  },
  {
    id: 2,
    name: 'Kartika Studio',
    city: 'Bandung',
    specialty: 'Dress, Kebaya Modern',
    rating: 4.8,
    sold: 196,
    experience: '7 tahun',
    responseTime: '< 20 menit',
    verified: true,
    // catatan: Bandung adalah sentra konveksi & fashion lokal yang sedang bertransformasi (industri-fashion-indonesia-2025)
    image: 'https://images.unsplash.com/photo-1457972657980-4c9fddebec8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
  },
  {
    id: 3,
    name: 'Sari Tailor',
    city: 'Solo',
    specialty: 'Batik Modern, Casual',
    rating: 4.7,
    sold: 312,
    experience: '11 tahun',
    responseTime: '< 10 menit',
    verified: true,
    // catatan: Solo adalah pusat produksi fashion lokal; tren "wajah penjahit pada label" (Kubik Society, Kompas 2026)
    image: 'https://images.unsplash.com/photo-1578353022142-09264fd64295?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
  },
  {
    id: 4,
    name: 'Jogja Atelier',
    city: 'Yogyakarta',
    specialty: 'Outer, Tenun, Layering',
    rating: 4.8,
    sold: 228,
    experience: '8 tahun',
    responseTime: '< 20 menit',
    verified: true,
    // catatan: Yogyakarta dikenal sebagai kota sustainable & handmade fashion (projectplanetid.com, tatlerasia.com)
    image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
  }
];

export const orderSteps = [
  { id: 'WAITING_PAYMENT', label: 'Menunggu Pembayaran', desc: 'Selesaikan pembayaran sebelum batas waktu', estimate: 'Maks. 24 jam' },
  { id: 'PAYMENT_CONFIRMED', label: 'Pembayaran Dikonfirmasi', desc: 'Pembayaran diterima dan detail diteruskan ke tailor', estimate: '< 1 hari' },
  { id: 'IN_PRODUCTION', label: 'Sedang Diproduksi', desc: 'Tailor sedang memotong dan menjahit pakaianmu', estimate: '5-10 hari' },
  { id: 'QUALITY_CHECK', label: 'Quality Check', desc: 'Ukuran, jahitan, dan hasil akhir sedang diperiksa', estimate: '1-2 hari' },
  { id: 'SHIPPED', label: 'Dikirim', desc: 'Paket sedang dalam perjalanan ke alamatmu', estimate: '2-4 hari' },
  { id: 'DELIVERED', label: 'Sudah Diterima', desc: 'Paket telah sampai dan menunggu konfirmasi', estimate: 'Konfirmasi penerimaan' },
  { id: 'COMPLETED', label: 'Pesanan Selesai', desc: 'Pesanan selesai dan passport telah aktif', estimate: 'Selesai' }
];

export const customizationColors = [
  { id: 'olive', label: 'Olive Earth', hex: '#7D8C55', recommended: true },
  { id: 'terracotta', label: 'Terracotta', hex: '#C97B63', recommended: true },
  { id: 'sand', label: 'Natural Sand', hex: '#E8DCC8', recommended: false },
  { id: 'forest', label: 'Forest Green', hex: '#3DA829', recommended: true },
  { id: 'charcoal', label: 'Charcoal', hex: '#3A3D38', recommended: false }
];

export const customizationFabrics = [
  { id: 'rayon', label: 'Rayon Atelier Sisa', desc: 'Adem, ringan, dan flowy', extraCost: 0 },
  { id: 'linen', label: 'Linen Deadstock', desc: 'Tekstur premium dan tahan lama', extraCost: 35000 },
  { id: 'tenun', label: 'Tenun Rayon Scraps', desc: 'Motif unik dari serat sisa', extraCost: 50000 }
];

export const savedAddresses = [
  {
    id: 'ADDR-001',
    label: 'Rumah',
    receiver: 'Adi Arwan Syah',
    phone: '0812 3456 7890',
    detail: 'Jl. Kaliurang KM 7, Sleman, Yogyakarta 55581'
  },
  {
    id: 'ADDR-002',
    label: 'Kantor',
    receiver: 'Adi Arwan Syah',
    phone: '0812 3456 7890',
    detail: 'Jl. Gejayan No. 18, Depok, Sleman, Yogyakarta 55281'
  }
];

export const paymentMethods = [
  { id: 'MIDTRANS_SNAP', label: 'Midtrans Checkout', desc: 'QRIS, e-wallet, kartu, dan virtual account', icon: 'credit-card' },
  { id: 'QRIS', label: 'QRIS', desc: 'Scan dengan aplikasi pembayaran apa pun', icon: 'maximize' },
  { id: 'GOPAY', label: 'GoPay', desc: 'Bayar langsung melalui GoPay', icon: 'smartphone' },
  { id: 'BANK_TRANSFER', label: 'Transfer Bank / Virtual Account', desc: 'BCA Virtual Account', icon: 'credit-card' }
];

export const orderStatusTransitions = {
  WAITING_PAYMENT: ['PAYMENT_CONFIRMED'],
  PAYMENT_CONFIRMED: ['IN_PRODUCTION'],
  IN_PRODUCTION: ['QUALITY_CHECK'],
  QUALITY_CHECK: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: []
};

export const orderStatusActors = {
  PAYMENT_CONFIRMED: ['payment_gateway'],
  IN_PRODUCTION: ['tailor'],
  QUALITY_CHECK: ['tailor'],
  SHIPPED: ['tailor', 'courier'],
  DELIVERED: ['courier'],
  COMPLETED: ['customer']
};

export const returnReasons = [
  {
    id: 'wrong_size',
    label: 'Ukuran tidak sesuai',
    desc: 'Fit terlalu besar/kecil dari ukuran pesanan.'
  },
  {
    id: 'wrong_item',
    label: 'Produk tidak sesuai',
    desc: 'Model, warna, atau detail berbeda dari pesanan.'
  },
  {
    id: 'defect',
    label: 'Ada cacat produksi',
    desc: 'Jahitan, noda, atau kerusakan saat diterima.'
  },
  {
    id: 'other',
    label: 'Alasan lain',
    desc: 'Jelaskan kondisi produk melalui catatan tambahan.'
  }
];

export const returnStatusMeta = {
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

export const initialOrders = [
  {
    id: 'ORD-001',
    productId: 1,
    product: 'Luna Wrap Top',
    tailor: 'Rahayu Tailor',
    tailorCity: 'Sleman, Yogyakarta',
    price: 'Rp189.000',
    status: 'IN_PRODUCTION',
    eta: '7 Juni 2026',
    image: products[0].image,
    badges: ['Made-to-Order', 'Kain Sisa'],
    savedFabric: '0.8m'
  },
  {
    id: 'ORD-002',
    productId: 2,
    product: 'Olive Linen Dress',
    tailor: 'Kartika Studio',
    tailorCity: 'Bandung',
    price: 'Rp245.000',
    status: 'DELIVERED',
    eta: 'Sudah diterima',
    image: products[1].image,
    badges: ['Made-to-Order'],
    savedFabric: '1.0m'
  }
];

export const skinTones = [
  { id: 'fair-cool', label: 'Fair Cool', hex: '#F5E6D8', sub: 'Cerah, kemerahan, undertone dingin' },
  { id: 'fair-warm', label: 'Fair Warm', hex: '#F0D5A8', sub: 'Cerah, undertone kekuningan' },
  { id: 'medium-olive', label: 'Medium Olive', hex: '#C8A882', sub: 'Medium, undertone olive/hijau' },
  { id: 'medium-warm', label: 'Medium Warm', hex: '#C08060', sub: 'Medium, undertone cokelat hangat' },
  { id: 'deep-warm', label: 'Deep Warm', hex: '#8B5A3A', sub: 'Gelap, undertone cokelat kaya' },
  { id: 'deep-cool', label: 'Deep Cool', hex: '#6B3D2E', sub: 'Gelap, undertone keunguan' }
];

export const bodyShapes = [
  { id: 'rectangle', label: 'Rectangle', desc: 'Bahu, pinggang & pinggul sejajar', icon: 'square' },
  { id: 'hourglass', label: 'Hourglass', desc: 'Pinggang jauh lebih kecil', icon: 'aperture' },
  { id: 'pear', label: 'Pear', desc: 'Pinggul lebih lebar dari bahu', icon: 'triangle' },
  { id: 'apple', label: 'Apple', desc: 'Perut & dada lebih menonjol', icon: 'circle' },
  { id: 'inverted', label: 'Inverted Triangle', desc: 'Bahu lebih lebar dari pinggul', icon: 'triangle' }
];

export const styleVibes = [
  { id: 'clean-casual', label: 'Clean Casual', desc: 'Simpel & wearable setiap hari' },
  { id: 'smart-casual', label: 'Smart Casual', desc: 'Rapi tanpa terasa formal' },
  { id: 'boho-natural', label: 'Boho Natural', desc: 'Etnik, bebas, material alami' },
  { id: 'minimalist', label: 'Minimalist', desc: 'Clean lines, palette netral' },
  { id: 'feminine', label: 'Feminine Soft', desc: 'Flowy, lembut, detail halus' },
  { id: 'streetwear', label: 'Urban Street', desc: 'Kasual bold, layering' }
];

export const occasions = [
  { id: 'daily', label: 'Daily Wear' },
  { id: 'office', label: 'Kerja / Kuliah' },
  { id: 'event', label: 'Special Event' },
  { id: 'hangout', label: 'Casual Hangout' },
  { id: 'travel', label: 'Traveling' }
];

export const heights = ['Di bawah 155 cm', '155 - 160 cm', '161 - 165 cm', '166 - 170 cm', 'Di atas 170 cm'];

export const profileGroups = [
  {
    title: 'Style',
    items: [
      { icon: 'zap', label: 'My Circular Style', desc: 'Profil gaya personalmu', badge: 'Warm Earth' },
      { icon: 'heart', label: 'Wishlist', desc: 'Produk yang kamu simpan', badge: '4' },
      { icon: 'maximize-2', label: 'Ukuran Tersimpan', desc: 'Data ukuran untuk custom order' },
      { icon: 'refresh-cw', label: 'Circular Exchange', desc: 'Tukar barang bekas jadi poin' }
    ]
  },
  {
    title: 'Akun',
    items: [
      { icon: 'map-pin', label: 'Alamat', desc: 'Kelola alamat pengiriman' },
      { icon: 'award', label: 'Membership', desc: 'CIRCULAI Member', badge: 'Green' },
      { icon: 'bell', label: 'Notifikasi', desc: 'Pengaturan notifikasi' },
      { icon: 'shield', label: 'Keamanan', desc: 'Password & privasi' }
    ]
  },
  {
    title: 'Tentang',
    items: [
      { icon: 'help-circle', label: 'Bantuan', desc: 'FAQ dan dukungan' },
      { icon: 'file-text', label: 'Kebijakan Privasi', desc: '' }
    ]
  }
];

// ─── Circular Exchange Data ───────────────────────────────────────────────────

export const exchangeItemTypes = [
  {
    id: 'kain_perca',
    label: 'Kain Perca',
    desc: 'Sisa kain dari penjahit atau produksi',
    icon: 'scissors-cutting',
    unit: 'kg',
    pointsPerUnit: 120,
    minUnit: 0.2,
    color: '#7D8C55',
    acceptedConditions: ['Bersih', 'Kering', 'Berbagai jenis kain']
  },
  {
    id: 'baju_bekas',
    label: 'Baju Bekas',
    desc: 'Pakaian layak pakai yang tidak terpakai',
    icon: 'tshirt-crew-outline',
    unit: 'pcs',
    pointsPerUnit: 80,
    minUnit: 1,
    color: '#C97B63',
    acceptedConditions: ['Kondisi baik', 'Tidak sobek besar', 'Sudah dicuci']
  },
  {
    id: 'denim',
    label: 'Denim & Jeans',
    desc: 'Celana jeans atau jaket denim bekas',
    icon: 'layers-outline',
    unit: 'pcs',
    pointsPerUnit: 150,
    minUnit: 1,
    color: '#31485B',
    acceptedConditions: ['Bersih', 'Minimal kerusakan', 'Jahitan utuh']
  },
  {
    id: 'outer_jaket',
    label: 'Outer & Jaket',
    desc: 'Outer, blazer, atau jaket bekas',
    icon: 'hanger',
    unit: 'pcs',
    pointsPerUnit: 200,
    minUnit: 1,
    color: '#8E6F5A',
    acceptedConditions: ['Kondisi dapat dipakai', 'Resleting berfungsi']
  },
  {
    id: 'kain_tenun',
    label: 'Kain Tenun & Batik',
    desc: 'Kain tenun tradisional atau batik',
    icon: 'palette-outline',
    unit: 'meter',
    pointsPerUnit: 180,
    minUnit: 0.5,
    color: '#C97B63',
    acceptedConditions: ['Motif masih jelas', 'Tidak sobek parah', 'Bersih']
  },
  {
    id: 'aksesoris',
    label: 'Aksesoris Fashion',
    desc: 'Tas, ikat pinggang, syal, atau aksesori kain',
    icon: 'bag-personal-outline',
    unit: 'pcs',
    pointsPerUnit: 60,
    minUnit: 1,
    color: '#D99A3D',
    acceptedConditions: ['Kondisi layak pakai', 'Bersih']
  }
];

export const pointRedemptionOptions = [
  {
    id: 'disc_10k',
    label: 'Diskon Rp10.000',
    desc: 'Potongan langsung untuk pembelian berikutnya',
    pointCost: 100,
    value: 10000,
    type: 'discount',
    icon: 'tag-outline',
    minPurchase: 100000,
    validDays: 30
  },
  {
    id: 'disc_25k',
    label: 'Diskon Rp25.000',
    desc: 'Potongan untuk pembelian min. Rp200.000',
    pointCost: 250,
    value: 25000,
    type: 'discount',
    icon: 'tag-multiple-outline',
    minPurchase: 200000,
    validDays: 30
  },
  {
    id: 'disc_50k',
    label: 'Diskon Rp50.000',
    desc: 'Potongan untuk pembelian min. Rp350.000',
    pointCost: 500,
    value: 50000,
    type: 'discount',
    icon: 'sale',
    minPurchase: 350000,
    validDays: 30
  },
  {
    id: 'free_ongkir',
    label: 'Gratis Ongkos Kirim',
    desc: 'Gratis ongkir untuk 1x pembelian',
    pointCost: 150,
    value: 18000,
    type: 'shipping',
    icon: 'truck-outline',
    minPurchase: 0,
    validDays: 14
  },
  {
    id: 'disc_100k',
    label: 'Diskon Rp100.000',
    desc: 'Potongan besar untuk pembelian min. Rp500.000',
    pointCost: 1000,
    value: 100000,
    type: 'discount',
    icon: 'crown-outline',
    minPurchase: 500000,
    validDays: 60
  }
];

export const donationPartners = [
  {
    id: 'rumah_jahit',
    name: 'Rumah Jahit Sosial',
    location: 'Yogyakarta',
    desc: 'Program pelatihan menjahit untuk ibu rumah tangga kurang mampu',
    icon: 'home-heart',
    beneficiaries: '124 penerima manfaat',
    color: '#3DA829'
  },
  {
    id: 'desa_binaan',
    name: 'Desa Binaan CIRCULAI',
    location: 'Klaten, Jawa Tengah',
    desc: 'Pemberdayaan pengrajin tenun tradisional di pedesaan',
    icon: 'account-group-outline',
    beneficiaries: '38 pengrajin',
    color: '#7D8C55'
  },
  {
    id: 'komunitas_peduli',
    name: 'Komunitas Peduli Lingkungan',
    location: 'Bandung',
    desc: 'Daur ulang kain bekas menjadi produk bernilai jual',
    icon: 'recycle',
    beneficiaries: '67 anggota komunitas',
    color: '#31485B'
  },
  {
    id: 'pondok_pesantren',
    name: 'Pondok Pesantren Al-Barokah',
    location: 'Solo, Jawa Tengah',
    desc: 'Program keterampilan menjahit untuk santri',
    icon: 'school-outline',
    beneficiaries: '215 santri',
    color: '#C97B63'
  }
];

export const exchangePointTiers = [
  { name: 'Seed', minPoints: 0, maxPoints: 199, color: '#A8A89F', icon: 'seed-outline' },
  { name: 'Green', minPoints: 200, maxPoints: 499, color: '#4F8A5B', icon: 'leaf' },
  { name: 'Emerald', minPoints: 500, maxPoints: 999, color: '#3DA829', icon: 'diamond-stone' },
  { name: 'Circular', minPoints: 1000, maxPoints: Infinity, color: '#C97B63', icon: 'recycle' }
];

export function getPointTier(points) {
  return exchangePointTiers.find((tier) => points >= tier.minPoints && points <= tier.maxPoints)
    ?? exchangePointTiers[0];
}

export function calcExchangePoints(itemTypeId, quantity) {
  const type = exchangeItemTypes.find((t) => t.id === itemTypeId);
  if (!type || quantity < type.minUnit) return 0;
  return Math.floor(type.pointsPerUnit * quantity);
}

// ─── Utility Functions ────────────────────────────────────────────────────────

export function computeEcoScore(product) {
  if (typeof product?.ecoScore === 'number') return product.ecoScore;
  if (typeof product?.eco_score === 'number') return product.eco_score;
  const badges = product?.badges ?? [];
  const hasScraps = badges.includes('Kain Sisa');
  const hasMto = badges.includes('Made-to-Order');
  const fabricNum = parseFloat(String(product?.savedFabric ?? '0').replace(/[^0-9.]/g, '')) || 0;
  const fabricPoints = Math.min(30, Math.floor(fabricNum / 0.1));
  const score = 20 + (hasScraps ? 30 : 0) + (hasMto ? 20 : 0) + fabricPoints;
  return Math.min(100, Math.max(0, score));
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return 'Rp0';
  let numStr = String(value).replace(/[^0-9]/g, '');
  if (!numStr) return 'Rp0';
  const num = parseInt(numStr, 10);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp${formatted}`;
}

export function orderStatusIndex(status) {
  return Math.max(0, orderSteps.findIndex((step) => step.id === status));
}

export function getTailorByName(name) {
  return tailors.find((tailor) => tailor.name === name) ?? {
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

export function createProductPassport({
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

export function createOrderFromProduct(product, count, checkout = {}) {
  const suffix = String(count + 1).padStart(3, '0');
  const orderId = `ORD-${suffix}`;
  const tailorProfile = getTailorByName(product.tailor);
  const createdAt = new Date();
  const orderType = product.orderType ?? (product.design ? 'custom' : 'catalog');
  const customization = product.customization ?? {};
  const total = checkout.total ?? product.price;
  const address = checkout.address ?? savedAddresses[0];
  const paymentMethod = checkout.paymentMethod ?? paymentMethods[0];
  const paymentExpiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const issuedAt = formatOrderDate(createdAt);
  const passport = createProductPassport({
    orderId,
    product,
    material: customization.fabric?.label ?? product.material ?? 'Material lokal pilihan',
    tailor: product.tailor,
    tailorCity: product.tailorCity,
    savedFabric: product.savedFabric,
    issuedAt,
    orderStatus: 'WAITING_PAYMENT'
  });

  return {
    id: orderId,
    orderType,
    productId: product.id,
    product: product.name,
    description: product.description,
    tailor: product.tailor,
    tailorCity: product.tailorCity,
    tailorProfile,
    price: formatCurrency(total),
    rawPrice: total,
    status: 'WAITING_PAYMENT',
    statusHistory: [
      {
        status: 'WAITING_PAYMENT',
        label: formatOrderDate(createdAt),
        note: 'Pesanan dibuat dan menunggu pembayaran',
        actor: 'system'
      }
    ],
    eta: product.eta,
    placedAt: createdAt.toISOString(),
    placedAtLabel: formatOrderDate(createdAt),
    image: product.image,
    badges: product.badges ?? [],
    savedFabric: product.savedFabric,
    material: customization.fabric?.label ?? product.material ?? 'Material lokal pilihan',
    color: customization.color?.label ?? product.color,
    size: customization.sizeType === 'custom' ? 'Custom measurements' : customization.size ?? product.size ?? 'M',
    measurements: customization.measurements ?? null,
    notes: product.notes?.trim() || 'Tidak ada catatan khusus',
    design: product.design ?? null,
    shippingAddress: `${address.receiver}, ${address.detail}`,
    address,
    paymentMethod,
    paymentData: {
      bankName: paymentMethod.id === 'BANK_TRANSFER' ? 'BCA Virtual Account' : paymentMethod.label,
      vaNumber: paymentMethod.id === 'BANK_TRANSFER' ? `8808${suffix}2026` : null,
      amount: formatCurrency(total),
      expiresAt: paymentExpiresAt
    },
    courier: 'CIRCULAI Delivery',
    trackingCode: `CRL-${suffix}-ID`,
    shipmentStatus: 'Menunggu proses produksi',
    passport,
    passports: [passport]
  };
}

export function createOrderFromCart(items, count, checkout) {
  const firstItem = items[0];
  const tailorNames = [...new Set(items.map((item) => item.product.tailor))];
  const tailorProfiles = tailorNames.map(getTailorByName);
  const multipleTailors = tailorProfiles.length > 1;
  const materials = [...new Set(items.map((item) => item.customization?.fabric?.label ?? item.product.material).filter(Boolean))];
  const savedFabricTotal = items.reduce((sum, item) => {
    const amount = parseFloat(item.product.savedFabric ?? '0');
    return sum + (Number.isNaN(amount) ? 0 : amount * item.quantity);
  }, 0);
  const product = {
    ...firstItem.product,
    customization: firstItem.customization,
    size: firstItem.customization?.size,
    notes: firstItem.customization?.notes ?? firstItem.product.notes,
    orderType: firstItem.product.orderType ?? 'catalog'
  };
  const order = createOrderFromProduct(product, count, checkout);
  let passportIndex = 0;
  const passports = items.flatMap((item) =>
    Array.from({ length: item.quantity }, () => {
      passportIndex += 1;
      return createProductPassport({
        orderId: order.id,
        product: item.product,
        unitIndex: passportIndex,
        material: item.customization?.fabric?.label ?? item.product.material,
        tailor: item.product.tailor,
        tailorCity: item.product.tailorCity,
        savedFabric: item.product.savedFabric,
        issuedAt: order.passport.issuedAt,
        orderStatus: order.status
      });
    })
  );

  return {
    ...order,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    tailor: multipleTailors ? `${tailorProfiles.length} tailor lokal` : order.tailor,
    tailorCity: multipleTailors ? 'Beberapa lokasi produksi' : order.tailorCity,
    tailorProfiles,
    material: materials.join(', '),
    savedFabric: `${savedFabricTotal.toFixed(1)}m`,
    product: items.length > 1 ? `${firstItem.product.name} + ${items.length - 1} produk` : firstItem.product.name,
    description: `${items.reduce((sum, item) => sum + item.quantity, 0)} item made-to-order dari checkout CIRCULAI`,
    passport: passports[0],
    passports
  };
}

export function normalizeOrder(order) {
  const sourceProduct = products.find((product) => product.id === order.productId);
  const fallback = sourceProduct ?? {};
  const suffix = String(order.id ?? 'ORD-000').replace(/\D/g, '').padStart(3, '0');
  const tailorProfile = getTailorByName(order.tailor ?? fallback.tailor);
  const material = order.material ?? fallback.material ?? 'Material lokal pilihan';

  const legacyStatusMap = {
    received: 'WAITING_PAYMENT',
    confirmed: 'PAYMENT_CONFIRMED',
    material: 'IN_PRODUCTION',
    sewing: 'IN_PRODUCTION',
    qc: 'QUALITY_CHECK',
    shipped: 'SHIPPED'
  };
  const normalizedStatus = legacyStatusMap[order.status] ?? order.status ?? 'WAITING_PAYMENT';
  const generatedPassport = createProductPassport({
    orderId: order.id,
    product: {
      id: order.productId ?? fallback.id,
      name: order.product ?? fallback.name,
      image: order.image ?? fallback.image,
      material,
      savedFabric: order.savedFabric ?? fallback.savedFabric
    },
    material,
    tailor: order.tailor ?? fallback.tailor,
    tailorCity: order.tailorCity ?? fallback.tailorCity,
    savedFabric: order.savedFabric ?? fallback.savedFabric,
    issuedAt: order.passport?.issuedAt ?? '4 Juni 2026',
    orderStatus: normalizedStatus
  });
  const passports = order.passports?.length
    ? order.passports.map((passport) => ({
        ...passport,
        status: normalizedStatus === 'COMPLETED' ? 'ACTIVE' : passport.status ?? 'PENDING'
      }))
    : [{ ...generatedPassport, ...(order.passport ?? {}) }];

  return {
    orderType: 'catalog',
    description: fallback.description,
    rawPrice: fallback.price,
    placedAt: '2026-06-04T08:00:00.000Z',
    placedAtLabel: '4 Juni 2026',
    material,
    size: 'M',
    notes: 'Tidak ada catatan khusus',
    design: null,
    shippingAddress: 'Adi Arwan Syah, Sleman, Yogyakarta',
    courier: 'CIRCULAI Delivery',
    trackingCode: `CRL-${suffix}-ID`,
    status: normalizedStatus,
    statusHistory: order.statusHistory ?? [
      { status: normalizedStatus, label: '4 Juni 2026', note: 'Status terakhir pesanan', actor: 'system' }
    ],
    shipmentStatus: normalizedStatus === 'SHIPPED' ? 'Paket dalam perjalanan' : 'Menunggu pengiriman',
    ...order,
    status: normalizedStatus,
    tailorProfile: order.tailorProfile ?? tailorProfile,
    passport: passports[0],
    passports
  };
}

export function getOrderTimeline(order) {
  const currentIndex = orderStatusIndex(order.status);

  return orderSteps.map((step, index) => ({
    ...step,
    state: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming'
  }));
}

export function canTransitionOrderStatus(currentStatus, nextStatus, actor) {
  const validNextStatus = orderStatusTransitions[currentStatus]?.includes(nextStatus) ?? false;
  const validActor = orderStatusActors[nextStatus]?.includes(actor) ?? false;
  return validNextStatus && validActor;
}

export function canRequestReturn(order) {
  if (!order || order.returnRequest) return false;
  return ['DELIVERED', 'COMPLETED'].includes(order.status);
}

export function getStyleAnalysis(answers) {
  const palettes = {
    'fair-cool': [
      { name: 'Dusty Rose', hex: '#C4938B' },
      { name: 'Lavender', hex: '#B8A9C9' },
      { name: 'Powder Blue', hex: '#9DB4C0' },
      { name: 'Soft Ivory', hex: '#F5EFE6' },
      { name: 'Slate Gray', hex: '#8C9BAB' }
    ],
    'fair-warm': [
      { name: 'Warm Peach', hex: '#E8B89A' },
      { name: 'Cream', hex: '#F2E0C0' },
      { name: 'Soft Coral', hex: '#D9856A' },
      { name: 'Warm Nude', hex: '#D4A882' },
      { name: 'Butter Yellow', hex: '#EDD98A' }
    ],
    'medium-olive': [
      { name: 'Olive Green', hex: '#7D8C55' },
      { name: 'Terracotta', hex: '#C97B63' },
      { name: 'Warm Camel', hex: '#C4965A' },
      { name: 'Cream', hex: '#F2E0C0' },
      { name: 'Mustard', hex: '#D4A628' }
    ],
    'medium-warm': [
      { name: 'Terracotta', hex: '#C97B63' },
      { name: 'Warm Brown', hex: '#9B6B45' },
      { name: 'Rust', hex: '#B85C38' },
      { name: 'Burnt Orange', hex: '#CC7722' },
      { name: 'Camel', hex: '#C19A6B' }
    ],
    'deep-warm': [
      { name: 'Burnt Orange', hex: '#CC7722' },
      { name: 'Forest Green', hex: '#2F4F3A' },
      { name: 'Deep Plum', hex: '#5C3D5E' },
      { name: 'Gold', hex: '#D4A017' },
      { name: 'Chocolate', hex: '#5C3317' }
    ],
    'deep-cool': [
      { name: 'Deep Burgundy', hex: '#6E1423' },
      { name: 'Midnight Blue', hex: '#1C2B4A' },
      { name: 'Forest Green', hex: '#2F4F3A' },
      { name: 'Charcoal', hex: '#3A3A3A' },
      { name: 'Dusty Mauve', hex: '#8B6B6B' }
    ]
  };

  const cuttings = {
    rectangle: {
      good: ['Wrap Top', 'Peplum', 'A-line Skirt', 'Belted Outer', 'Ruffle Detail'],
      avoid: ['Boxy Straight Cut', 'Tube Dress tanpa detail']
    },
    hourglass: {
      good: ['Fitted Dress', 'High Waist', 'Wrap Dress', 'Pencil Skirt', 'Bodycon'],
      avoid: ['Boxy Oversized', 'Drop Waist']
    },
    pear: {
      good: ['A-line', 'Wrap Top', 'Off-shoulder', 'Flared Sleeve', 'Dark Bottom'],
      avoid: ['Skinny Bottom dengan volume atas kecil', 'Skin-tight trousers']
    },
    apple: {
      good: ['Empire Waist', 'V-neck', 'Maxi Dress Flowing', 'Longline Outer', 'Straight Leg'],
      avoid: ['Tight Turtleneck', 'Heavy Print di area tengah']
    },
    inverted: {
      good: ['Wide Leg Pants', 'Maxi Skirt', 'A-line', 'Volume di bawah', 'Simple Top'],
      avoid: ['Shoulder Pad berlebihan', 'Oversized Upper']
    }
  };

  const fabricMap = {
    'clean-casual': ['Cotton', 'Rayon', 'Jersey ringan'],
    'smart-casual': ['Linen', 'Tencel', 'Cotton compact'],
    'boho-natural': ['Linen', 'Muslin', 'Batik katun', 'Woven'],
    minimalist: ['Tencel', 'Silk-like viscose', 'Cotton poplin'],
    feminine: ['Chiffon', 'Rayon flowy', 'Cotton voile'],
    streetwear: ['Denim', 'Cotton ribbed', 'Jersey']
  };

  const archetypes = {
    'clean-casual+rectangle': { name: 'The Effortless Editor', tagline: 'Simpel, structured, dan selalu tepat' },
    'minimalist+hourglass': { name: 'The Quiet Luxe', tagline: 'Elegan tanpa berusaha keras' },
    'boho-natural+pear': { name: 'The Free Spirit', tagline: 'Alami, mengalir, penuh karakter' },
    'feminine+hourglass': { name: 'The Romantic Muse', tagline: 'Lembut, feminin, dan memorable' },
    'smart-casual+rectangle': { name: 'The Modern Professional', tagline: 'Rapi, versatile, dan percaya diri' },
    'streetwear+inverted': { name: 'The Urban Curator', tagline: 'Bold, balanced, dan statement' }
  };

  const productMap = {
    rectangle: [
      { name: 'Wrap Top Kain Sisa', why: 'Membentuk pinggang dan menciptakan siluet feminin' },
      { name: 'Peplum Blouse', why: 'Memberikan volume di area pinggul' }
    ],
    hourglass: [
      { name: 'Fitted Midi Dress', why: 'Menonjolkan lekuk tubuh dengan bahan flowy' },
      { name: 'High Waist Wide Leg', why: 'Seimbangkan proporsi atas dan bawah' }
    ],
    pear: [
      { name: 'Off-shoulder Wrap Top', why: 'Fokus visual ke area bahu dan atas' },
      { name: 'A-line Maxi Skirt', why: 'Mengalir lembut melewati pinggul' }
    ],
    apple: [
      { name: 'Empire Waist Dress', why: 'Jatuh bebas dari dada, nyaman dan flowy' },
      { name: 'Longline Linen Outer', why: 'Menciptakan garis vertikal yang memanjangkan' }
    ],
    inverted: [
      { name: 'Flared Wide Leg Pants', why: 'Menambah volume di bawah untuk keseimbangan' },
      { name: 'Simple V-neck Top', why: 'Menjaga fokus visual ke bawah' }
    ]
  };

  const vibe = answers.styleVibe?.[0] ?? 'clean-casual';
  const bodyShape = answers.bodyShape ?? 'rectangle';
  const archetype = archetypes[`${vibe}+${bodyShape}`] ?? {
    name: 'The Circular Stylist',
    tagline: 'Personal, berkelanjutan, dan selalu relevan'
  };
  const heightInsight =
    answers.height?.includes('155') || answers.height?.includes('bawah')
      ? 'Untuk proporsi tubuhmu, potongan midi dan high-waist akan membantu memanjangkan siluet secara visual.'
      : answers.height?.includes('170') || answers.height?.includes('atas')
        ? 'Tinggi badanmu membuatmu leluasa mengeksplorasi maxi, culotte, atau oversized layering.'
        : 'Proporsi tubuhmu cukup versatile, jadi kamu bebas bermain dengan panjang hem dari midi hingga maxi.';
  const occasionInsight = answers.occasion?.includes('office')
    ? 'Karena kamu juga butuh outfit kerja, fokus pada piece yang bisa di-mix antara formal dan kasual.'
    : answers.occasion?.includes('event')
      ? 'Untuk special event, pilih satu hero piece berkualitas daripada banyak fast fashion.'
      : 'Outfit daily wear yang sustainable berarti investasi pada piece tahan lama dan multifungsi.';
  const vibeLabel = styleVibes.find((item) => item.id === vibe)?.label ?? 'Clean Casual';
  const bodyLabel = bodyShapes.find((item) => item.id === bodyShape)?.label ?? 'Rectangle';

  return {
    archetype: archetype.name,
    tagline: archetype.tagline,
    analysis: `${heightInsight} ${occasionInsight} Dengan ${vibeLabel} sebagai vibe utama dan bentuk tubuh ${bodyLabel}, CIRCULAI merekomendasikan pilihan kain lokal yang menonjolkan siluetmu secara alami.`,
    palette: palettes[answers.skinTone ?? 'medium-olive'] ?? palettes['medium-olive'],
    cuttings: cuttings[bodyShape]?.good ?? [],
    avoidCuttings: cuttings[bodyShape]?.avoid ?? [],
    fabrics: fabricMap[vibe] ?? fabricMap['clean-casual'],
    products: productMap[bodyShape] ?? productMap.rectangle
  };
}
