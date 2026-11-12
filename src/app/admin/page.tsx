'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FileBarChart,
  Settings,
  LogOut,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Menu,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Check,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Navigation State
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'orders' | 'create' | 'reports' | 'settings'>('orders');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('Semua');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form State
  const [formKopkenNo, setFormKopkenNo] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formStatus, setFormStatus] = useState<OrderStatus>('diproses');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check Auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('kyuti_admin_auth');
      if (auth === '1') {
        setIsAuthenticated(true);
        fetchOrders();
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim().toUpperCase() === 'WHOSUTII26') {
      localStorage.setItem('kyuti_admin_auth', '1');
      setIsAuthenticated(true);
      setPasscodeError('');
      fetchOrders();
    } else {
      setPasscodeError('Redeem code / passcode salah. Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kyuti_admin_auth');
    setIsAuthenticated(false);
    setPasscodeInput('');
    window.location.href = '/';
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    setEditingOrder(null);
    setFormKopkenNo('');
    setFormCustomerName('');
    setFormStatus('diproses');
    setFormPhotoUrl('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (order: Order) => {
    setModalMode('edit');
    setEditingOrder(order);
    setFormKopkenNo(order.kopkenOrderNo || order.orderCode.replace('KYUTI-', ''));
    setFormCustomerName(order.customerName);
    setFormStatus(order.status);
    setFormPhotoUrl(order.proofPhotoUrl || '');
    setModalOpen(true);
  };

  // Handle Photo Upload to Vercel Blob
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderCode', formKopkenNo || 'temp');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormPhotoUrl(data.url);
        showNotification('Foto bukti berhasil diupload! 🌸');
      } else {
        alert(data.message || 'Gagal mengupload foto');
      }
    } catch (err: any) {
      alert('Error upload foto: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Form Submit
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKopkenNo.trim()) {
      alert('Nomor Order Kopi Kenangan wajib diisi!');
      return;
    }
    if (!formCustomerName.trim()) {
      alert('Nama Customer wajib diisi!');
      return;
    }

    try {
      setSavingOrder(true);

      if (modalMode === 'create') {
        const payload = {
          kopkenOrderNo: formKopkenNo.trim(),
          customerName: formCustomerName.trim(),
          status: formStatus,
          proofPhotoUrl: formPhotoUrl,
          items: [
            {
              name: 'Kopi Kenangan Order',
              qty: 1,
              price: 18000,
              subtotal: 18000,
            },
          ],
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          showNotification('Pesanan berhasil ditambahkan! 🌸');
          setModalOpen(false);
          fetchOrders();
        } else {
          alert(data.message || 'Gagal menyimpan pesanan');
        }
      } else if (editingOrder) {
        const payload = {
          kopkenOrderNo: formKopkenNo.trim(),
          customerName: formCustomerName.trim(),
          status: formStatus,
          proofPhotoUrl: formPhotoUrl,
        };

        const res = await fetch(`/api/orders/${editingOrder.orderCode}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          showNotification('Pesanan berhasil diperbarui! ✨');
          setModalOpen(false);
          fetchOrders();
        } else {
          alert(data.message || 'Gagal memperbarui pesanan');
        }
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDeleteOrder = async (orderCode: string) => {
    if (!confirm(`Yakin ingin menghapus pesanan ${orderCode}?`)) return;

    try {
      const res = await fetch(`/api/orders/${orderCode}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Pesanan berhasil dihapus.');
        fetchOrders();
      } else {
        alert(data.message || 'Gagal menghapus pesanan');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const formatUpdatedAt = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const months = ['Okt', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      const day = d.getDate();
      const month = months[d.getMonth() + 1] || 'Okt';
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${hours}.${mins}`;
    } catch {
      return '23 Okt 15.43';
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'diproses':
        return (
          <span className="inline-block px-3 py-1 bg-[#FEF3C7] text-[#D97706] text-xs font-bold rounded-full border border-[#FDE68A]">
            Pesanan Diproses
          </span>
        );
      case 'siap':
        return (
          <span className="inline-block px-3 py-1 bg-[#DCFCE7] text-[#15803D] text-xs font-bold rounded-full border border-[#BBF7D0]">
            Siap Diambil
          </span>
        );
      case 'disiapkan':
        return (
          <span className="inline-block px-3 py-1 bg-[#FCE7F3] text-[#DB2777] text-xs font-bold rounded-full border border-[#FBCFE8]">
            Sedang Disiapkan
          </span>
        );
      case 'diantar':
        return (
          <span className="inline-block px-3 py-1 bg-[#E0F2FE] text-[#0284C7] text-xs font-bold rounded-full border border-[#BAE6FD]">
            🛵 Pesanan Diantar
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-block px-3 py-1 bg-[#DCFCE7] text-[#15803D] text-xs font-bold rounded-full border border-[#BBF7D0]">
            🎉 Pesanan Diterima
          </span>
        );
      case 'diterima':
      default:
        return (
          <span className="inline-block px-3 py-1 bg-[#FCE7F3] text-[#DB2777] text-xs font-bold rounded-full border border-[#FBCFE8]">
            Pesanan Diterima
          </span>
        );
    }
  };

  // Filter Orders
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const orderNo = (order.kopkenOrderNo || order.orderCode).toLowerCase();
    const cust = order.customerName.toLowerCase();
    const matchQuery = !q || orderNo.includes(q) || cust.includes(q);

    if (!matchQuery) return false;

    if (activeFilter === 'Semua') return true;
    if (activeFilter === 'Pesanan Diterima') return order.status === 'diterima';
    if (activeFilter === 'Pesanan Diproses') return order.status === 'diproses';
    if (activeFilter === 'Sedang Disiapkan') return order.status === 'disiapkan';
    if (activeFilter === 'Siap Diambil') return order.status === 'siap';
    if (activeFilter === 'Pesanan Diantar') return order.status === 'diantar';
    if (activeFilter === 'Pesanan Selesai' || activeFilter === 'Pesanan Diterima (Selesai)') return order.status === 'selesai';
    return true;
  });

  // 1. Passcode Screen
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-pink-100">
          <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
            ☕
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Kedai Kyuti Admin</h2>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Masukkan <b>Redeem Code / Passcode</b> untuk mengakses Halaman Admin Kedai Kyuti ♡
          </p>

          <form onSubmit={handleVerifyPasscode} className="mt-6 space-y-4">
            <div>
              <input
                type="password"
                required
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Masukkan passcode..."
                className="w-full px-4 py-3 bg-gray-50 border border-pink-200 rounded-2xl text-center font-bold tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white"
                autoFocus
              />
              {passcodeError && (
                <p className="text-xs text-red-500 font-bold mt-2">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#DB2777] hover:bg-pink-700 text-white font-bold rounded-2xl shadow-md shadow-pink-200 transition text-xs"
            >
              Verifikasi &amp; Masuk Dashboard
            </button>

            <a
              href="/"
              className="block w-full py-2.5 text-xs font-semibold text-gray-400 hover:text-pink-600 transition"
            >
              ← Kembali ke Menu Toko
            </a>
          </form>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
        <p className="text-xs text-pink-600 font-semibold">Memeriksa akses admin... ♡</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col md:flex-row font-sans text-gray-800">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-pink-200 shadow-xl rounded-2xl px-5 py-3 text-xs font-bold text-pink-600 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-pink-500" />
          {notification}
        </div>
      )}

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 border-b border-pink-100 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">☕</span>
            <span className="font-extrabold text-sm text-gray-900 tracking-tight">Kedai Kyuti ♡</span>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="px-3 py-1.5 bg-[#DB2777] hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1"
        >
          + Tambah
        </button>
      </div>

      {/* Sidebar Navigation (Matches Image 1 & 2) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 w-64 bg-[#FFF5F7] md:bg-transparent border-r border-pink-100 md:border-none flex flex-col justify-between p-5 transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="flex items-center justify-between pb-6 border-b border-pink-100">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">☕</span>
              <h1 className="text-base font-extrabold text-gray-900 tracking-tight">Kedai Kyuti ♡</h1>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            <button
              onClick={() => {
                setActiveMenu('dashboard');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                activeMenu === 'dashboard'
                  ? 'bg-white text-gray-800 shadow-sm border border-pink-100'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-gray-500" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('orders');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                activeMenu === 'orders'
                  ? 'bg-[#FCE7F3] text-[#DB2777] shadow-sm font-black'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <Package className="w-4 h-4 text-[#DB2777]" />
              <span>Pesanan</span>
            </button>

            <button
              onClick={() => {
                openCreateModal();
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                modalOpen && modalMode === 'create'
                  ? 'bg-[#FCE7F3] text-[#DB2777] shadow-sm'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-gray-500" />
              <span>Tambah Pesanan</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('reports');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                activeMenu === 'reports'
                  ? 'bg-white text-gray-800 shadow-sm border border-pink-100'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <FileBarChart className="w-4 h-4 text-gray-500" />
              <span>Laporan</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('settings');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                activeMenu === 'settings'
                  ? 'bg-white text-gray-800 shadow-sm border border-pink-100'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>

        {/* Logout Bottom Link */}
        <div className="pt-6 border-t border-pink-100 space-y-2">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Lihat Website Toko</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (Matches Image 2) */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full">
        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-pink-100 min-h-[calc(100vh-4rem)]">
          {/* Header Row: Title & "+ Tambah Pesanan" Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-pink-50">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Daftar Pesanan</h2>
              <p className="text-xs text-gray-500 mt-0.5">Kelola status dan foto bukti pesanan Kopi Kenangan</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchOrders}
                className="p-2.5 border border-pink-200 text-gray-600 hover:bg-pink-50 rounded-2xl transition shadow-sm"
                title="Muat Ulang Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-pink-600' : ''}`} />
              </button>
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 bg-[#DB2777] hover:bg-pink-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-pink-200 transition flex items-center gap-1.5"
              >
                <span>+</span> Tambah Pesanan
              </button>
            </div>
          </div>

          {/* Search Bar (Matches Image 2) */}
          <div className="mt-6">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor order atau nama customer..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition shadow-xs"
              />
            </div>
          </div>

          {/* Status Filter Pills (Matches Image 2 + Diantar & Diterima) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-4 scrollbar-none">
            {['Semua', 'Pesanan Diterima', 'Pesanan Diproses', 'Sedang Disiapkan', 'Siap Diambil', 'Pesanan Diantar', 'Pesanan Selesai'].map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-[#DB2777] text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-pink-50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Orders Table (Matches Image 2) */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3">No.</th>
                  <th className="py-3 px-4">Nomor Order Kopi Kenangan</th>
                  <th className="py-3 px-4">Nama Customer</th>
                  <th className="py-3 px-4">Status Pesanan</th>
                  <th className="py-3 px-4 text-center">Foto Bukti</th>
                  <th className="py-3 px-4">Waktu Update</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="font-semibold text-xs">Memuat data pesanan...</p>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400 font-medium">
                      Belum ada data pesanan yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, idx) => {
                    const displayNo = order.kopkenOrderNo || order.orderCode.replace('KYUTI-', '');
                    const trackingCode = order.kopkenOrderNo || order.orderCode;

                    return (
                      <tr key={order.orderCode} className="hover:bg-pink-50/40 transition group">
                        <td className="py-4 px-3 font-semibold text-gray-500">{idx + 1}</td>
                        <td className="py-4 px-4 font-bold text-gray-900">
                          #{displayNo}
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-800">{order.customerName}</td>
                        <td className="py-4 px-4">{renderStatusBadge(order.status)}</td>
                        <td className="py-4 px-4 text-center">
                          {order.proofPhotoUrl ? (
                            <a
                              href={order.proofPhotoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              <img
                                src={order.proofPhotoUrl}
                                alt="Bukti"
                                className="w-11 h-11 object-cover rounded-xl border border-pink-100 shadow-xs hover:scale-105 transition mx-auto"
                              />
                            </a>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-600 font-medium whitespace-nowrap">
                          {formatUpdatedAt(order.updatedAt || order.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/track/${encodeURIComponent(trackingCode)}`}
                              target="_blank"
                              className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                              title="Lihat Link Tracking Customer"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => openEditModal(order)}
                              className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                              title="Edit Status / Foto"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.orderCode)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Hapus Pesanan"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      </main>

      {/* Modal Tambah / Edit Pesanan (Matches Image 1 & 2) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-pink-100 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                {modalMode === 'create' ? 'Tambah Pesanan' : 'Edit Pesanan'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form (Matches Image 1 & 2 Layout) */}
            <form onSubmit={handleSaveOrder} className="mt-5 space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nomor Order Kopken */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Nomor Order Kopi Kenangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formKopkenNo}
                    onChange={(e) => setFormKopkenNo(e.target.value)}
                    placeholder="Contoh: 80537"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                  />
                </div>

                {/* Nama Customer */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Nama Customer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    placeholder="Contoh: Alya"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                  />
                </div>
              </div>

              {/* Status Pesanan */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Status Pesanan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as OrderStatus)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 font-semibold transition"
                >
                  <option value="diterima">Pesanan Diterima</option>
                  <option value="diproses">Pesanan Diproses</option>
                  <option value="disiapkan">Sedang Disiapkan</option>
                  <option value="siap">Siap Diambil</option>
                  <option value="diantar">Pesanan Diantar</option>
                  <option value="selesai">Pesanan Diterima (Selesai)</option>
                </select>
              </div>

              {/* Foto Bukti Pesanan */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Foto Bukti Pesanan <span className="text-gray-400 font-normal">(Kasir / Cup)</span>
                </label>

                <div className="flex items-center gap-3">
                  {/* Photo Preview if uploaded */}
                  {formPhotoUrl ? (
                    <div className="relative group w-28 h-24 rounded-2xl overflow-hidden border-2 border-pink-200 shadow-sm bg-gray-50 flex-shrink-0">
                      <img src={formPhotoUrl} alt="Preview Bukti" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormPhotoUrl('')}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                        title="Hapus Foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}

                  {/* Upload Trigger Button (Matches Image 1 & 2 Pink Card) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="flex-1 border-2 border-dashed border-pink-200 hover:border-pink-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-pink-50/50 hover:bg-pink-50 transition min-h-[96px]"
                  >
                    <ImageIcon className="w-6 h-6 text-pink-500 mb-1" />
                    <span className="text-xs font-bold text-pink-600">
                      {uploadingPhoto ? 'Mengupload foto...' : 'Pilih Foto'}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Vercel Blob Storage</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Action Buttons: Batal & Simpan (Matches Image 1 & 2) */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingOrder}
                  className="px-6 py-2.5 bg-[#DB2777] hover:bg-pink-700 text-white font-bold rounded-2xl shadow-md shadow-pink-200 transition disabled:opacity-50"
                >
                  {savingOrder ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
