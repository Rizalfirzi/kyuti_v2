import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REVIEWS_FILE = path.join(process.cwd(), 'data', 'reviews.json');

const DEFAULT_REVIEWS = [
  {
    id: 'rev_1',
    name: 'Alya Putri',
    rating: 5,
    menu: 'Kopi Kenangan Mantan + Taro Cloud',
    comment: 'Puas banget order jasdor di Kedai Kyuti! Fast response dan harganya hemat banget 50%. Admin ramah pol ♡',
    photo: '',
    likes: 12,
    date: '2026-10-25',
    verified: true,
  },
  {
    id: 'rev_2',
    name: 'Bima Satria',
    rating: 5,
    menu: 'Paket Bundling 2 Cup Large',
    comment: 'Langganan tiap minggu buat traktiran kantor. Proses cepet banget pas jam istirahat siang.',
    photo: '',
    likes: 8,
    date: '2026-10-28',
    verified: true,
  },
];

function getReviews(): any[] {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const content = fs.readFileSync(REVIEWS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : DEFAULT_REVIEWS;
    }
  } catch (err) {
    console.warn('Error reading reviews:', err);
  }
  return DEFAULT_REVIEWS;
}

function saveReviews(reviews: any[]) {
  try {
    const dir = path.dirname(REVIEWS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving reviews:', err);
    return false;
  }
}

export async function GET() {
  const reviews = getReviews();
  return NextResponse.json({
    success: true,
    reviews,
    total: reviews.length,
    average: 4.9,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if like action
    if (body.action === 'like' && body.id) {
      const reviews = getReviews();
      const target = reviews.find((r) => r.id === body.id);
      if (target) {
        target.likes = (target.likes || 0) + 1;
        saveReviews(reviews);
        return NextResponse.json({ success: true, likes: target.likes });
      }
      return NextResponse.json({ success: false, message: 'Review tidak ditemukan' }, { status: 404 });
    }

    if (!body.name || !body.comment) {
      return NextResponse.json({ success: false, message: 'Nama dan ulasan wajib diisi' }, { status: 400 });
    }

    const reviews = getReviews();
    const newRev = {
      id: `rev_${Date.now()}`,
      name: String(body.name).trim(),
      rating: Number(body.rating) || 5,
      menu: body.menu ? String(body.menu).trim() : 'Kopi Kenangan',
      comment: String(body.comment).trim(),
      photo: body.photo || '',
      likes: 0,
      date: new Date().toISOString().split('T')[0],
      verified: true,
    };

    reviews.unshift(newRev);
    saveReviews(reviews);

    return NextResponse.json({
      success: true,
      message: 'Terima kasih atas ulasan manis kamu! ♡',
      review: newRev,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengirim ulasan', error: err?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID review diperlukan' }, { status: 400 });
    }
    const reviews = getReviews().filter((r) => r.id !== id);
    saveReviews(reviews);
    return NextResponse.json({ success: true, message: 'Ulasan berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus ulasan', error: err?.message },
      { status: 500 }
    );
  }
}

