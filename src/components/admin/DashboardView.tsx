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
  CircleDollarSign,
  ShoppingCart,
  PackageCheck,
  Bike,
} from 'lucide-react';
import { Order } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GradientCard } from '@/components/ui/gradient-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

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
  const deliveringCount = orders.filter((o) => o.status === 'diantar').length;
  const completedCount = orders.filter((o) => o.status === 'selesai').length;

  return (
    <div className="space-y-6">
      {/* 1. Top DropX Gradient Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientCard
          title="Total Penjualan"
          value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
          subtitle="Akumulasi seluruh transaksi"
          icon={<CircleDollarSign className="w-5 h-5" />}
          variant="pink"
        />
        <GradientCard
          title="Total Pesanan"
          value={`${totalOrders} Transaksi`}
          subtitle="Pelanggan terlayani"
          icon={<ShoppingCart className="w-5 h-5" />}
          variant="purple"
        />
        <GradientCard
          title="Perlu Diproses"
          value={`${pendingCount} Pesanan`}
          subtitle="Menunggu & sedang disiapkan"
          icon={<Clock className="w-5 h-5" />}
          variant="orange"
        />
        <GradientCard
          title="Siap Diambil"
          value={`${readyCount} Pesanan`}
          subtitle="Tersedia di counter outlet"
          icon={<PackageCheck className="w-5 h-5" />}
          variant="green"
        />
      </div>

      {/* 2. Quick Action Banner */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-pink-50/60 to-white">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Operasional Kedai Kyuti Hari Ini</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Kelola antrean dan pastikan pesanan pelanggan diproses cepat dan tepat waktu ♡
            </p>
          </div>
          <Button onClick={onOpenCreate} size="lg" className="shrink-0">
            <PlusCircle className="w-4 h-4" />
            + Tambah Pesanan Baru
          </Button>
        </CardContent>
      </Card>

      {/* 3. Recent Orders Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pesanan Terbaru</CardTitle>
            <CardDescription>Aktivitas transaksi pelanggan terkini</CardDescription>
          </div>
          <span className="text-xs font-bold text-[#E92D79] bg-pink-50 px-3 py-1 rounded-full">
            {orders.length} Total Data
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF0F5] border-y border-pink-100 text-gray-800 font-bold">
                <tr>
                  <th className="py-3.5 px-6">Nomor Order</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Waktu</th>
                  <th className="py-3.5 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      Belum ada data pesanan.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 6).map((order) => {
                    const displayNo = order.kopkenOrderNo
                      ? `#${order.kopkenOrderNo}`
                      : `#${order.orderCode.replace('KYUTI-', '')}`;
                    return (
                      <tr key={order.orderCode} className="hover:bg-pink-50/30 transition">
                        <td className="py-4 px-6 font-black text-gray-900">{displayNo}</td>
                        <td className="py-4 px-6 font-bold text-gray-800">
                          <div className="flex items-center gap-2">
                            <Avatar name={order.customerName} size="sm" />
                            <span>{order.customerName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={order.status as any}>{order.status}</Badge>
                        </td>
                        <td className="py-4 px-6 text-gray-500 font-medium">
                          {new Date(order.updatedAt || order.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Button
                            variant="pink"
                            size="sm"
                            onClick={() => onSelectOrder(order)}
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
