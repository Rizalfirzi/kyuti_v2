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
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

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
  const pageSize = 5;

  // Render Status Badges matching exact colors from reference
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF8E7] text-[#D97706] text-xs font-bold rounded-full border border-[#FDE68A]/70 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Pesanan Diproses</span>
          </span>
        );
      case 'siap':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EDFDF2] text-[#16A34A] text-xs font-bold rounded-full border border-[#BBF7D0]/70 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] fill-[#16A34A] text-white" />
            <span>Siap Diambil</span>
          </span>
        );
      case 'disiapkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF0F5] text-[#E92D79] text-xs font-bold rounded-full border border-[#FBCFE8]/70 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E92D79]" />
            <span>Sedang Disiapkan</span>
          </span>
        );
      case 'diantar':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F9FF] text-[#0284C7] text-xs font-bold rounded-full border border-[#BAE6FD]/70 shadow-2xs">
            <Bike className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Pesanan Diantar</span>
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ECFDF5] text-[#047857] text-xs font-bold rounded-full border border-[#A7F3D0]/70 shadow-2xs">
            <CheckCheck className="w-3.5 h-3.5 text-[#047857]" />
            <span>Pesanan Selesai</span>
          </span>
        );
      case 'diterima':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F3FF] text-[#7C3AED] text-xs font-bold rounded-full border border-[#DDD6FE]/70 shadow-2xs">
            <Check className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Pesanan Diterima</span>
          </span>
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

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const formatUpdatedAt = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      const day = d.getDate();
      const month = months[d.getMonth()] || 'Okt';
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${hours}.${mins}`;
    } catch {
      return '23 Okt 15.43';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_10px_35px_rgba(233,45,121,0.06)] border border-pink-100/60 min-h-[calc(100vh-10rem)]">
      {/* Header Row: Bag Icon + Title & "+ Tambah Pesanan" Button */}
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
              className="px-6 py-2.5 bg-[#E92D79] hover:bg-[#D81B60] text-white font-bold text-xs rounded-full shadow-[0_6px_20px_rgba(233,45,121,0.35)] transition flex items-center gap-1.5 active:scale-95 border-0"
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

      {/* Search Bar (Rounded Pill with Icon) */}
      <div className="mt-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nomor order atau nama customer..."
            className="w-full pl-12 pr-6 py-3 bg-white border border-gray-200/90 rounded-full text-xs font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E92D79]/20 focus:border-[#E92D79] transition shadow-xs"
          />
        </div>
      </div>

      {/* Status Filter Pills with Live Counter Badges */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 mt-5 scrollbar-none">
        {[
          { label: 'Semua', count: statusCounts.all },
          { label: 'Pesanan Diterima', count: statusCounts.diterima },
          { label: 'Pesanan Diproses', count: statusCounts.diproses },
          { label: 'Sedang Disiapkan', count: statusCounts.disiapkan },
          { label: 'Siap Diambil', count: statusCounts.siap },
          { label: 'Pesanan Diantar', count: statusCounts.diantar },
          { label: 'Pesanan Selesai', count: statusCounts.selesai },
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
              className={`px-5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center border-0 ${
                isActive
                  ? 'bg-[#E92D79] text-white shadow-xs'
                  : 'bg-[#FFF0F5] hover:bg-[#FFE4EE] text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`ml-2 text-[10px] font-black ${
                  isActive
                    ? 'bg-white text-[#E92D79] px-2 py-0.5 rounded-full'
                    : 'text-[#E92D79]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Area (Pastel Pink Header & Clean Spacing) */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-pink-100/70">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FFF0F5] border-b border-pink-100 text-gray-900 font-bold">
            <tr>
              <th className="py-4 px-6 w-14">No.</th>
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
                <td colSpan={7} className="text-center py-14 text-gray-400">
                  <div className="w-8 h-8 border-3 border-pink-200 border-t-[#E92D79] rounded-full animate-spin mx-auto mb-2"></div>
                  Memuat data pesanan...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-14 text-gray-400">
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

                return (
                  <tr key={order.orderCode} className="hover:bg-[#FFF9FB] transition">
                    <td className="py-4 px-6 font-bold text-gray-700">{startIndex + idx + 1}</td>
                    <td className="py-4 px-6 font-black text-gray-900 tracking-wide text-xs">{displayNo}</td>
                    <td className="py-4 px-6 font-bold text-gray-800 text-xs">{order.customerName}</td>
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
                      <div className="flex items-center justify-center gap-4">
                        {/* View Tracking Link */}
                        <a
                          href={`/track/${order.kopkenOrderNo || order.orderCode}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka Link Tracking Customer"
                          className="text-gray-600 hover:text-black transition"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </a>
                        {/* Edit Modal Button */}
                        <button
                          type="button"
                          onClick={() => onOpenEdit(order)}
                          title="Edit Status & Foto Bukti"
                          className="text-gray-600 hover:text-blue-600 transition"
                        >
                          <Pencil className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        {/* Delete Order Button */}
                        <button
                          type="button"
                          onClick={() => onDeleteOrder(order.orderCode)}
                          title="Hapus Pesanan"
                          className="text-[#E92D79] hover:text-red-700 transition"
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
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-gray-100 transition text-xs font-bold border-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
            <button
              key={pNum}
              type="button"
              onClick={() => setCurrentPage(pNum)}
              className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition border-0 ${
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
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-gray-100 transition text-xs font-bold border-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

