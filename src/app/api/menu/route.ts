import { NextRequest, NextResponse } from 'next/server';
import { fetchOutletMenu, STORE_CONFIG } from '@/lib/kopken-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const outletCode = searchParams.get('outlet') || searchParams.get('outletCode') || STORE_CONFIG.defaultOutlet;
    const refreshParam = searchParams.get('refresh');
    const forceRefresh = refreshParam === '1' || refreshParam === 'true';

    const data = await fetchOutletMenu(outletCode, forceRefresh);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data menu', error: error?.message },
      { status: 500 }
    );
  }
}
