'use client';

import React from 'react';
import { FileBarChart, DollarSign, Package, TrendingUp, Users } from 'lucide-react';
import { Order } from '@/lib/types';

interface ReportsViewProps {
  orders: Order[];
}

export function ReportsView({ orders }: ReportsViewProps) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const completedOrders = orders.filter((o) => o.status === 'selesai');
  const completedRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#E92D79] to-[#FF5A9E] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl md:text-2xl font-black tracking-tight">Laporan Penjualan &amp; Transaksi</h2>
        <p className="text-xs text-pink-100 mt-1 max-w-xl leading-relaxed">
          Statistik akumulasi transaksi pelanggan melalui platform Jasdor Kopi Kenangan Kedai Kyuti.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-pink-100/80 shadow-sm">
          <span className="text-xs font-bold text-gray-400 block mb-1">Total Omset Pesanan</span>
          <h3 className="text-2xl font-black text-gray-900">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
          <p className="text-[11px] text-gray-400 mt-1">Dari {totalOrders} transaksi terdaftar</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-pink-100/80 shadow-sm">
          <span className="text-xs font-bold text-gray-400 block mb-1">Rata-rata Nilai Order</span>
          <h3 className="text-2xl font-black text-gray-900">Rp {avgOrderValue.toLocaleString('id-ID')}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Nilai keranjang rata-rata</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-pink-100/80 shadow-sm">
          <span className="text-xs font-bold text-gray-400 block mb-1">Pesanan Sukses Selesai</span>
          <h3 className="text-2xl font-black text-[#E92D79]">{completedOrders.length} Pesanan</h3>
          <p className="text-[11px] text-gray-400 mt-1">Rp {completedRevenue.toLocaleString('id-ID')} terselesaikan</p>
        </div>
      </div>
    </div>
  );
}

