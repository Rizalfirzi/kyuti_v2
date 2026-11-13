'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/Header';
import { AdminFooter } from '@/components/admin/Footer';
import { OrderTable } from '@/components/admin/OrderTable';
import { OrderModal } from '@/components/admin/OrderModal';
import { DashboardView } from '@/components/admin/DashboardView';
import { ReportsView } from '@/components/admin/ReportsView';
import { SettingsView } from '@/components/admin/SettingsView';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Layout & Navigation State
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'orders' | 'reports' | 'settings'>('orders');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Modal State for Orders
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Order Form State
  const [formKopkenNo, setFormKopkenNo] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formStatus, setFormStatus] = useState<OrderStatus>('diproses');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Toast Notification
  const [notification, setNotification] = useState<string | null>(null);

  // Settings & Pricing State
  const [pricing, setPricing] = useState<any>({
    default_markup: 5000,
    category_markups: {
      Coffee: 5000,
      'Non Coffee': 5000,
      Frappe: 5000,
      Food: 4500,
      Minuman: 5000,
      Makanan: 4500,
      Bundling: 0,
    },
    item_markup_overrides: [],
    single_item_fee: 0,
    plastic_bag_fee: 1000,
    bundling_status: {
      bundle_2_cup_large: true,
      bundle_2_frappe: true,
      promo_minuman_special: true,
      bundle_hemat_3_item: true,
    },
    disabled_bundling_options: [],
    web_hours: {
      enabled: true,
      open: '09:00',
      close: '12:00',
      closed_message:
        '♡ Maaf, jam operasional pemesanan Kedai Kyuti saat ini sedang tutup. Jam layanan pemesanan kami adalah pukul 09.00 - 12.00 WIB. Kamu tetap bisa melihat-lihat menu terlebih dahulu ya! ♡',
      force_status: 'auto',
    },
    bgm: {
      enabled: true,
      default_volume: 0.4,
      playlist: [],
    },
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [menuList, setMenuList] = useState<string[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [syncingTikTok, setSyncingTikTok] = useState(false);

  // =========================================================================
  // CLIENT STORAGE CACHE (Guarantees instant persistence across Vercel cold starts)
  // =========================================================================
  const CLIENT_ORDERS_KEY = 'kyuti_admin_orders_v2';

  const saveClientOrdersCache = (ordersList: Order[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CLIENT_ORDERS_KEY, JSON.stringify(ordersList));
    } catch (e) {}
  };

  const getClientOrdersCache = (): Order[] | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CLIENT_ORDERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return null;
  };

  // =========================================================================
  // LIFECYCLE & DATA LOADING
  // =========================================================================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = getClientOrdersCache();
      if (cached && cached.length > 0) {
        setOrders(cached);
      }
      const auth = localStorage.getItem('kyuti_admin_auth');
      const searchParams = new URLSearchParams(window.location.search);
      if (auth === '1' || searchParams.get('code')?.toUpperCase() === 'WHOSUTII26') {
        localStorage.setItem('kyuti_admin_auth', '1');
        setIsAuthenticated(true);
        fetchOrders();
        fetchPricingSettings();
        fetchReviews();
        fetchLiveMenu();
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim().toUpperCase() === 'WHOSUTII26') {
      localStorage.setItem('kyuti_admin_auth', '1');
      setIsAuthenticated(true);
      setPasscodeError('');
      fetchOrders();
      fetchPricingSettings();
      fetchReviews();
      fetchLiveMenu();
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

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const cached = getClientOrdersCache();
        if (cached && cached.length > 0) {
          // Merge server orders with cached updates: newer edit wins
          const merged = data.orders.map((serverOrder: Order) => {
            const match = cached.find((c) => c.orderCode === serverOrder.orderCode);
            if (!match) return serverOrder;
            const serverTime = new Date(serverOrder.updatedAt || serverOrder.createdAt || 0).getTime();
            const clientTime = new Date(match.updatedAt || match.createdAt || 0).getTime();
            return clientTime >= serverTime ? match : serverOrder;
          });
          // Also keep any orders created locally that aren't on server yet
          cached.forEach((c) => {
            if (!merged.some((m: Order) => m.orderCode === c.orderCode)) {
              merged.unshift(c);
            }
          });
          setOrders(merged);
          saveClientOrdersCache(merged);
        } else {
          setOrders(data.orders);
          saveClientOrdersCache(data.orders);
        }
      } else {
        const cached = getClientOrdersCache();
        if (cached) setOrders(cached);
      }
    } catch (err) {
      console.warn('Gagal memuat pesanan:', err);
      const cached = getClientOrdersCache();
      if (cached) setOrders(cached);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchPricingSettings = async () => {
    try {
      const res = await fetch('/api/admin_pricing?code=WHOSUTII26', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.pricing) {
        setPricing(data.pricing);
      }
    } catch (err) {
      console.warn('Gagal memuat pricing:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await fetch('/api/reviews', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.warn('Gagal memuat reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchLiveMenu = async () => {
    try {
      const res = await fetch('/api/menu?outlet=LA.CODEFIN');
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        const names = Array.from(new Set(data.items.map((i: any) => i.name))).filter(Boolean) as string[];
        setMenuList(names);
      }
    } catch (e) {
      setMenuList([
        'Kopi Kenangan Mantan',
        'Kenangan Milk Tea',
        'Americano',
        'Latte',
        'Caramel Macchiato',
        'Avocado Coffee',
        'Dutch Choco Frappe',
        'Matcha Latte',
        'Taro Cloud',
        'Cokelat Klasik',
      ]);
    }
  };

  // =========================================================================
  // ORDER ACTIONS & MODALS
  // =========================================================================
  const openCreateModal = () => {
    setModalMode('create');
    setEditingOrder(null);
    setFormKopkenNo('');
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

  const compressImage = async (file: File, maxWidth = 1000, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) return resolve(file);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const optimizedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('file', optimizedFile);
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

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKopkenNo.trim() || !formCustomerName.trim()) {
      alert('Nomor order dan nama customer wajib diisi!');
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
          outletCode: 'LA.CODEFIN',
          outletName: 'Kopi Kenangan Codefin Kemang',
          pickupTime: 'Sekarang',
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          showNotification('Pesanan berhasil ditambahkan! 🌸');
          const createdOrder: Order = data.order || {
            ...payload,
            orderCode: `KYUTI-${formKopkenNo.trim()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setOrders((prev) => {
            const next = [createdOrder, ...prev.filter((o) => o.orderCode !== createdOrder.orderCode)];
            saveClientOrdersCache(next);
            return next;
          });
          setModalOpen(false);
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
          const updatedOrder: Order = data.order || {
            ...editingOrder,
            kopkenOrderNo: formKopkenNo.trim(),
            customerName: formCustomerName.trim(),
            status: formStatus,
            proofPhotoUrl: formPhotoUrl,
            updatedAt: new Date().toISOString(),
          };
          setOrders((prev) => {
            const next = prev.map((o) => (o.orderCode === updatedOrder.orderCode ? updatedOrder : o));
            saveClientOrdersCache(next);
            return next;
          });
          setModalOpen(false);
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
        setOrders((prev) => {
          const next = prev.filter((o) => o.orderCode !== orderCode);
          saveClientOrdersCache(next);
          return next;
        });
      } else {
        alert(data.message || 'Gagal menghapus pesanan');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // =========================================================================
  // SETTINGS & PRICING HANDLERS
  // =========================================================================
  const saveAllPricingSettings = async (customPayload?: any) => {
    setSavingSettings(true);
    try {
      const payload = customPayload || pricing;
      const res = await fetch('/api/admin_pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, admin_passcode: 'WHOSUTII26' }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Pengaturan berhasil disimpan! 🌸');
        if (data.pricing) setPricing(data.pricing);
      } else {
        alert(data.message || 'Gagal menyimpan pengaturan');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSyncTikTokHits = async () => {
    setSyncingTikTok(true);
    try {
      const res = await fetch('/api/sync_tiktok_hits', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.playlist) {
        const updated = {
          ...pricing,
          bgm: { ...(pricing.bgm || {}), playlist: data.playlist },
        };
        setPricing(updated);
        await saveAllPricingSettings(updated);
        showNotification('Lagu viral TikTok berhasil disinkronkan! 🎵');
      }
    } catch (e: any) {
      alert('Gagal sync lagu TikTok: ' + e.message);
    } finally {
      setSyncingTikTok(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Yakin ingin menghapus ulasan customer ini secara permanen?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('Ulasan berhasil dihapus.');
        setReviews(reviews.filter((r) => r.id !== id));
      } else {
        alert(data.message || 'Gagal menghapus ulasan');
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // =========================================================================
  // 1. PASSCODE / AUTH SCREENS
  // =========================================================================
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FFF5F8] flex items-center justify-center font-kyuti">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-pink-200 border-t-[#E92D79] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#E92D79] font-bold">Memeriksa akses admin Kedai Kyuti... ♡</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#FFF5F8] flex flex-col items-center justify-center p-4 font-kyuti">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-pink-100">
          <div className="w-16 h-16 bg-[#FFE8F0] text-[#E92D79] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
            ☕
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Kedai Kyuti Admin</h2>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Masukkan <b>Redeem Code / Passcode</b> untuk mengakses Dashboard &amp; Pengaturan Kedai Kyuti ♡
          </p>

          <form onSubmit={handleVerifyPasscode} className="mt-6 space-y-4">
            <div>
              <input
                type="password"
                required
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Masukkan passcode..."
                className="w-full px-4 py-3 bg-gray-50 border border-pink-200 rounded-2xl text-center font-bold tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-[#E92D79]/40 focus:bg-white"
                autoFocus
              />
              {passcodeError && (
                <p className="text-xs text-red-500 font-bold mt-2">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#E92D79] hover:bg-[#D81B60] text-white font-bold text-xs rounded-2xl shadow-md shadow-pink-200 transition border-0"
            >
              Verifikasi &amp; Masuk Dashboard
            </button>

            <a
              href="/"
              className="block w-full py-2.5 text-xs font-semibold text-gray-400 hover:text-[#E92D79] transition"
            >
              &larr; Kembali ke Menu Toko
            </a>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN MODULAR ADMIN LAYOUT (Dropx Architecture)
  // =========================================================================
  return (
    <div className="flex h-screen overflow-hidden bg-[#FFF5F8] font-kyuti text-gray-800 relative">
      {/* Decorative Background Waves */}
      <svg
        className="absolute top-0 right-0 w-[550px] h-[350px] pointer-events-none select-none text-[#FFDEEB]/40 z-0"
        viewBox="0 0 550 350"
        fill="none"
      >
        <path d="M150 0C250 120 400 80 550 160V0H150Z" fill="currentColor" />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-[500px] h-[350px] pointer-events-none select-none text-[#FFDEEB]/40 z-0"
        viewBox="0 0 500 350"
        fill="none"
      >
        <path d="M0 200C120 180 220 300 380 260C440 245 470 280 500 350H0V200Z" fill="currentColor" />
      </svg>

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-pink-200 shadow-xl rounded-2xl px-5 py-3 text-xs font-bold text-[#E92D79] flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#E92D79]" />
          {notification}
        </div>
      )}

      {/* 1. Sidebar Component (Dedicated CSS / Tailwind) */}
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={(menu: any) => setActiveMenu(menu)}
        openCreateModal={openCreateModal}
        handleLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        ordersCount={orders.length}
      />

      {/* 2. Main Area (Header + Scrollable Content + Footer) */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Header Component */}
        <AdminHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onRefresh={fetchOrders}
          loading={loadingOrders}
        />

        {/* Content Container (Scrolls independently as in Dropx) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activeMenu === 'orders' && (
            <OrderTable
              orders={orders}
              loading={loadingOrders}
              onOpenCreate={openCreateModal}
              onOpenEdit={openEditModal}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeMenu === 'dashboard' && (
            <DashboardView
              orders={orders}
              onOpenCreate={openCreateModal}
              onSelectOrder={openEditModal}
            />
          )}

          {activeMenu === 'reports' && (
            <ReportsView orders={orders} />
          )}

          {activeMenu === 'settings' && (
            <SettingsView
              pricing={pricing}
              setPricing={setPricing}
              saveAllPricingSettings={saveAllPricingSettings}
              savingSettings={savingSettings}
              reviews={reviews}
              loadingReviews={loadingReviews}
              fetchReviews={fetchReviews}
              handleDeleteReview={handleDeleteReview}
              syncingTikTok={syncingTikTok}
              handleSyncTikTokHits={handleSyncTikTokHits}
              menuItemsList={menuList}
            />
          )}

          {/* Footer Component */}
          <AdminFooter />
        </main>
      </div>

      {/* 3. Modal Component (Create & Edit Order) */}
      <OrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        modalMode={modalMode}
        formKopkenNo={formKopkenNo}
        setFormKopkenNo={setFormKopkenNo}
        formCustomerName={formCustomerName}
        setFormCustomerName={setFormCustomerName}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        formPhotoUrl={formPhotoUrl}
        setFormPhotoUrl={setFormPhotoUrl}
        onPhotoUpload={handlePhotoUpload}
        uploadingPhoto={uploadingPhoto}
        onSubmit={handleSaveOrder}
        savingOrder={savingOrder}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}
