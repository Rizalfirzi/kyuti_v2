'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowLeft, Coffee, Sparkles } from 'lucide-react';

export default function TrackSearchPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const clean = code.trim().replace('#', '');
    router.push(`/track/${clean}`);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-7 shadow-lg border border-pink-100 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 mb-6 bg-pink-50 px-3 py-1.5 rounded-full"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Menu
        </Link>

        <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center mx-auto mb-4">
          <Coffee className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Lacak Pesanan Kamu ♡
        </h1>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Masukkan Nomor Order Kopi Kenangan atau Kode Pesanan Kedai Kyuti kamu untuk memantau status pembuatan dan bukti foto.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Contoh: 80537 atau KYUTI-80537"
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-pink-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition"
              autoFocus
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md shadow-pink-200 transition flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" /> Cek Status Pesanan
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-pink-50 text-[11px] text-gray-400">
          Kedai Kyuti • Jasdor Kopi Kenangan Indonesia ♡
        </div>
      </div>
    </div>
  );
}

