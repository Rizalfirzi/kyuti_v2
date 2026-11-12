import { NextRequest, NextResponse } from 'next/server';
import { OrderStore } from '@/lib/blob-db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File | null;
    const title = (formData.get('title') as string) || 'Custom Audio';

    if (!file) {
      return NextResponse.json({ success: false, message: 'File audio tidak ditemukan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save audio via OrderStore (Vercel Blob / local upload)
    const url = await OrderStore.uploadProofPhoto(buffer, file.name, file.type || 'audio/mpeg');

    return NextResponse.json({
      success: true,
      url,
      title,
      message: 'Lagu audio berhasil diunggah ♡',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengunggah audio', error: err?.message },
      { status: 500 }
    );
  }
}

