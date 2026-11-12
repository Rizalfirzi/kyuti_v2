import { MenuItem, Outlet } from './types';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'https://tixandcoffee.developerngantuk.my.id/api';

export const STORE_CONFIG = {
  name: 'Kedai Kyuti',
  domain: 'kedaikyuti.my.id',
  tagline: 'JASDOR KOPI KENANGAN',
  adminPhone: '628972276154',
  defaultOutlet: 'LA.CODEFIN',
  plasticBagFee: 1000,
  singleItemFee: 0,
};

export const PREMIUM_CODES = [
  'KK.KWG.GLHMAS',       // Galuh Mas Karawang
  'KK.TNG.RKBARNSRPG',   // Buaran Serpong
  'KK.TNG.BNTROSKTR9',   // Bintaro Sektor 9
  'KK.JKT.GNDRKRMTPL',   // Gandaria Kramat Pela
  'KK.JKT.RKMTRMNJT',    // Ruko Matraman Jakarta Timur
  'SOPODEL',             // Sopo Del Tower
  'KK.YYK.BNTRBDYA',     // Kota Baru Jogja
  'KK.SBY.JMSRI',        // Jemursari Surabaya
  'SBY.AHMDYNMJO',       // Ahmad Yani Surabaya
  'KK.JKT.CKJNG',        // Cikajang
  'SAHID',               // Sahid Sudirman
  'KK.TRG.RKAMDMKSIN',   // Ruko Ahmad Muksin Tenggarong
  'DOCOKK.TRG.DNUSMYNG', // Danau Semayang Tenggarong
  'KK.TNR.RKMNGABRUKT',  // Ruko Mangga Berau
  'KK.JKT.RKPCNGAN',     // Ruko Pecenongan Jakarta Pusat
  'KK.JKT.RWBLNGJKT',    // Rawa Belong Jakarta
  'KK.BGR.SMBGR',        // Summarecon Bogor
  'KK.SKT.KPRABN',       // Keprabon Surakarta
  'TGR.SDCSERPONG',      // Summarecon Digital Center (SDC Serpong)
  'BDG.CHMPLSWK',        // Cihampelas Walk
  'JKT.CFPIM2',          // PIM 2
  'JKT.FCPIM3',          // Food Court PIM 3
  'TGR.TERASKOTA',       // Teras Kota
  'TP3.SBY',             // Tunjungan Plaza 3
];

export const PREMIUM_NAMES = [
  'buaran serpong',
  'bintaro sektor 9',
  'galuh mas karawang',
  'gandaria kramat pela',
  'matraman',
  'sopo del',
  'kota baru jogja',
  'jemursari',
  'ahmad yani surabaya',
  'cikajang',
  'sahid sudirman',
  'sahid sudirmam',
  'ahmad muksin tenggarong',
  'danau semayang',
  'ruko mangga berau',
  'pecenongan',
  'rawa belong',
  'summarecon bogor',
  'keprabon',
  'summarecon digital center',
  'cihampelas walk',
  'pim 2',
  'pim 3',
  'teras kota',
  'tunjungan plaza 3',
];

export const BUNDLING_ITEMS: MenuItem[] = [
  {
    key: 'bundle_2_cup_large',
    name: 'PAKET BUNDLING 2 CUP LARGE',
    category: 'Bundling',
    price: 33000,
    originalPrice: 50000,
    desc: 'Pilih 2 menu bebas dari pilihan minuman size large yang tersedia di foto! ♡ Bisa mix rasa favoritmu sesuai selera🥤💗',
    img: '/assets/img/bundling/PAKET BUNDLING 2 CUP LARGE.jpeg',
    tag: '2 CUP LARGE',
    size: 'Large',
    isSoldOut: false,
    isBundling: true,
    slots: [
      {
        label: 'Minuman 1 (Large)',
        options: [
          'Kenangan Milk Tea',
          'Raspberry Hibiscus',
          'Thai Tea Loaded',
          'Butterscotch Aren Latte',
          'Americano',
          'Kopi Kenangan Mantan',
          'Taro Milk',
          'Taro Cloud Milk Tea',
          'Spanish Latte',
          'Pistachio Aren Latte',
        ],
      },
      {
        label: 'Minuman 2 (Large)',
        options: [
          'Kenangan Milk Tea',
          'Raspberry Hibiscus',
          'Thai Tea Loaded',
          'Butterscotch Aren Latte',
          'Americano',
          'Kopi Kenangan Mantan',
          'Taro Milk',
          'Taro Cloud Milk Tea',
          'Spanish Latte',
          'Pistachio Aren Latte',
        ],
      },
    ],
    options: {
      ices: ['Normal Ice', 'Less Ice'],
      sugars: ['Normal Sugar', 'Less Sugar (50%)', 'No Sugar'],
    },
  },
  {
    key: 'bundle_2_frappe',
    name: 'PAKET BUNDLING 2 FRAPPE',
    category: 'Bundling',
    price: 33000,
    originalPrice: 56000,
    desc: 'Pilih paket bundling frappe ukuran reguler sesuai kombinasi menu yang tersedia di foto! ♡ Tersedia 8 pilihan paket dengan perpaduan rasa favoritmu. Tinggal pilih paket yang paling kamu suka! 🍵💗',
    img: '/assets/img/bundling/PAKET BUNDLING 2 FRAPPE.jpeg',
    tag: '2 FRAPPE REGULER',
    size: 'Reguler',
    isSoldOut: false,
    isBundling: true,
    slots: [
      {
        label: 'Pilih Paket Frappe (Reguler)',
        type: 'variant_price',
        options: [
          { name: 'Kopi Kenangan Mantan + Matcha Kenangan Frappe', price: 36000 },
          { name: 'Dutch Choco Kenangan + Butterscotch Kenangan', price: 36000 },
          { name: 'Dutch Choco Kenangan + Kopi Kenangan Mantan', price: 35000 },
          { name: 'Dutch Choco Kenangan + Vanilla Kenangan Frappe', price: 36000 },
          { name: 'Matcha Kenangan Frappe + Vanilla Kenangan Frappe', price: 35000 },
          { name: 'Kopi Kenangan Mantan + Butterscotch Kenangan', price: 35000 },
          { name: 'Kopi Kenangan Mantan + Vanilla Kenangan Frappe', price: 33000 },
          { name: 'Butterscotch Kenangan + Vanilla Kenangan Frappe', price: 35000 },
        ],
      },
    ],
    options: {
      ices: ['Normal Ice', 'Less Ice'],
      sugars: ['Normal Sugar', 'Less Sugar (50%)', 'No Sugar'],
    },
  },
  {
    key: 'promo_minuman_special',
    name: 'PROMO MINUMAN SPECIAL',
    category: 'Bundling',
    price: 13000,
    originalPrice: 24000,
    desc: 'Promo minuman special murah meriah ukuran reguler! Tinggal pilih minuman favoritmu dari daftar pilihan di bawah ini ♡',
    img: '/assets/img/bundling/PROMO MINUMAN SPECIAL.jpeg',
    tag: 'PROMO SPECIAL',
    size: 'Reguler',
    isSoldOut: false,
    isBundling: true,
    slots: [
      {
        label: 'Pilih Minuman Promo (Reguler)',
        type: 'variant_price',
        options: [
          { name: 'Kopi Kenangan Mantan', price: 13000 },
          { name: 'Toffee Nut Latte', price: 13000 },
          { name: 'Americano', price: 13000 },
          { name: 'Kenangan Milk Tea', price: 14000 },
        ],
      },
    ],
    options: {
      ices: ['Normal Ice', 'Less Ice'],
      sugars: ['Normal Sugar', 'Less Sugar (50%)', 'No Sugar'],
    },
  },
  {
    key: 'bundle_hemat_3_item',
    name: 'PAKET HEMAT 3 ITEM',
    category: 'Bundling',
    price: 35000,
    originalPrice: 65000,
    desc: 'Pilih 3 item bebas dari menu yang tersedia di foto! Bisa mix makanan dan minuman, atau pilih menu yang sama sesuai selera ♡',
    img: '/assets/img/bundling/PAKET HEMAT 3 ITEM.jpeg',
    tag: 'HEMAT 3 ITEM',
    size: 'Reguler',
    isSoldOut: false,
    isBundling: true,
    slots: [
      {
        label: 'Item 1: Minuman Kopi',
        options: ['Kopi Kenangan Mantan', 'Americano', 'Avocado Coffee'],
      },
      {
        label: 'Item 2: Minuman Non Kopi / Milk Tea',
        options: ['Kenangan Milk Tea', 'Thai Tea Loaded', 'Taro Milk'],
      },
      {
        label: 'Item 3: Roti / Camilan',
        options: ['Roti Coklat Klasik', 'Roti Keju Manis', 'Roti Daging Asap'],
      },
    ],
    options: {
      ices: ['Normal Ice', 'Less Ice'],
      sugars: ['Normal Sugar', 'Less Sugar (50%)', 'No Sugar'],
    },
  },
];

export const FALLBACK_OUTLETS: Outlet[] = [
  {
    code: 'LA.CODEFIN',
    id: 282,
    name: 'La Codefin Kemang',
    address: 'La Codefin Kemang, GF, Jl. Kemang I No. 3-5, RT.11/RW.1, Bangka, Mampang Prapatan, Jakarta Selatan - 12780',
    city: 'Jakarta Selatan',
    lat: -6.2561977,
    lng: 106.812852,
    isOpen: true,
    canOrder: true,
    statusText: 'Buka',
    hours: '07:00 - 21:30',
    img: 'https://cdn.kopikenangan.com/public/da484154-47b1-a756-54a4-8b3490fb0eae',
    category: 'Shop House',
    phone: '0817 9876 096',
    distanceKm: null,
    isPremium: false,
    premium: false,
  },
  {
    code: 'KK.SBY.RKABNGAN',
    id: 3627,
    name: 'Ruko Ambengan Surabaya',
    address: 'Ruko Ambengan Surabaya, Jl. Ambengan, Ketabang, Surabaya Selatan, Surabaya, Jawa Timur 60179',
    city: 'Surabaya',
    lat: -7.255728,
    lng: 112.749807,
    isOpen: true,
    canOrder: true,
    statusText: 'Buka',
    hours: '00:01 - 23:19',
    img: 'https://cdn.kopikenangan.com/ID/release/pub/b/m/dc7c918d-e6d7-4282-9b81-0b38b848f076',
    category: 'Shop House',
    phone: '0817 6562 292',
    distanceKm: null,
    isPremium: false,
    premium: false,
  },
  {
    code: 'SBY.STGBENG',
    id: 2687,
    name: 'Stasiun Gubeng Surabaya',
    address: 'Stasiun Gubeng Surabaya, Pacar Keling, Kec. Tambaksari, Kota Surabaya, Jawa Timur 60131',
    city: 'Surabaya',
    lat: -7.2656925,
    lng: 112.7519859,
    isOpen: true,
    canOrder: true,
    statusText: 'Buka',
    hours: '06:00 - 20:00',
    img: 'https://cdn.kopikenangan.com/public/8fed1c14-eb1f-dafe-8608-c438521ec78d',
    category: 'Train Station',
    phone: '0817439767',
    distanceKm: null,
    isPremium: false,
    premium: false,
  },
  {
    code: 'SBY.BPPEMUDA',
    id: 392,
    name: 'BP Pemuda Surabaya',
    address: 'BP Pemuda, Jl. Pemuda No 72 RT 001 RW 03 Embong Kaliasin, Genteng, Surabaya, 60271',
    city: 'Surabaya',
    lat: -7.2652438,
    lng: 112.7474491,
    isOpen: true,
    canOrder: true,
    statusText: 'Buka',
    hours: '06:00 - 22:45',
    img: 'https://cdn.kopikenangan.com/public/40c1585d-4909-e368-9e2f-7249fce6e551',
    category: 'Gas Station',
    phone: '08179141950',
    distanceKm: null,
    isPremium: false,
    premium: false,
  },
  {
    code: 'TP3.SBY',
    id: 242,
    name: 'Tunjungan Plaza 3',
    address: 'Tunjungan Plaza 3, Lantai 5, Jl. Basuki Rahmat No.107, Tegalsari, Surabaya, 60261',
    city: 'Surabaya',
    lat: -7.2634859,
    lng: 112.7396328,
    isOpen: true,
    canOrder: true,
    statusText: 'Buka',
    hours: '10:00 - 21:30',
    img: 'https://cdn.kopikenangan.com/public/90bd14d0-a474-c6d6-a1f0-25d685b07bef',
    category: 'Mall',
    phone: '0817 9876 022',
    distanceKm: null,
    isPremium: true,
    premium: true,
  },
  {
    code: 'SBY.RKDRMHSDA',
    id: 2567,
    name: 'Ruko Dharmahusada Surabaya',
    address: 'Ruko Dharmahusada Surabaya, Jl. Dharmahusada 72-58, Mojo, Kec. Gubeng, Kota SBY, Jawa Timur 60285',
    city: 'Surabaya',
    lat: -7.2659668,
    lng: 112.7644233,
    isOpen: true,
    canOrder: true,
    statusText: 'Buka',
    hours: '00:01 - 23:19',
    img: 'https://cdn.kopikenangan.com/public/dc910c78-30c6-30e2-a9ab-0ffafe803344',
    category: 'Shop House',
    phone: '0817 6562 113',
    distanceKm: null,
    isPremium: false,
    premium: false,
  },
];

/**
 * Check if an outlet is classified as Premium (Mall, Bandara, Stasiun, etc.)
 */
export function checkIsPremiumOutlet(outlet: Partial<Outlet>): boolean {
  if (typeof outlet.isPremium === 'boolean') return outlet.isPremium;
  if (typeof outlet.premium === 'boolean') return outlet.premium;

  const code = (outlet.code || '').toUpperCase();
  if (PREMIUM_CODES.includes(code)) return true;

  const name = (outlet.name || '').toLowerCase();
  const category = (outlet.category || '').toLowerCase();
  const address = (outlet.address || '').toLowerCase();
  const combined = `${category} ${name} ${address}`;

  for (const pName of PREMIUM_NAMES) {
    if (name.includes(pName)) {
      if (pName === 'galuh mas karawang' && (name.includes('shell') || category.includes('gas station'))) {
        continue;
      }
      return true;
    }
  }

  const isGasStation =
    category.includes('gas station') ||
    combined.includes('spbu') ||
    combined.includes('pom bensin') ||
    name.startsWith('shell') ||
    name.startsWith('pertamina') ||
    name.startsWith('bp ');

  if (isGasStation && !combined.includes('bandara') && !combined.includes('airport')) {
    return false;
  }

  const premiumKeywords = [
    'terminal bandara',
    'keberangkatan bandara',
    'airport departure',
    'bandara internasional',
    'terminal 2d',
    'terminal 2e',
    'terminal 3 domestic',
    'terminal 3 international',
    'grand indonesia',
    'senayan city',
    'pacific place',
    'tunjungan plaza 3',
    'pim 3',
  ];
  return premiumKeywords.some((kw) => combined.includes(kw));
}

/**
 * Calculate distance between two points in km (Haversine Formula)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadius = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadius * c * 100) / 100;
}

/**
 * Evaluate Operating Hours based on current WIB time
 */
export function evaluateOutletHours(outlet: Outlet): Outlet {
  if (!outlet.hours) return outlet;
  const m = outlet.hours.match(/(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})/);
  if (m) {
    const openMinutes = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    const closeMinutes = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);

    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMin = now.getUTCMinutes();
    const wibHour = (utcHour + 7) % 24;
    const nowMinutes = wibHour * 60 + utcMin;

    const is24Hours = openMinutes <= 1 && closeMinutes >= 23 * 60;
    let isOpen = true;
    if (is24Hours) {
      isOpen = true;
    } else if (openMinutes <= closeMinutes) {
      isOpen = nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
    } else {
      isOpen = nowMinutes >= openMinutes || nowMinutes <= closeMinutes;
    }

    outlet.isOpen = isOpen;
    outlet.canOrder = isOpen;
    outlet.statusText = isOpen ? 'Buka' : 'Tutup';
  }
  return outlet;
}

/**
 * Fetch Outlets with full image, hours, distance and premium status
 */
export async function fetchOutletsData(
  query?: string,
  lat?: number,
  lng?: number
): Promise<{ success: boolean; source: string; count: number; outlets: Outlet[] }> {
  let list: Outlet[] = [];

  try {
    const params = new URLSearchParams();
    if (query && query.trim()) params.set('q', query.trim());
    if (lat !== undefined && lng !== undefined) {
      params.set('lat', String(lat));
      params.set('lng', String(lng));
    }

    const url = `${API_BASE_URL}/kopken/outlets${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url, { next: { revalidate: 600 } });

    if (res.ok) {
      const data = await res.json();
      const rawOutlets = data.outlets || data || [];
      list = rawOutlets.map((o: any) => ({
        code: o.code || o.outlet_code || o.id,
        id: o.id,
        name: o.name || o.outlet_name || 'Kopi Kenangan',
        address: o.address || '',
        city: o.city || '',
        lat: typeof o.lat === 'number' ? o.lat : parseFloat(o.lat) || undefined,
        lng: typeof o.lng === 'number' ? o.lng : parseFloat(o.lng) || undefined,
        isOpen: o.isOpen !== undefined ? Boolean(o.isOpen) : !o.isClosed,
        canOrder: o.canOrder !== undefined ? Boolean(o.canOrder) : !o.isClosed,
        statusText: o.statusText || (o.isClosed ? 'Tutup' : 'Buka'),
        hours: o.hours || '07:00 - 22:00',
        img: o.img || o.image || 'https://cdn.kopikenangan.com/public/da484154-47b1-a756-54a4-8b3490fb0eae',
        category: o.category || 'Shop House',
        phone: o.phone || '',
        distanceKm: o.distanceKm !== undefined ? o.distanceKm : (o.distance ? Number(o.distance.toFixed(1)) : null),
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch remote outlets, using fallback:', err);
  }

  if (list.length === 0) {
    list = [...FALLBACK_OUTLETS];
  }

  // If no query and no lat/lng, ensure LA.CODEFIN is prepended if not in list
  if (!query && lat === undefined && lng === undefined) {
    const hasCodefin = list.some((o) => o.code === 'LA.CODEFIN');
    if (!hasCodefin) {
      try {
        const cRes = await fetch(`${API_BASE_URL}/kopken/outlets?q=codefin`);
        if (cRes.ok) {
          const cData = await cRes.json();
          const cList = cData.outlets || [];
          if (cList.length > 0) {
            const codefin = cList[0];
            list.unshift({
              code: codefin.code || 'LA.CODEFIN',
              id: codefin.id || 282,
              name: codefin.name || 'La Codefin Kemang',
              address: codefin.address || 'La Codefin Kemang, GF, Jl. Kemang I No. 3-5, RT.11/RW.1, Bangka, Mampang Prapatan, Jakarta Selatan - 12780',
              city: codefin.city || 'Jakarta Selatan',
              lat: codefin.lat,
              lng: codefin.lng,
              isOpen: codefin.isOpen !== undefined ? Boolean(codefin.isOpen) : true,
              canOrder: codefin.canOrder !== undefined ? Boolean(codefin.canOrder) : true,
              statusText: codefin.statusText || 'Buka',
              hours: codefin.hours || '07:00 - 21:30',
              img: codefin.img || 'https://cdn.kopikenangan.com/public/da484154-47b1-a756-54a4-8b3490fb0eae',
              category: codefin.category || 'Shop House',
              phone: codefin.phone || '0817 9876 096',
              distanceKm: null,
            });
          }
        }
      } catch (e) {
        // Fallback to static codefin
        list.unshift(FALLBACK_OUTLETS[0]);
      }
    } else {
      // Move LA.CODEFIN to the top if already in list
      const idx = list.findIndex((o) => o.code === 'LA.CODEFIN');
      if (idx > 0) {
        const [c] = list.splice(idx, 1);
        list.unshift(c);
      }
    }
  }

  // Calculate distance if coordinates provided
  if (lat !== undefined && lng !== undefined) {
    list.forEach((o) => {
      if (o.lat && o.lng) {
        o.distanceKm = calculateDistance(lat, lng, o.lat, o.lng);
      }
    });
    list.sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
  }

  // Filter by query if query provided and list wasn't filtered by upstream
  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.address && o.address.toLowerCase().includes(q)) ||
        (o.city && o.city.toLowerCase().includes(q))
    );
  }

  // Evaluate Operating Hours and Premium Status for each outlet
  list = list.map((o) => {
    const evaluated = evaluateOutletHours(o);
    const isPrem = checkIsPremiumOutlet(evaluated);
    evaluated.isPremium = isPrem;
    evaluated.premium = isPrem;
    return evaluated;
  });

  return {
    success: true,
    source: 'live',
    count: list.length,
    outlets: list,
  };
}

/**
 * Get single outlet by code
 */
export async function getOutletByCode(code: string): Promise<Outlet | null> {
  const clean = code.trim();
  if (!clean) return null;

  const data = await fetchOutletsData();
  const match = data.outlets.find((o) => o.code === clean);
  if (match) return match;

  try {
    const res = await fetch(`${API_BASE_URL}/kopken/outlets?q=${encodeURIComponent(clean)}`);
    if (res.ok) {
      const qData = await res.json();
      const qList: Outlet[] = qData.outlets || [];
      const exact = qList.find((o) => o.code === clean) || qList[0];
      if (exact) {
        const evaluated = evaluateOutletHours(exact);
        evaluated.isPremium = checkIsPremiumOutlet(evaluated);
        evaluated.premium = evaluated.isPremium;
        return evaluated;
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Backward compatibility alias
 */
export async function fetchOutlets(query?: string): Promise<Outlet[]> {
  const data = await fetchOutletsData(query);
  return data.outlets;
}

/**
 * Calculate Kyuti price: (OrigPrice * 0.5) + Fee
 */
export function calculateKyutiPrice(
  name: string,
  category: string,
  origPrice: number,
  customMarkup?: number
): number {
  if (category === 'Bundling' || origPrice <= 0) return origPrice;

  if (customMarkup !== undefined) {
    return Math.round(origPrice * 0.5) + customMarkup;
  }

  const lowerName = name.toLowerCase();
  let markup = 5000;

  if (lowerName.includes('mantan') && !lowerName.includes('frappe') && !lowerName.includes('oatside')) {
    markup = 6000;
  } else if (category === 'Food' || category === 'Makanan') {
    markup = 4500;
  }

  const halfPrice = Math.round(origPrice * 0.5);
  return halfPrice + markup;
}

function getStoredPricing() {
  const pFile = path.join(process.cwd(), 'data', 'pricing_settings.json');
  try {
    if (fs.existsSync(pFile)) {
      return JSON.parse(fs.readFileSync(pFile, 'utf-8'));
    }
  } catch (e) {}
  return {
    default_markup: 5000,
    category_markups: {
      Coffee: 5000,
      'Non Coffee': 5000,
      Frappe: 5000,
      Food: 4500,
      Minuman: 5000,
      Makanan: 4500,
      Bundling: 0,
    },
    item_markup_overrides: [
      { name: 'Kopi Kenangan Mantan', fee: 6000 },
      { name: 'Kopi Kenangan Mantan (Large)', fee: 6000 },
    ],
    bundling_status: {
      bundle_2_cup_large: true,
      bundle_2_frappe: true,
      promo_minuman_special: true,
      bundle_hemat_3_item: true,
    },
  };
}

/**
 * Fetch Real-time Menu, adjust stock, apply price formula, merge bundling items
 */
export async function fetchOutletMenu(
  outletCode: string,
  forceRefresh: boolean = false
): Promise<{
  success: boolean;
  live: boolean;
  isClosed: boolean;
  premium: boolean;
  brand: string;
  outletCode: string;
  categories: Array<{ id: string; name: string; kind?: string }>;
  items: MenuItem[];
  stats: { total: number; available: number; soldOut: number };
  updatedAt: string;
}> {
  const pricing = getStoredPricing();
  const defaultMarkup = Number(pricing.default_markup || 5000);
  const categoryMarkups = pricing.category_markups || {};
  const itemMarkupOverrides = pricing.item_markup_overrides || [];
  const bundlingStatus = pricing.bundling_status || {};

  let rawItems: any[] = [];
  let isClosed = false;
  let isPremium = false;
  let apiCategories: any[] = [];

  try {
    const fetchOptions: any = forceRefresh
      ? { cache: 'no-store' }
      : { next: { revalidate: 180 } };
    const res = await fetch(`${API_BASE_URL}/kopken/menu?outlet=${encodeURIComponent(outletCode)}`, fetchOptions);

    if (res.ok) {
      const data = await res.json();
      rawItems = data.items || [];
      isClosed = Boolean(data.isClosed);
      apiCategories = data.categories || [];

      // Check mantan price for premium outlet rule: if mantan regular >= 22k -> 100% premium
      let mantanPrice: number | null = null;
      for (const it of rawItems) {
        const nm = (it.name || '').toLowerCase();
        if (nm.includes('kenangan mantan') && !nm.includes('oatside') && !nm.includes('frappe') && !nm.includes('bundl')) {
          mantanPrice = Number(it.normalPrice || it.outletPrice || it.price || 0);
          break;
        }
      }

      if (mantanPrice !== null && mantanPrice > 0) {
        isPremium = mantanPrice >= 22000;
      } else {
        isPremium = Boolean(data.premium) || checkIsPremiumOutlet({ code: outletCode, name: outletCode });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch remote menu:', err);
  }

  // Check outlet operational hours
  const outletInfo = await getOutletByCode(outletCode);
  if (outletInfo && outletInfo.canOrder === false) {
    isClosed = true;
  }

  const processedItems: MenuItem[] = [];

  for (const item of rawItems) {
    const key = item.key || item.id || item.code || item.name;
    const category = item.category || 'Coffee';
    const name = item.name || '';
    const origPrice = Number(item.normalPrice || item.outletPrice || item.price || 0);

    // Skip discontinued seasonals if marked notCarried
    if (item.notCarried) continue;

    // Determine markup fee
    let fee: number | null = null;
    const normKey = key.toLowerCase().replace(/[\s_-]/g, '');
    const normName = name.toLowerCase().replace(/[\s_-]/g, '');

    for (const ov of itemMarkupOverrides) {
      const ovName = String(ov.name || ov.key || '').toLowerCase().replace(/[\s_-]/g, '');
      if (ovName === normKey || ovName === normName || normName.includes(ovName)) {
        fee = Number(ov.fee);
        break;
      }
    }

    if (fee === null) {
      for (const [cKey, cFee] of Object.entries(categoryMarkups)) {
        if (cKey.toLowerCase() === category.toLowerCase()) {
          fee = Number(cFee);
          break;
        }
      }
    }

    if (fee === null) fee = defaultMarkup;

    let calculatedPrice = origPrice > 0 ? Math.round(origPrice * 0.5 + fee) : Number(item.price || 0);

    // Calculate large price
    let largePrice: number | null = null;
    let largeNormal: number | null = null;
    const hasLarge = Boolean(item.largePrice) || (Array.isArray(item.options?.sizes) && item.options.sizes.includes('Large'));

    if (hasLarge) {
      let largeFee = fee;
      for (const ov of itemMarkupOverrides) {
        const ovName = String(ov.name || '').toLowerCase();
        if (ovName.includes('(large)') && normName.includes(ovName.replace(/\(large\)/g, '').trim())) {
          largeFee = Number(ov.fee);
          break;
        }
      }

      if (item.largeNormal) {
        largeNormal = Number(item.largeNormal);
        largePrice = Math.round(largeNormal * 0.5 + largeFee);
      } else {
        largePrice = calculatedPrice + 3500;
        largeNormal = origPrice + 7000;
      }
    }

    processedItems.push({
      key,
      name,
      category,
      price: calculatedPrice,
      originalPrice: origPrice,
      desc: item.desc || item.description || '',
      img: item.img || item.image || 'https://placehold.co/200x200?text=Kopi+Kenangan',
      isSoldOut: Boolean(item.isSoldOut),
      isBundling: false,
      tag: item.tag || '',
      options: {
        temps: item.options?.temps || ['Ice', 'Hot'],
        sizes: item.options?.sizes || ['Regular', ...(hasLarge ? ['Large'] : [])],
        ices: item.options?.ices || ['Normal Ice', 'Less Ice'],
        sugars: item.options?.sugars || ['Normal Sugar', 'Less Sugar (50%)', 'No Sugar'],
      },
    });
  }

  // Bundling packages prepended for Regular outlets (NOT for Premium outlets)
  let finalItems = [...processedItems];
  if (!isPremium) {
    const activeBundling = BUNDLING_ITEMS.filter((b) => bundlingStatus[b.key] !== false);
    finalItems = [...activeBundling, ...processedItems];
  }

  const defaultCategories = [
    ...(!isPremium ? [{ id: 'item-bundling', name: '🎀 Paket Bundling', kind: 'item' }] : []),
    { id: 'item-coffee', name: 'Coffee', kind: 'item' },
    { id: 'item-non-coffee', name: 'Non Coffee', kind: 'item' },
    { id: 'item-frappe', name: 'Frappe', kind: 'item' },
    { id: 'item-food', name: 'Food & Toast', kind: 'item' },
  ];

  const total = finalItems.length;
  const available = finalItems.filter((i) => !i.isSoldOut).length;
  const soldOut = total - available;

  return {
    success: true,
    live: true,
    isClosed,
    premium: isPremium,
    brand: 'kopken',
    outletCode,
    categories: apiCategories.length > 0 ? apiCategories : defaultCategories,
    items: finalItems,
    stats: { total, available, soldOut },
    updatedAt: new Date().toISOString(),
  };
}
