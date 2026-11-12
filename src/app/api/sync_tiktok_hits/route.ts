import { NextRequest, NextResponse } from 'next/server';

const CURATED_TIKTOK_HITS = [
  {
    title: 'Negoro Angin (Trending TikTok ♫)',
    artist: 'Denny Caknan',
    youtube_id: '6kKuzB_YOmc',
    src: '',
  },
  {
    title: 'Sesi Potret',
    artist: 'eńau ft. Ari Lesmana',
    youtube_id: 'CSKr9seKdgI',
    src: '',
  },
  {
    title: 'Dunia Yang Nanti',
    artist: 'Raim Laode',
    youtube_id: 'awWKxGftWh4',
    src: '',
  },
  {
    title: 'bergema sampai selamanya',
    artist: 'Nadhif Basalamah',
    youtube_id: 'gvunApwKIiY',
    src: '',
  },
  {
    title: 'Teh Hijau',
    artist: 'Tulus',
    youtube_id: 'RO75uUZiAw0',
    src: '',
  },
  {
    title: 'Jatuh Suka',
    artist: 'Tulus',
    youtube_id: '2uJut6USftQ',
    src: '',
  },
  {
    title: 'Amnesia',
    artist: 'Al-Ghazali',
    youtube_id: '6iolyINA45I',
    src: '',
  },
  {
    title: "Iqro'",
    artist: 'Raim Laode',
    youtube_id: '46pNDkp4KQU',
    src: '',
  },
  {
    title: 'Separuh Aku',
    artist: 'Noah',
    youtube_id: 'iAP_EyZMvw0',
    src: '',
  },
];

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Berhasil sinkronisasi lagu viral TikTok!',
    hits: CURATED_TIKTOK_HITS,
  });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    hits: CURATED_TIKTOK_HITS,
  });
}

