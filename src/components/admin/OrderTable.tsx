'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  Sparkles,
  Check,
  CheckCheck,
  Bike,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ShoppingCart,
  PackageCheck,
  RefreshCcw,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { GradientCard } from '@/components/ui/gradient-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (order: Order) => void;
  onDeleteOrder: (orderCode: string) => void;
}

export function OrderTable({
  orders,
  loading,
  onOpenCreate,
  onOpenEdit,
  onDeleteOrder,
}: OrderTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const pageSize = 5;

  // Render Status Badges matching exact colors from reference
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'diproses':
        return (
          <Badge variant="diproses">
            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Pesanan Diproses</span>
          </Badge>
        );
      case 'siap':
        return (
          <Badge variant="siap">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Siap Diambil</span>
          </Badge>
        );
      case 'disiapkan':
        return (
          <Badge variant="disiapkan">
            <Sparkles className="w-3.5 h-3.5 text-[#E92D79]" />
            <span>Sedang Disiapkan</span>
          </Badge>
        );
      case 'diantar':
        return (
          <Badge variant="diantar">
            <Bike className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Pesanan Diantar</span>
          </Badge>
        );
      case 'selesai':
        return (
          <Badge variant="selesai">
            <CheckCheck className="w-3.5 h-3.5 text-[#047857]" />
            <span>Pesanan Selesai</span>
          </Badge>
        );
      case 'diterima':
      default:
        return (
          <Badge variant="diterima">
            <Check className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Pesanan Diterima</span>
          </Badge>
        );
    }
  };

  // Filter orders by search & status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const codeMatch = (order.kopkenOrderNo || order.orderCode).toLowerCase().includes(q);
        const nameMatch = (order.customerName || '').toLowerCase().includes(q);
        if (!codeMatch && !nameMatch) return false;
      }

      if (activeFilter === 'Pesanan Diterima') return order.status === 'diterima';
      if (activeFilter === 'Pesanan Diproses') return order.status === 'diproses';
      if (activeFilter === 'Sedang Disiapkan') return order.status === 'disiapkan';
      if (activeFilter === 'Siap Diambil') return order.status === 'siap';
      if (activeFilter === 'Pesanan Diantar') return order.status === 'diantar';
      if (activeFilter === 'Pesanan Selesai') return order.status === 'selesai';
      return true;
    });
  }, [orders, searchQuery, activeFilter]);

  // Dynamic status counts
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      diterima: orders.filter((o) => o.status === 'diterima').length,
      diproses: orders.filter((o) => o.status === 'diproses').length,
      disiapkan: orders.filter((o) => o.status === 'disiapkan').length,
      siap: orders.filter((o) => o.status === 'siap').length,
      diantar: orders.filter((o) => o.status === 'diantar').length,
      selesai: orders.filter((o) => o.status === 'selesai').length,
    };
  }, [orders]);

  // Overall Statistics for DropX Stats Cards
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);
  const pendingCount = statusCounts.diproses + statusCounts.disiapkan + statusCounts.diterima;

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const formatUpdatedAt = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      const dateFormatted = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
      }).format(d);
      const timeFormatted = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d).replace(':', '.');
      return `${dateFormatted} ${timeFormatted}`;
    } catch {
      return '-';
    }
  };

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(new Set(paginatedOrders.map((o) => o.orderCode)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleToggleSelectOne = (code: string) => {
    const next = new Set(selectedOrders);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setSelectedOrders(next);
  };

  const handleBatchDelete = () => {
    if (!confirm(`Hapus ${selectedOrders.size} pesanan yang dipilih?`)) return;
    selectedOrders.forEach((code) => onDeleteOrder(code));
    setSelectedOrders(new Set());
  };

  return (
    <div className="space-y-6">
      {/* 1. DropX Overview Gradient Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientCard
          title="Total Penjualan"
          value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
          subtitle="Akumulasi omset pesanan"
          icon={<CircleDollarSign className="w-5 h-5" />}
          variant="pink"
        />
        <GradientCard
          title="Total Pesanan"
          value={`${orders.length} Order`}
          subtitle="Seluruh transaksi terdaftar"
          icon={<ShoppingCart className="w-5 h-5" />}
          variant="purple"
        />
        <GradientCard
          title="Perlu Diproses"
          value={`${pendingCount} Pesanan`}
          subtitle="Antrean dapur & barista"
          icon={<Clock className="w-5 h-5" />}
          variant="orange"
        />
        <GradientCard
          title="Siap Diambil"
          value={`${statusCounts.siap} Pesanan`}
          subtitle="Siap diserahkan ke pelanggan"
          icon={<PackageCheck className="w-5 h-5" />}
          variant="green"
        />
      </div>

      {/* 2. Main DropX Orders Card */}
      <Card>
        <CardContent className="p-6 sm:p-8 md:p-10">
          {/* Header Row: Shopping Bag Icon + Title & "+ Tambah Pesanan" Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#E92D79] shadow-md shadow-pink-300/40 flex items-center justify-center text-white shrink-0">
                <ShoppingBag className="w-7 h-7 stroke-[1.8]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-[26px] font-black text-gray-900 tracking-tight">Daftar Pesanan</h2>
                <p className="text-xs text-gray-400 font-medium mt-1">Kelola semua data pesanan pelanggan dengan mudah</p>
              </div>
            </div>

            <div className="self-start sm:self-auto">
              <div className="relative">
                <button
                  type="button"
                  onClick={onOpenCreate}
                  className="px-6 py-2.5 bg-[#E92D79] hover:bg-[#D81B60] text-white font-bold text-xs rounded-full shadow-[0_6px_20px_rgba(233,45,121,0.35)] transition flex items-center gap-1.5 active:scale-95 border-0 cursor-pointer"
                >
                  <span className="text-base font-bold leading-none">+</span> Tambah Pesanan
                </button>
                {/* 3 radiant sparkle lines */}
                <svg
                  className="absolute -top-2.5 -right-2.5 w-6 h-6 text-[#E92D79] pointer-events-none select-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="4" x2="10" y2="8" />
                  <line x1="17" y1="7" x2="13" y2="10" />
                  <line x1="20" y1="12" x2="15" y2="12" />
                </svg>
              </div>
            </div>
          </div>

          {/* Search Bar (DropX Input with Icon) */}
          <div className="mt-2">
            <Input
              icon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nomor order atau nama customer..."
            />
          </div>

          {/* Status Filter Pills with Live Counter Badges (DropX Tab Style) */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 mt-5 scrollbar-none">
            {[
              { label: 'Semua', count: statusCounts.all, dot: 'bg-gray-400' },
              { label: 'Pesanan Diterima', count: statusCounts.diterima, dot: 'bg-purple-500' },
              { label: 'Pesanan Diproses', count: statusCounts.diproses, dot: 'bg-amber-500' },
              { label: 'Sedang Disiapkan', count: statusCounts.disiapkan, dot: 'bg-pink-500' },
              { label: 'Siap Diambil', count: statusCounts.siap, dot: 'bg-emerald-500' },
              { label: 'Pesanan Diantar', count: statusCounts.diantar, dot: 'bg-sky-500' },
              { label: 'Pesanan Selesai', count: statusCounts.selesai, dot: 'bg-teal-600' },
            ].map((tab) => {
              const isActive = activeFilter === tab.label;
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => {
                    setActiveFilter(tab.label);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-2 border-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#E92D79] text-white shadow-xs'
                      : 'bg-[#FFF0F5] hover:bg-[#FFE4EE] text-gray-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : tab.dot}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white text-[#E92D79]'
                        : 'text-[#E92D79] bg-white/60'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Batch Action Bar (DropX Selection Feature) */}
          {selectedOrders.size > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-pink-50/80 rounded-2xl border border-pink-200 text-xs font-bold text-[#E92D79] animate-fade-in">
              <span>{selectedOrders.size} pesanan dipilih</span>
              <Button size="sm" variant="destructive" onClick={handleBatchDelete}>
                <Trash2 className="w-3.5 h-3.5" /> Hapus Terpilih
              </Button>
            </div>
          )}

          {/* Table Area (Pastel Pink Header & Clean Spacing) */}
          <div className="mt-6 overflow-x-auto rounded-2xl border border-pink-100/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF0F5] border-b border-pink-100 text-gray-900 font-bold">
                <tr>
                  <th className="py-4 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#E92D79] rounded cursor-pointer"
                      checked={paginatedOrders.length > 0 && selectedOrders.size === paginatedOrders.length}
                      onChange={handleToggleSelectAll}
                      aria-label="Pilih Semua"
                    />
                  </th>
                  <th className="py-4 px-4 w-12 text-center">No.</th>
                  <th className="py-4 px-6">
                    <div>Nomor Order</div>
                    <div className="font-normal text-[11px] text-gray-500">Kopi Kenangan</div>
                  </th>
                  <th className="py-4 px-6">Nama Customer</th>
                  <th className="py-4 px-6">Status Pesanan</th>
                  <th className="py-4 px-6">Foto Bukti</th>
                  <th className="py-4 px-6">Waktu Update</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-14 text-gray-400">
                      <div className="w-8 h-8 border-3 border-pink-200 border-t-[#E92D79] rounded-full animate-spin mx-auto mb-2"></div>
                      Memuat data pesanan...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-14 text-gray-400">
                      <div className="text-3xl mb-2">🔍</div>
                      Tidak ada pesanan ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order, idx) => {
                    const displayNo = order.kopkenOrderNo
                      ? `#${order.kopkenOrderNo}`
                      : `#${order.orderCode.replace('KYUTI-', '')}`;
                    const photo = order.proofPhotoUrl;
                    const isSelected = selectedOrders.has(order.orderCode);

                    return (
                      <tr
                        key={order.orderCode}
                        className={`transition ${isSelected ? 'bg-pink-50/50' : 'hover:bg-[#FFF9FB]'}`}
                      >
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-[#E92D79] rounded cursor-pointer"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOne(order.orderCode)}
                            aria-label={`Pilih order ${displayNo}`}
                          />
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-gray-700">{startIndex + idx + 1}</td>
                        <td className="py-4 px-6 font-black text-gray-900 tracking-wide text-xs">{displayNo}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={order.customerName} size="sm" />
                            <span className="font-bold text-gray-800 text-xs">{order.customerName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">{renderStatusBadge(order.status)}</td>
                        <td className="py-4 px-6">
                          {photo ? (
                            <a
                              href={photo}
                              target="_blank"
                              rel="noreferrer"
                              className="block w-14 h-11 rounded-xl overflow-hidden border border-gray-200 hover:scale-105 transition shadow-xs"
                            >
                              <img src={photo} alt="Bukti" className="w-full h-full object-cover" />
                            </a>
                          ) : (
                            <div className="w-14 h-11 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">
                              -
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-700 font-medium">
                          {formatUpdatedAt(order.updatedAt || order.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-3">
                            {/* View Tracking Link */}
                            <a
                              href={`/track/${order.kopkenOrderNo || order.orderCode}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Buka Link Tracking Customer"
                              className="p-1.5 text-gray-600 hover:text-black rounded-lg hover:bg-gray-100 transition cursor-pointer"
                            >
                              <Eye className="w-4 h-4 stroke-[1.8]" />
                            </a>
                            {/* Edit Modal Button */}
                            <button
                              type="button"
                              onClick={() => onOpenEdit(order)}
                              title="Edit Status & Foto Bukti"
                              className="p-1.5 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer border-0 bg-transparent"
                            >
                              <Pencil className="w-4 h-4 stroke-[1.8]" />
                            </button>
                            {/* Delete Order Button */}
                            <button
                              type="button"
                              onClick={() => onDeleteOrder(order.orderCode)}
                              title="Hapus Pesanan"
                              className="p-1.5 text-[#E92D79] hover:text-red-700 rounded-lg hover:bg-red-50 transition cursor-pointer border-0 bg-transparent"
                            >
                              <Trash2 className="w-4 h-4 stroke-[1.8]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-gray-500 font-medium">
              Menampilkan {filteredOrders.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + pageSize, filteredOrders.length)} dari {filteredOrders.length} data
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-gray-100 transition text-xs font-bold border-0 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition border-0 cursor-pointer ${
                    pNum === safeCurrentPage
                      ? 'bg-[#E92D79] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-gray-100 transition text-xs font-bold border-0 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
