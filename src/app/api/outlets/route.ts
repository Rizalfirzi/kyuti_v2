import { NextRequest, NextResponse } from 'next/server';
import { fetchOutletsData } from '@/lib/kopken-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || undefined;
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const lat = latStr !== null ? parseFloat(latStr) : undefined;
    const lng = lngStr !== null ? parseFloat(lngStr) : undefined;

    const data = await fetchOutletsData(query, lat, lng);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data outlet', error: error?.message },
      { status: 500 }
    );
  }
}
