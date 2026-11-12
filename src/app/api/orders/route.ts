import { NextRequest, NextResponse } from 'next/server';
import { OrderStore } from '@/lib/blob-db';
import { Order, OrderStatus, StatusHistoryItem } from '@/lib/types';
import { STORE_CONFIG } from '@/lib/kopken-api';

function formatTime(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}.${minutes}`;
}

const STATUS_TEXT_MAP: Record<OrderStatus, { title: string; desc: string }> = {
  diterima: {
    title: 'Pesanan Diterima',
    desc: 'Pesanan kamu sudah kami terima.',
  },
  diproses: {
    title: 'Pesanan Diproses',
    desc: 'Pesanan kamu sedang diproses oleh outlet.',
  },
  disiapkan: {
    title: 'Sedang Disiapkan',
    desc: 'Barista sedang menyiapkan pesanan kamu.',
  },
  siap: {
    title: 'Siap Diambil',
    desc: 'Pesanan kamu sudah selesai dan siap untuk diambil.',
  },
  diantar: {
    title: 'Pesanan Diantar',
    desc: 'Pesanan kamu sedang dalam perjalanan diantar oleh kurir ke alamatmu.',
  },
  selesai: {
    title: 'Pesanan Diterima',
    desc: 'Pesanan sudah sampai dan diterima. Selamat menikmati! ♡',
  },
};

export async function GET() {
  try {
    const orders = await OrderStore.getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal memuat pesanan', error: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date();
    const currentTimeStr = formatTime(now);

    const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const kopkenNo = body.kopkenOrderNo ? String(body.kopkenOrderNo).trim() : randomSuffix;
    const orderCode = body.orderCode ? String(body.orderCode).trim() : `KYUTI-${kopkenNo}`;

    const status: OrderStatus = (body.status as OrderStatus) || 'diterima';
    const statusMeta = STATUS_TEXT_MAP[status] || STATUS_TEXT_MAP.diterima;

    const initialHistory: StatusHistoryItem[] = body.statusHistory && body.statusHistory.length > 0
      ? body.statusHistory
      : [
          {
            status: 'diterima',
            title: STATUS_TEXT_MAP.diterima.title,
            desc: STATUS_TEXT_MAP.diterima.desc,
            time: currentTimeStr,
            timestamp: now.getTime(),
          },
        ];

    // If initial status is not 'diterima', add it to history
    if (status !== 'diterima' && !initialHistory.some((h) => h.status === status)) {
      initialHistory.push({
        status,
        title: statusMeta.title,
        desc: statusMeta.desc,
        time: currentTimeStr,
        timestamp: now.getTime(),
        proofPhotoUrl: body.proofPhotoUrl || undefined,
      });
    }

    const newOrder: Order = {
      orderCode,
      kopkenOrderNo: kopkenNo,
      customerName: body.customerName ? String(body.customerName).trim() : 'Kyuties',
      customerPhone: body.customerPhone ? String(body.customerPhone).trim() : '',
      outletCode: body.outletCode || STORE_CONFIG.defaultOutlet,
      outletName: body.outletName || 'Kopi Kenangan Codefin Kemang',
      pickupTime: body.pickupTime || 'Sekarang',
      notes: body.notes ? String(body.notes).trim() : '',
      status,
      statusText: statusMeta.title,
      statusDesc: statusMeta.desc,
      proofPhotoUrl: body.proofPhotoUrl || '',
      statusHistory: initialHistory,
      items: body.items || [],
      subtotal: Number(body.subtotal) || 0,
      plasticBagQty: Number(body.plasticBagQty) || 0,
      plasticBagFee: Number(body.plasticBagFee) || 0,
      singleItemFee: Number(body.singleItemFee) || 0,
      total: Number(body.total) || 0,
      createdAt: body.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const saved = await OrderStore.upsertOrder(newOrder);

    // Build tracking URL
    const host = request.headers.get('host') || STORE_CONFIG.domain;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const trackingUrl = `${protocol}://${host}/track/${saved.orderCode}`;

    // Build WhatsApp message
    let waMsg = `୨୧ *FORMAT ORDER KEDAI KYUTI* ୨୧\n`;
    waMsg += `--------------------------------------\n`;
    waMsg += `Kode Pesanan: *#${saved.kopkenOrderNo}* (${saved.orderCode})\n`;
    waMsg += `Outlet: *${saved.outletName}*\n`;
    waMsg += `Nama: *${saved.customerName}*\n`;
    if (saved.customerPhone) waMsg += `No. HP: ${saved.customerPhone}\n`;
    waMsg += `Waktu Pickup: *${saved.pickupTime}*\n`;
    waMsg += `--------------------------------------\n`;
    waMsg += `*Detail Menu:*\n`;

    saved.items.forEach((it, idx) => {
      const opts: string[] = [];
      if (it.size) opts.push(it.size);
      if (it.temp) opts.push(it.temp);
      if (it.ice) opts.push(it.ice);
      if (it.sugar) opts.push(it.sugar);
      const optStr = opts.length > 0 ? ` (${opts.join(', ')})` : '';

      waMsg += `${idx + 1}. *${it.name}* x${it.qty}${optStr}\n`;
      if (it.bundleChoices) {
        waMsg += `    Isi Paket: _${it.bundleChoices}_\n`;
      }
      if (it.addons && it.addons.length > 0) {
        const addonStrs = it.addons.map((a) => `${a.name} (+Rp ${a.price.toLocaleString('id-ID')})`);
        waMsg += `    + Topping: _${addonStrs.join(', ')}_\n`;
      }
      waMsg += `    Harga: Rp ${it.price.toLocaleString('id-ID')} | Subtotal: Rp ${it.subtotal.toLocaleString('id-ID')}\n`;
      if (it.note) {
        waMsg += `    Catatan: _${it.note}_\n`;
      }
    });

    waMsg += `--------------------------------------\n`;
    waMsg += `Subtotal Menu: Rp ${saved.subtotal.toLocaleString('id-ID')}\n`;
    if (saved.plasticBagQty && saved.plasticBagQty > 0) {
      waMsg += `Kantung Belanja Plastik: +Rp ${(saved.plasticBagFee || 1000).toLocaleString('id-ID')}\n`;
    }
    if (saved.notes) {
      waMsg += `Catatan Tambahan: _${saved.notes}_\n`;
    }
    waMsg += `--------------------------------------\n`;
    waMsg += `*TOTAL BAYAR: Rp ${saved.total.toLocaleString('id-ID')}*\n\n`;

    // Add Live Tracking Link
    waMsg += `🔍 *Lacak Status Pesanan:* \n${trackingUrl}\n\n`;
    waMsg += `𝒯𝒽𝒶𝓃𝓀 𝓎𝑜𝓊 𝒻𝑜𝓇 𝒸𝒽𝑜𝑜𝓈𝒾𝓃𝑔 𝓀𝑒𝒹𝒶𝒾 𝓀𝓎𝓊𝓉𝒾! ୨୧ ♡\n`;
    waMsg += `Mohon diproses ya min, terima kasih! 🌷✨`;

    const waUrl = `https://wa.me/${STORE_CONFIG.adminPhone}?text=${encodeURIComponent(waMsg)}`;

    return NextResponse.json({
      success: true,
      order: saved,
      trackingUrl,
      waMessage: waMsg,
      waUrl,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat pesanan', error: error?.message },
      { status: 500 }
    );
  }
}

