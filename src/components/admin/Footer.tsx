'use client';

import React from 'react';

export function AdminFooter() {
  return (
    <footer className="mt-8 border-t border-pink-100/70 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500 font-medium">
      <div className="flex items-center gap-1.5">
        <span>&copy; {new Date().getFullYear()}</span>
        <b className="text-gray-800">Kedai Kyuti</b>
        <span>&bull; Jasdor Kopi Kenangan Murah</span>
      </div>
      <div className="text-[11px] text-gray-500">
        Diskon 50% + Fee Hemat &bull; Stok Real-Time &bull; Pelayanan Ramah ♡
      </div>
    </footer>
  );
}

