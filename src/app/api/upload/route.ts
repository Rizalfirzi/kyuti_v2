import { NextRequest, NextResponse } from 'next/server';
import { OrderStore } from '@/lib/blob-db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const url = await OrderStore.uploadProofPhoto(buffer, file.name, file.type || 'image/jpeg');

    return NextResponse.json({
      success: true,
      url,
      message: 'Foto bukti berhasil diunggah ke Vercel Blob',
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengunggah foto', error: error?.message },
      { status: 500 }
    );
  }
}

