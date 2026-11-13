import { NextRequest, NextResponse } from 'next/server';
import { OrderStore } from '@/lib/blob-db';
import { OrderStatus, StatusHistoryItem } from '@/lib/types';

function formatWibTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replace(':', '.');
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

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    const order = await OrderStore.findOrderByCode(code);

    if (!order) {
      return NextResponse.json(
        { success: false, message: `Pesanan dengan kode "${code}" tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mencari pesanan', error: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    const order = await OrderStore.findOrderByCode(code);

    if (!order) {
      return NextResponse.json(
        { success: false, message: `Pesanan dengan kode "${code}" tidak ditemukan` },
        { status: 404 }
      );
    }

    const body = await request.json();
    const now = new Date();
    const currentTimeStr = body.statusTime ? String(body.statusTime).trim() : formatWibTime(now);

    // Update customerName if provided
    if (body.customerName) {
      order.customerName = String(body.customerName).trim();
    }

    // Update kopkenOrderNo if provided
    if (body.kopkenOrderNo) {
      order.kopkenOrderNo = String(body.kopkenOrderNo).trim();
    }

    // Update proofPhotoUrl if provided
    if (body.proofPhotoUrl) {
      order.proofPhotoUrl = String(body.proofPhotoUrl).trim();
    }

    // Update status if provided
    if (body.status) {
      const newStatus = body.status as OrderStatus;
      const statusMeta = STATUS_TEXT_MAP[newStatus] || STATUS_TEXT_MAP.diproses;

      order.status = newStatus;
      order.statusText = statusMeta.title;
      order.statusDesc = statusMeta.desc;

      const historyList = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
      const existingIdx = historyList.findIndex((h) => h.status === newStatus);

      const historyItem: StatusHistoryItem = {
        status: newStatus,
        title: statusMeta.title,
        desc: statusMeta.desc,
        time: currentTimeStr,
        timestamp: now.getTime(),
        proofPhotoUrl: body.proofPhotoUrl || order.proofPhotoUrl || undefined,
      };

      if (existingIdx >= 0) {
        historyList[existingIdx] = {
          ...historyList[existingIdx],
          ...historyItem,
        };
      } else {
        historyList.push(historyItem);
      }

      order.statusHistory = historyList;
    } else if (order.statusHistory && order.statusHistory.length > 0) {
      // Update proofPhotoUrl or statusTime on the latest history entry
      const lastIndex = order.statusHistory.length - 1;
      if (body.proofPhotoUrl) {
        order.statusHistory[lastIndex].proofPhotoUrl = body.proofPhotoUrl;
      }
      if (body.statusTime) {
        order.statusHistory[lastIndex].time = String(body.statusTime).trim();
      }
    }

    order.updatedAt = now.toISOString();

    const saved = await OrderStore.upsertOrder(order);

    return NextResponse.json({
      success: true,
      order: saved,
      message: 'Status pesanan berhasil diperbarui',
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui pesanan', error: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    const deleted = await OrderStore.deleteOrder(code);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: `Pesanan dengan kode "${code}" tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Pesanan berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus pesanan', error: error?.message },
      { status: 500 }
    );
  }
}

