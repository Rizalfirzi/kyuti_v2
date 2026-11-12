import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PRICING_FILE = path.join(process.cwd(), 'data', 'pricing_settings.json');

const DEFAULT_PRICING = {
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
  item_markup_overrides: [],
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
    closed_message:
      '♡ Maaf, jam operasional pemesanan Kedai Kyuti saat ini sedang tutup. Jam layanan pemesanan kami adalah pukul 09.00 - 12.00 WIB. Kamu tetap bisa melihat-lihat menu terlebih dahulu ya! ♡',
    force_status: 'auto',
  },
  bgm: {
    enabled: true,
    default_volume: 0.4,
    playlist: [
      {
        title: 'Negoro Angin (Trending TikTok ♫)',
        artist: 'Denny Caknan',
        youtube_id: '6kKuzB_YOmc',
        src: '',
      },
      {
        title: 'Sesi Potret',
        artist: 'eńau ft. Ari Lesmana',
        youtube_id: 'CSKr9seKdgI',
        src: '',
      },
      {
        title: 'Dunia Yang Nanti',
        artist: 'Raim Laode',
        youtube_id: 'awWKxGftWh4',
        src: '',
      },
    ],
  },
  admin_passcode: 'WHOSUTII26',
};

function getPricingData() {
  try {
    if (fs.existsSync(PRICING_FILE)) {
      const content = fs.readFileSync(PRICING_FILE, 'utf-8');
      return { ...DEFAULT_PRICING, ...JSON.parse(content) };
    }
  } catch (err) {
    console.warn('Error reading pricing settings:', err);
  }
  return DEFAULT_PRICING;
}

function savePricingData(data: any) {
  try {
    const dir = path.dirname(PRICING_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PRICING_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving pricing settings:', err);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const data = getPricingData();

  // If code matches admin_passcode, include admin details
  return NextResponse.json({
    success: true,
    pricing: data,
    settings: data,
    web_hours: data.web_hours,
    bgm: data.bgm,
    is_admin: code === (data.admin_passcode || 'WHOSUTII26'),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const current = getPricingData();

    // Verify passcode if required
    const passcode = body.passcode || body.admin_passcode;
    if (passcode && passcode.toUpperCase() !== (current.admin_passcode || 'WHOSUTII26').toUpperCase()) {
      return NextResponse.json(
        { success: false, message: 'Passcode admin salah' },
        { status: 401 }
      );
    }

    const updated = { ...current, ...body };
    savePricingData(updated);

    return NextResponse.json({
      success: true,
      message: 'Pengaturan harga & operasional berhasil disimpan ♡',
      pricing: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan pengaturan', error: error?.message },
      { status: 500 }
    );
  }
}

