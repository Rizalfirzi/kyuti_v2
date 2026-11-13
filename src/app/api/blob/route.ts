import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Security check: only allow fetching from vercel-storage.com
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith('vercel-storage.com')) {
      return new NextResponse('Invalid origin', { status: 403 });
    }

    const headers: Record<string, string> = {};
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`;
    }

    const res = await fetch(url, { headers, cache: 'force-cache' });
    if (!res.ok) {
      return new NextResponse('Failed to fetch blob', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err: any) {
    return new NextResponse('Error loading blob image', { status: 500 });
  }
}

