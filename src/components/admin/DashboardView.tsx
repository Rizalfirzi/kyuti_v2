'use client';

import React from 'react';
import {
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  Eye,
} from 'lucide-react';
import { Order } from '@/lib/types';

interface DashboardViewProps {
  orders: Order[];
  onOpenCreate: () => void;
  onSelectOrder: (order: Order) => void;
}

export function DashboardView({ orders, onOpenCreate, onSelectOrder }: DashboardViewProps) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = orders.filter((o) => ['diterima', 'diproses', 'disiapkan'].includes(o.status)).length;
  const readyCount = orders.filter((o) => o.status === 'siap').length;
  const completedCount = orders.filter((o) => o.status === 'selesai').length;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Penjualan */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Penjualan</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-gray-900">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
            <p className="text-[11px] text-gray-400 mt-1">Akumulasi seluruh transaksi</p>
          </div>
        </div>

        {/* Total Pesanan */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pesanan</span>
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#E92D79] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-gray-900">{totalOrders} Pesanan</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">{completedCount} pesanan selesai diterima</p>
          </div>
        </div>

        {/* Perlu Diproses */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Perlu Diproses</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-gray-900">{pendingCount} Pesanan</h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Status: Diterima / Diproses / Disiapkan</p>
          </div>
        </div>

        {/* Siap Diambil */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Siap Diambil</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-gray-900">{readyCount} Pesanan</h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Menunggu diambil customer / diantar</p>
          </div>
        </div>
      </div>

      {/* Quick Action & Recent Orders */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-pink-50">
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Pesanan Terbaru</h3>
            <p className="text-xs text-gray-400 mt-0.5">Monitoring pesanan yang baru masuk</p>
          </div>
          <button
            type="button"
            onClick={onOpenCreate}
            className="px-5 py-2.5 bg-[#E92D79] hover:bg-[#D81B60] text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto border-0"
          >
            <PlusCircle className="w-4 h-4" /> Tambah Pesanan Baru
          </button>
        </div>

        <div className="mt-4 divide-y divide-gray-100">
          {orders.slice(0, 5).map((order) => {
            const displayNo = order.kopkenOrderNo
              ? `#${order.kopkenOrderNo}`
              : `#${order.orderCode.replace('KYUTI-', '')}`;
            return (
              <div
                key={order.orderCode}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-pink-50/30 px-3 rounded-2xl transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E92D79] flex items-center justify-center font-bold text-xs">
                    ☕
                  </div>
                  <div>
                    <b className="text-xs text-gray-900 block">{displayNo} &bull; {order.customerName}</b>
                    <span className="text-[11px] text-gray-400 capitalize">Status: {order.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectOrder(order)}
                    className="p-2 text-gray-400 hover:text-[#E92D79] rounded-xl hover:bg-pink-50 transition border-0 bg-transparent"
                    title="Edit Status"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

