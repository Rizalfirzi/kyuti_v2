import { NextRequest, NextResponse } from 'next/server';
import { OrderStore } from '@/lib/blob-db';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') || '';
  if (!code.trim()) {
    return NextResponse.json({ success: false, message: 'Kode pesanan wajib diisi' }, { status: 400 });
  }

  const order = await OrderStore.findOrderByCode(code);
  if (!order) {
    return NextResponse.json(
      { success: false, message: `Pesanan dengan kode "${code}" tidak ditemukan` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    found: true,
    order: {
      code: order.orderCode,
      kopkenOrderNo: order.kopkenOrderNo,
      customerName: order.customerName,
      status: order.status,
      statusText: order.statusText,
      statusDesc: order.statusDesc,
      outletName: order.outletName,
      pickup: order.pickupTime,
      total: order.total,
      subtotal: order.subtotal,
      items: order.items,
      proofPhotoUrl: order.proofPhotoUrl,
      statusHistory: order.statusHistory,
      updatedAt: order.updatedAt,
    },
  });
}

