import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const outlet = searchParams.get('outlet') || 'LA.CODEFIN';
  const code = searchParams.get('code') || '';
  const key = searchParams.get('key') || '';

  try {
    const upstreamUrl = `https://tixandcoffee.developerngantuk.my.id/api/kopken/item?outlet=${encodeURIComponent(outlet)}&code=${encodeURIComponent(code)}&key=${encodeURIComponent(key)}`;
    const res = await fetch(upstreamUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn('Failed to fetch item details from upstream:', err);
  }

  // Fallback addons
  return NextResponse.json({
    success: true,
    item: {
      key,
      code,
      name: 'Kopi Kenangan Drink',
      addons: [
        { id: 'boba', name: 'Boba', price: 4000 },
        { id: 'grass_jelly', name: 'Grass Jelly', price: 4000 },
        { id: 'coconut_jelly', name: 'Coconut Jelly', price: 4000 },
        { id: 'oreo', name: 'Oreo Crumbs', price: 4000 },
        { id: 'espresso_shot', name: 'Extra Espresso Shot', price: 5000 },
      ],
    },
  });
}

