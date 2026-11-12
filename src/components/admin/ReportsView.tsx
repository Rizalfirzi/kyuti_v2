'use client';

import React from 'react';
import { FileBarChart, DollarSign, Package, TrendingUp, Users, CheckCheck, ShoppingBag } from 'lucide-react';
import { Order } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GradientCard } from '@/components/ui/gradient-card';

interface ReportsViewProps {
  orders: Order[];
}

export function ReportsView({ orders }: ReportsViewProps) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const completedOrders = orders.filter((o) => o.status === 'selesai');
  const completedRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const readyOrders = orders.filter((o) => o.status === 'siap');

  return (
    <div className="space-y-6">
      {/* 1. Header Gradient Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white bg-gradient-to-r from-[#FF4E9B] to-[#E92D79] shadow-md">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <h2 className="text-xl md:text-2xl font-black tracking-tight">Laporan Penjualan &amp; Statistik Toko</h2>
        <p className="text-xs text-pink-100 mt-1 max-w-xl leading-relaxed font-medium">
          Data akumulasi transaksi jastip Kopi Kenangan Kedai Kyuti. Pantau pertumbuhan omset, volume pesanan, dan efisiensi penyelesaian pesanan pelanggan.
        </p>
      </div>

      {/* 2. DropX Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GradientCard
          title="Total Omset Pesanan"
          value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
          subtitle={`Dari ${totalOrders} transaksi terdaftar`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="pink"
        />

        <GradientCard
          title="Nilai Rata-Rata Keranjang"
          value={`Rp ${avgOrderValue.toLocaleString('id-ID')}`}
          subtitle="Rata-rata belanja per pelanggan"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="purple"
        />

        <GradientCard
          title="Pesanan Sukses Selesai"
          value={`${completedOrders.length} Order`}
          subtitle={`Rp ${completedRevenue.toLocaleString('id-ID')} terselesaikan`}
          icon={<CheckCheck className="w-5 h-5" />}
          variant="green"
        />
      </div>

      {/* 3. Detailed Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Status Distribusi Pesanan</CardTitle>
          <CardDescription>Komposisi pesanan berdasarkan tahapan pemrosesan saat ini</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
              <span className="text-[11px] font-bold text-amber-700 block">Diproses</span>
              <p className="text-xl font-black text-amber-900 mt-1">
                {orders.filter((o) => o.status === 'diproses').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200/60">
              <span className="text-[11px] font-bold text-[#E92D79] block">Disiapkan</span>
              <p className="text-xl font-black text-[#E92D79] mt-1">
                {orders.filter((o) => o.status === 'disiapkan').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
              <span className="text-[11px] font-bold text-emerald-700 block">Siap Diambil</span>
              <p className="text-xl font-black text-emerald-900 mt-1">{readyOrders.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/60">
              <span className="text-[11px] font-bold text-sky-700 block">Pesanan Diantar</span>
              <p className="text-xl font-black text-sky-900 mt-1">
                {orders.filter((o) => o.status === 'diantar').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
