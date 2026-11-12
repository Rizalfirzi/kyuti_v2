'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Upload,
  Sparkles,
  Lock,
  ArrowLeft,
  RefreshCw,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

export default function MobileAdminPage() {
  const router = useRouter();

  // Authentication State via Redeem Code (Passcode)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('Semua');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form Inputs
  const [formKopkenNo, setFormKopkenNo] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formStatus, setFormStatus] = useState<OrderStatus>('diproses');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check auth on mount
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

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      order.kopkenOrderNo.toLowerCase().includes(q) ||
      order.orderCode.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (activeFilter === 'Semua') return true;
    if (activeFilter === 'Pesanan Diterima') return order.status === 'diterima';
    if (activeFilter === 'Pesanan Diproses') return order.status === 'diproses';
    if (activeFilter === 'Sedang Disiapkan') return order.status === 'disiapkan';
    if (activeFilter === 'Siap Diambil') return order.status === 'siap';
    return true;
  });

  const openCreateModal = () => {
    setModalMode('create');
    setEditingOrder(null);
    setFormKopkenNo(Math.floor(10000 + Math.random() * 90000).toString());
    setFormCustomerName('');
    setFormStatus('diproses');
    setFormPhotoUrl('');
    setModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setModalMode('edit');
    setEditingOrder(order);
    setFormKopkenNo(order.kopkenOrderNo || order.orderCode.replace('KYUTI-', ''));
    setFormCustomerName(order.customerName);
    setFormStatus(order.status);
    setFormPhotoUrl(order.proofPhotoUrl || '');
    setModalOpen(true);
  };

  // Handle Photo Upload (Vercel Blob)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormPhotoUrl(data.url);
        showNotification('Foto bukti terunggah ke Vercel Blob! ☁️');
      } else {
        alert('Gagal mengunggah foto: ' + (data.message || 'Error'));
      }
    } catch (err: any) {
      alert('Error saat mengunggah foto: ' + err.message);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Save
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKopkenNo.trim()) {
      alert('Nomor Order Kopi Kenangan wajib diisi');
      return;
    }
    if (!formCustomerName.trim()) {
      alert('Nama Customer wajib diisi');
      return;
    }

    try {
      setSavingOrder(true);

      if (modalMode === 'create') {
        const payload = {
          kopkenOrderNo: formKopkenNo.trim(),
          orderCode: `KYUTI-${formKopkenNo.trim()}`,
          customerName: formCustomerName.trim(),
          status: formStatus,
          proofPhotoUrl: formPhotoUrl,
          outletName: 'Kopi Kenangan Codefin Kemang',
          pickupTime: 'Sekarang',
          subtotal: 18000,
          total: 18000,
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
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      const day = d.getDate();
      const month = months[d.getMonth()];
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
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold rounded-full">
            Pesanan Diproses
          </span>
        );
      case 'siap':
        return (
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full">
            Siap Diambil
          </span>
        );
      case 'disiapkan':
        return (
          <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold rounded-full">
            Sedang Disiapkan
          </span>
        );
      case 'diterima':
      default:
        return (
          <span className="px-2.5 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 text-[11px] font-bold rounded-full">
            Pesanan Diterima
          </span>
        );
    }
  };

  // 1. If not authenticated, show Redeem Code screen
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-7 max-w-sm w-full text-center shadow-xl border border-pink-100">
          <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
            🔒
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Akses Admin Kedai Kyuti</h2>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Masukkan <b>Redeem Code / Passcode</b> untuk mengakses Dashboard Admin di website mobile ini ♡
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

            <Link
              href="/"
              className="block w-full py-2.5 text-xs font-semibold text-gray-400 hover:text-pink-600 transition"
            >
              ← Kembali ke Menu Toko
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // 2. Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
        <p className="text-xs text-pink-600 font-semibold">Memeriksa akses admin... ♡</p>
      </div>
    );
  }

  // 3. Mobile Admin Dashboard View (Matches Image 1 & 2 for mobile screen)
  return (
    <div className="min-h-screen bg-[#FFF5F7] pb-20">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto bg-white border border-pink-200 shadow-xl rounded-2xl px-4 py-3 text-xs font-bold text-pink-600 flex items-center justify-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-pink-500" />
          {notification}
        </div>
      )}

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-pink-100 px-4 py-3 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="p-1.5 text-gray-500 hover:text-pink-600 rounded-xl hover:bg-pink-50 transition"
              title="Ke Website Toko"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-sm font-extrabold text-gray-900 leading-tight flex items-center gap-1">
                Kedai Kyuti <span className="text-pink-500 text-xs">♡</span>
              </h1>
              <p className="text-[10px] font-bold text-pink-600">Admin Dashboard Mobile</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openCreateModal}
              className="px-3 py-1.5 bg-[#DB2777] hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Tambah
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
              title="Keluar Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content (Mobile Optimized) */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-3.5">
        {/* Title & Refresh Row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Daftar Pesanan</h2>
            <p className="text-[11px] text-gray-500">
              Update nomor Kopken & upload bukti foto Vercel Blob ♡
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2 bg-white border border-pink-200 text-gray-600 rounded-xl hover:bg-pink-50 transition shadow-sm"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-pink-600' : ''}`} />
          </button>
        </div>

        {/* Search Bar (Matches Image 2) */}
        <div className="bg-white rounded-2xl p-2 border border-pink-100 shadow-sm">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor order atau nama customer..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Filter Pills (Matches Image 2) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['Semua', 'Pesanan Diterima', 'Pesanan Diproses', 'Sedang Disiapkan', 'Siap Diambil'].map(
            (tab) => {
              const isActive = activeFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-[#DB2777] text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'
                  }`}
                >
                  {tab}
                </button>
              );
            }
          )}
        </div>

        {/* Mobile Order Cards List (Mobile-First for Image 1 & 2) */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-pink-600 font-semibold">Memuat daftar pesanan...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-pink-100 shadow-sm">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-medium">Belum ada pesanan</p>
            </div>
          ) : (
            filteredOrders.map((order, idx) => {
              const displayNo = order.kopkenOrderNo || order.orderCode.replace('KYUTI-', '');
              return (
                <div
                  key={order.orderCode}
                  className="bg-white rounded-3xl p-4 border border-pink-100 shadow-sm space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-gray-900 tracking-tight">
                          #{displayNo}
                        </span>
                        {renderStatusBadge(order.status)}
                      </div>
                      <p className="text-xs font-bold text-gray-700 mt-1">
                        Customer: <span className="text-pink-600">{order.customerName}</span>
                      </p>
                    </div>

                    {/* Proof Photo Thumbnail */}
                    {order.proofPhotoUrl ? (
                      <a
                        href={order.proofPhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-14 h-14 rounded-2xl overflow-hidden border border-pink-200 shrink-0 shadow-sm"
                        title="Lihat foto bukti"
                      >
                        <img
                          src={order.proofPhotoUrl}
                          alt="Bukti"
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ) : (
                      <button
                        onClick={() => openEditModal(order)}
                        className="w-14 h-14 rounded-2xl border-2 border-dashed border-pink-200 text-pink-400 hover:border-pink-400 flex flex-col items-center justify-center text-[9px] font-bold shrink-0 bg-pink-50/50"
                      >
                        <Upload className="w-3.5 h-3.5 mb-0.5" />
                        + Foto
                      </button>
                    )}
                  </div>

                  {/* Order Details Line */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-pink-50">
                    <span>Update: {formatUpdatedAt(order.updatedAt || order.createdAt)}</span>
                    <span className="font-semibold text-gray-700">
                      Total: Rp {order.total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-pink-50">
                    {/* View Live Tracking Link */}
                    <Link
                      href={`/track/${order.orderCode}`}
                      target="_blank"
                      className="flex-1 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Lacak
                    </Link>

                    {/* Edit Order Status & Photo */}
                    <button
                      onClick={() => openEditModal(order)}
                      className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>

                    {/* Delete Order */}
                    <button
                      onClick={() => handleDeleteOrder(order.orderCode)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Modal Tambah / Edit Pesanan (Matches Image 1 & 2 for Mobile) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 shadow-2xl border border-pink-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <h3 className="text-base font-bold text-gray-900">
                {modalMode === 'create' ? 'Tambah Pesanan' : 'Edit Status Pesanan'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveOrder} className="mt-4 space-y-3.5 text-xs">
              {/* Field 1: Nomor Order Kopi Kenangan */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nomor Order Kopi Kenangan *
                </label>
                <input
                  type="text"
                  required
                  value={formKopkenNo}
                  onChange={(e) => setFormKopkenNo(e.target.value)}
                  placeholder="Contoh: 80537"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-pink-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white"
                />
              </div>

              {/* Field 2: Nama Customer */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nama Customer *
                </label>
                <input
                  type="text"
                  required
                  value={formCustomerName}
                  onChange={(e) => setFormCustomerName(e.target.value)}
                  placeholder="Contoh: Alya"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-pink-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white"
                />
              </div>

              {/* Field 3: Status Pesanan */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Status Pesanan *
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as OrderStatus)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-pink-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white"
                >
                  <option value="diterima">Pesanan Diterima</option>
                  <option value="diproses">Pesanan Diproses</option>
                  <option value="disiapkan">Sedang Disiapkan</option>
                  <option value="siap">Siap Diambil</option>
                  <option value="selesai">Pesanan Selesai</option>
                </select>
              </div>

              {/* Field 4: Foto Bukti Pesanan (Vercel Blob) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Foto Bukti Pesanan (Vercel Blob) *
                </label>

                {formPhotoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-pink-200 bg-pink-50 p-2 flex items-center gap-3">
                    <img
                      src={formPhotoUrl}
                      alt="Preview Bukti"
                      className="w-20 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">Foto Bukti Terunggah ✓</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 text-[11px] font-bold text-pink-600 hover:text-pink-700 underline"
                      >
                        Ganti Foto
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormPhotoUrl('')}
                      className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center"
                      title="Hapus foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-2xl p-4 text-center cursor-pointer bg-pink-50/50 hover:bg-pink-50 transition"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-1.5">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-pink-700">
                      {uploadingPhoto ? 'Mengunggah ke Vercel Blob...' : 'Pilih Foto Bukti'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Klik untuk memilih foto cup &amp; struk kasir
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingOrder || uploadingPhoto}
                  className="px-6 py-2.5 bg-[#DB2777] hover:bg-pink-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-200 transition"
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
