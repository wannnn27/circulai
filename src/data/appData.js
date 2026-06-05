export const onboarding = [
  {
    icon: 'tshirt-crew-outline',
    title: 'Fashion That Fits You',
    desc: 'Temukan outfit yang cocok dengan warna, bentuk tubuh, dan gaya personalmu.'
  },
  {
    icon: 'recycle',
    title: 'Made After You Order',
    desc: 'Produk dibuat setelah pesanan masuk untuk mengurangi stok mati dan limbah fashion.'
  },
  {
    icon: 'account-group-outline',
    title: 'Support Local Tailors',
    desc: 'Setiap pesanan membantu UMKM fashion dan penjahit lokal berkembang.'
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
    price: 189000,
    badges: ['Made-to-Order', 'Kain Sisa'],
    category: 'Outer',
    eta: '5-7 hari',
    rating: 4.9,
    savedFabric: '0.8m',
    material: 'Rayon lokal sisa produksi',
    color: '#D7B39A',
    image: 'https://images.unsplash.com/photo-1596636222220-dfb7071e3676?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
    description: 'Wrap top serbaguna dengan tali pinggang yang membentuk siluet tanpa terasa ketat.',
    measurements: ['Lingkar dada', 'Panjang top', 'Lingkar lengan'],
    recommendations: ['Office-to-dinner', 'Rectangle body', 'Warm earth palette']
  },
  {
    id: 2,
    name: 'Olive Linen Dress',
    tailor: 'Kartika Studio',
    tailorCity: 'Bandung',
    price: 245000,
    badges: ['Made-to-Order'],
    category: 'Dress',
    eta: '7-10 hari',
    rating: 4.8,
    savedFabric: '1.0m',
    material: 'Linen blend deadstock',
    color: '#7D8C55',
    image: 'https://images.unsplash.com/photo-1637248360598-6bc357ae6958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
    description: 'Dress olive dengan potongan loose, cocok untuk daily wear dan acara semi formal.',
    measurements: ['Lingkar dada', 'Lingkar pinggang', 'Panjang dress'],
    recommendations: ['Minimalist', 'Medium olive skin', 'Daily wear']
  },
  {
    id: 3,
    name: 'Earth Tone Blouse',
    tailor: 'Sari Tailor',
    tailorCity: 'Solo',
    price: 165000,
    badges: ['Kain Sisa', 'Local Tailor'],
    category: 'Kemeja',
    eta: '4-6 hari',
    rating: 4.7,
    savedFabric: '0.5m',
    material: 'Katun poplin sisa atelier',
    color: '#C97B63',
    image: 'https://images.unsplash.com/photo-1640257846267-9db046ffe896?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
    description: 'Blouse earthy yang ringan dengan detail clean untuk dipadukan dengan celana high waist.',
    measurements: ['Lingkar dada', 'Lebar bahu', 'Panjang lengan'],
    recommendations: ['Clean casual', 'Smart casual', 'Office']
  },
  {
    id: 4,
    name: 'Casual Outer Wrap',
    tailor: 'Jogja Atelier',
    tailorCity: 'Yogyakarta',
    price: 320000,
    badges: ['Low Waste'],
    category: 'Outer',
    eta: '6-9 hari',
    rating: 4.8,
    savedFabric: '1.2m',
    material: 'Tenun rayon mixed scraps',
    color: '#8E6F5A',
    image: 'https://images.unsplash.com/photo-1647714028322-4bde00824b65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
    description: 'Outer wrap dengan garis panjang untuk layering yang nyaman dan memanjangkan siluet.',
    measurements: ['Panjang outer', 'Lebar bahu', 'Lingkar lengan'],
    recommendations: ['Traveling', 'Layering', 'Apple body']
  },
  {
    id: 5,
    name: 'Terracotta Midi Dress',
    tailor: 'Kartika Studio',
    tailorCity: 'Bandung',
    price: 278000,
    badges: ['Made-to-Order', 'Kain Sisa'],
    category: 'Dress',
    eta: '7-10 hari',
    rating: 4.9,
    savedFabric: '1.1m',
    material: 'Rayon flowy',
    color: '#B96E5B',
    image: 'https://images.unsplash.com/photo-1682615826492-78dee8c1afed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
    description: 'Midi dress terracotta dengan potongan flowy untuk special event yang tetap mindful.',
    measurements: ['Lingkar dada', 'Lingkar pinggang', 'Panjang midi'],
    recommendations: ['Special event', 'Feminine soft', 'Medium warm skin']
  },
  {
    id: 6,
    name: 'Natural Linen Shirt',
    tailor: 'Rahayu Tailor',
    tailorCity: 'Sleman, Yogyakarta',
    price: 198000,
    badges: ['Local Tailor'],
    category: 'Kemeja',
    eta: '5-7 hari',
    rating: 4.7,
    savedFabric: '0.6m',
    material: 'Linen natural lokal',
    color: '#E8DCC8',
    image: 'https://images.unsplash.com/photo-1752770260282-6abbc0443762?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
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
    image: 'https://images.unsplash.com/photo-1673201229733-69d19c5c4a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
  },
  {
    id: 2,
    name: 'Kartika Studio',
    city: 'Bandung',
    specialty: 'Dress, Kebaya Modern',
    rating: 4.8,
    sold: 196,
    image: 'https://images.unsplash.com/photo-1457972657980-4c9fddebec8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
  },
  {
    id: 3,
    name: 'Sari Tailor',
    city: 'Solo',
    specialty: 'Batik Modern, Casual',
    rating: 4.7,
    sold: 312,
    image: 'https://images.unsplash.com/photo-1578353022142-09264fd64295?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
  }
];

export const orderSteps = [
  { id: 'received', label: 'Pesanan Diterima', desc: 'Penjahit menerima orderanmu' },
  { id: 'confirmed', label: 'Desain Dikonfirmasi', desc: 'Detail dan ukuran disetujui' },
  { id: 'material', label: 'Bahan Disiapkan', desc: 'Kain dipotong sesuai ukuran' },
  { id: 'sewing', label: 'Proses Jahit', desc: 'Sedang dijahit oleh penjahit' },
  { id: 'qc', label: 'Quality Control', desc: 'Pengecekan kualitas akhir' },
  { id: 'shipped', label: 'Dikirim', desc: 'Paket dalam perjalanan' }
];

export const initialOrders = [
  {
    id: 'ORD-001',
    productId: 1,
    product: 'Luna Wrap Top',
    tailor: 'Rahayu Tailor',
    tailorCity: 'Sleman, Yogyakarta',
    price: 'Rp189.000',
    status: 'sewing',
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
    status: 'shipped',
    eta: 'Sudah dikirim',
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
      { icon: 'maximize-2', label: 'Ukuran Tersimpan', desc: 'Data ukuran untuk custom order' }
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

export function formatCurrency(value) {
  return `Rp${value.toLocaleString('id-ID').replace(/,/g, '.')}`;
}

export function orderStatusIndex(status) {
  return Math.max(0, orderSteps.findIndex((step) => step.id === status));
}

export function createOrderFromProduct(product, count) {
  const suffix = String(count + 1).padStart(3, '0');

  return {
    id: `ORD-${suffix}`,
    productId: product.id,
    product: product.name,
    tailor: product.tailor,
    tailorCity: product.tailorCity,
    price: formatCurrency(product.price),
    status: 'received',
    eta: product.eta,
    image: product.image,
    badges: product.badges,
    savedFabric: product.savedFabric
  };
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
