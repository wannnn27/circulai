const {
  createProductPassport,
  getTailorByName,
  paymentMethods
} = require('../lib/domain');

const products = [
  {
    id: 1,
    name: 'Luna Wrap Top',
    tailor: 'Rahayu Tailor',
    tailorCity: 'Sleman, Yogyakarta',
    price: 155000,
    badges: ['Made-to-Order', 'Kain Sisa'],
    category: 'Outer',
    eta: '5-7 hari',
    rating: 4.9,
    savedFabric: '0.8m',
    material: 'Rayon lokal sisa produksi',
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
    price: 175000,
    badges: ['Made-to-Order'],
    category: 'Dress',
    eta: '7-10 hari',
    rating: 4.8,
    savedFabric: '1.0m',
    material: 'Linen blend deadstock',
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
    price: 120000,
    badges: ['Kain Sisa', 'Local Tailor'],
    category: 'Kemeja',
    eta: '4-6 hari',
    rating: 4.7,
    savedFabric: '0.5m',
    material: 'Katun poplin sisa atelier',
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
    price: 210000,
    badges: ['Low Waste'],
    category: 'Outer',
    eta: '6-9 hari',
    rating: 4.8,
    savedFabric: '1.2m',
    material: 'Tenun rayon mixed scraps',
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
    price: 195000,
    badges: ['Made-to-Order', 'Kain Sisa'],
    category: 'Dress',
    eta: '7-10 hari',
    rating: 4.9,
    savedFabric: '1.1m',
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
    price: 135000,
    badges: ['Local Tailor'],
    category: 'Kemeja',
    eta: '5-7 hari',
    rating: 4.7,
    savedFabric: '0.6m',
    material: 'Linen natural lokal',
    color: '#E8DCC8',
    image: 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/16d546dcae0c4256abf37973bdb49277~tplv-aphluv4xwc-white-pad-v1:500:500.jpeg',
    description: 'Kemeja linen natural dengan detail minimal untuk capsule wardrobe.',
    measurements: ['Lingkar dada', 'Panjang kemeja', 'Lebar bahu'],
    recommendations: ['Minimalist', 'Smart casual', 'Formal']
  }
];

const tailors = [
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
    image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
  }
];

const addresses = [
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

function createSeedOrder({ id, product, status, eta, issuedAt }) {
  const tailorProfile = getTailorByName({ tailors }, product.tailor);
  const passport = createProductPassport({
    orderId: id,
    product,
    material: product.material,
    tailor: product.tailor,
    tailorCity: product.tailorCity,
    savedFabric: product.savedFabric,
    issuedAt,
    orderStatus: status
  });

  return {
    id,
    orderType: 'catalog',
    productId: product.id,
    product: product.name,
    description: product.description,
    tailor: product.tailor,
    tailorCity: product.tailorCity,
    tailorProfile,
    price: `Rp${String(product.price).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
    rawPrice: product.price,
    status,
    statusHistory: [
      {
        status,
        label: issuedAt,
        note: 'Status terakhir pesanan',
        actor: 'system'
      }
    ],
    eta,
    placedAt: '2026-06-04T08:00:00.000Z',
    placedAtLabel: issuedAt,
    image: product.image,
    badges: product.badges,
    savedFabric: product.savedFabric,
    material: product.material,
    size: 'M',
    measurements: null,
    notes: 'Tidak ada catatan khusus',
    shippingAddress: 'Adi Arwan Syah, Sleman, Yogyakarta',
    address: addresses[0],
    paymentMethod: paymentMethods[2],
    paymentData: {
      bankName: 'BCA Virtual Account',
      vaNumber: `8808${String(id).replace(/\D/g, '').padStart(3, '0')}2026`,
      amount: `Rp${String(product.price).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
      expiresAt: '2026-06-09T08:00:00.000Z'
    },
    courier: 'CIRCULAI Delivery',
    trackingCode: `CRL-${String(id).replace(/\D/g, '').padStart(3, '0')}-ID`,
    shipmentStatus: ['DELIVERED', 'COMPLETED'].includes(status) ? 'Paket telah diterima' : 'Menunggu pengiriman',
    passport,
    passports: [passport]
  };
}

const seed = {
  user: {
    id: 'USR-001',
    name: 'Adi Arwan Syah',
    email: 'adi.arwansyah@email.com',
    phone: '0812 3456 7890',
    photoUri: null
  },
  measurements: {
    height: '168',
    chest: '92',
    waist: '78',
    hips: '96'
  },
  preferences: {
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
  },
  styleProfile: null,
  wishlist: [1, 5],
  products,
  tailors,
  categories: ['Semua', 'Outer', 'Dress', 'Kemeja', 'Casual', 'Formal'],
  sortOptions: ['Terbaru', 'Harga Terendah', 'Harga Tertinggi', 'Rating'],
  paymentMethods,
  addresses,
  cart: [],
  orders: [
    createSeedOrder({ id: 'ORD-001', product: products[0], status: 'IN_PRODUCTION', eta: '7 Juni 2026', issuedAt: '4 Juni 2026' }),
    createSeedOrder({ id: 'ORD-002', product: products[1], status: 'DELIVERED', eta: 'Sudah diterima', issuedAt: '4 Juni 2026' })
  ],
  conversations: {},
  paymentAttempts: []
};

module.exports = seed;
