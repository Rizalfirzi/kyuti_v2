import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const day = new Date().getDate();
  const todayPass = `KopiBikinSemangat@${day}`;

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const now = new Date();
  const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  return NextResponse.json({
    success: true,
    date: dateStr,
    wifi: {
      ssid: 'Teman Kenangan',
      password: todayPass,
    },
  });
}

