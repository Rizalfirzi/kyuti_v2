import { NextRequest, NextResponse } from 'next/server';
import { OrderStore } from '@/lib/blob-db';
import { OrderStatus, StatusHistoryItem } from '@/lib/types';

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
  selesai: {
    title: 'Pesanan Selesai',
    desc: 'Terima kasih telah memesan di Kedai Kyuti ♡',
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
    const currentTimeStr = formatTime(now);

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
    if (body.status && body.status !== order.status) {
      const newStatus = body.status as OrderStatus;
      const statusMeta = STATUS_TEXT_MAP[newStatus] || STATUS_TEXT_MAP.diproses;

      order.status = newStatus;
      order.statusText = statusMeta.title;
      order.statusDesc = statusMeta.desc;

      const newHistoryItem: StatusHistoryItem = {
        status: newStatus,
        title: statusMeta.title,
        desc: statusMeta.desc,
        time: currentTimeStr,
        timestamp: now.getTime(),
        proofPhotoUrl: body.proofPhotoUrl || order.proofPhotoUrl || undefined,
      };

      order.statusHistory = [...order.statusHistory, newHistoryItem];
    } else if (body.proofPhotoUrl && order.statusHistory.length > 0) {
      // Update proofPhotoUrl on the latest history entry
      const lastIndex = order.statusHistory.length - 1;
      order.statusHistory[lastIndex].proofPhotoUrl = body.proofPhotoUrl;
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

