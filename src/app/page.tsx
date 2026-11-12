import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import {
  BUNDLING_ITEMS,
  STORE_CONFIG,
  PREMIUM_CODES,
  PREMIUM_NAMES,
  fetchOutletsData,
  fetchOutletMenu,
} from '@/lib/kopken-api';
import LegacyHtmlContainer from '@/components/LegacyHtmlContainer';

export const metadata: Metadata = {
  title: 'Kedai Kyuti (kedaikyuti.my.id) — JASDOR KOPI KENANGAN',
  description:
    'Kedai Kyuti (kedaikyuti.my.id) - Jasa Titip Order (Jasdor) Kopi Kenangan Murah. Diskon 50% + fee hemat, stok real-time, pesan via WhatsApp.',
};

export const dynamic = 'force-dynamic';

function getInitialPricing() {
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
    single_item_fee: 0,
    plastic_bag_fee: 1000,
    bundling_status: {
      bundle_2_cup_large: true,
      bundle_2_frappe: true,
      promo_minuman_special: true,
      bundle_hemat_3_item: true,
    },
    disabled_bundling_options: [],
    web_hours: {
      enabled: true,
      open: '09:00',
      close: '12:00',
      force_status: 'auto',
      closed_message:
        '♡ Maaf, jam operasional pemesanan Kedai Kyuti saat ini sedang tutup. Jam layanan pemesanan kami adalah pukul 09.00 - 12.00 WIB. Kamu tetap bisa melihat-lihat menu terlebih dahulu ya! ♡',
    },
    bgm: {
      enabled: true,
      default_volume: 0.4,
      playlist: [
        { title: 'Negoro Angin (Trending TikTok ♫)', artist: 'Denny Caknan', youtube_id: '6kKuzB_YOmc' },
        { title: 'Sesi Potret', artist: 'eńau ft. Ari Lesmana', youtube_id: 'CSKr9seKdgI' },
        { title: 'Dunia Yang Nanti', artist: 'Raim Laode', youtube_id: 'awWKxGftWh4' },
      ],
    },
  };
}

export default async function Page() {
  // Read HTML template
  const templatePath = path.join(process.cwd(), 'scratch', 'page-template.html');
  let rawHtml = '';
  if (fs.existsSync(templatePath)) {
    rawHtml = fs.readFileSync(templatePath, 'utf-8');
  }

  // Pre-fetch live outlets data
  let initialOutlets: any[] = [];
  try {
    const outletsData = await fetchOutletsData();
    initialOutlets = outletsData.outlets || [];
  } catch (e) {
    console.warn('Failed to prefetch outlets on server:', e);
  }

  // Select initial outlet (default LA.CODEFIN or first available)
  let initialOutlet =
    initialOutlets.find((o) => o.code === STORE_CONFIG.defaultOutlet) || initialOutlets[0] || {
      code: 'LA.CODEFIN',
      name: 'La Codefin Kemang',
      address: 'La Codefin Kemang, GF, Jl. Kemang I No. 3-5, RT.11/RW.1, Bangka, Mampang Prapatan, Jakarta Selatan - 12780',
      isOpen: true,
      canOrder: true,
      statusText: 'Buka',
      hours: '07:00 - 21:30',
      img: 'https://cdn.kopikenangan.com/public/da484154-47b1-a756-54a4-8b3490fb0eae',
      isPremium: false,
    };

  // Pre-fetch live menu for initial outlet
  let initialMenu: any = { items: [], stats: { total: 0, available: 0, soldOut: 0 } };
  try {
    initialMenu = await fetchOutletMenu(initialOutlet.code);
  } catch (e) {
    console.warn('Failed to prefetch initial menu:', e);
  }

  const pricing = getInitialPricing();
  const day = new Date().getDate();

  const initialData = {
    outlet: initialOutlet,
    outlets: initialOutlets,
    menu: initialMenu,
    storeName: 'Kedai Kyuti',
    adminPhone: STORE_CONFIG.adminPhone,
    orderPrefix: 'KYUTI',
    waBaseLink: `https://wa.me/${STORE_CONFIG.adminPhone}`,
    singleItemFee: pricing.single_item_fee || 0,
    plasticBagFee: pricing.plastic_bag_fee || 1000,
    bundlingItems: BUNDLING_ITEMS,
    premiumList: PREMIUM_NAMES,
    premiumCodes: PREMIUM_CODES,
    pricing: {
      defaultMarkup: pricing.default_markup || 5000,
      categoryMarkups: pricing.category_markups || {},
      itemMarkupOverrides: pricing.item_markup_overrides || [],
      bundlingStatus: pricing.bundling_status || {},
      disabledBundlingOptions: pricing.disabled_bundling_options || [],
    },
    addons: [
      { id: 'boba', name: 'Boba', price: 4000 },
      { id: 'grass_jelly', name: 'Grass Jelly', price: 4000 },
      { id: 'coconut_jelly', name: 'Coconut Jelly', price: 4000 },
      { id: 'espresso_shot', name: 'Extra Espresso Shot', price: 5000 },
    ],
    wifi: {
      ssid: 'Teman Kenangan',
      password: `KopiBikinSemangat@${day}`,
      date: 'Hari Ini',
    },
    webHours: {
      enabled: true,
      open: pricing.web_hours?.open || '09:00',
      close: pricing.web_hours?.close || '12:00',
      force_status: pricing.web_hours?.force_status || 'auto',
      isOpen: true,
      statusText: 'Pemesanan Buka',
    },
    bgm: pricing.bgm || { enabled: true, playlist: [] },
    reviewsUrl: '/api/reviews',
  };

  const initialDataScript = `
    <script>
      window.INITIAL_DATA = ${JSON.stringify(initialData)};
    </script>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script src="/assets/js/app.js"></script>
  `;

  const finalHtml = rawHtml + initialDataScript;

  return <LegacyHtmlContainer html={finalHtml} initialData={initialData} />;
}
