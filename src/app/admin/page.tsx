'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  CheckCheck,
  CheckCircle2,
  Bike,
  Clock,
  Music,
  DollarSign,
  ShoppingBag,
  Coffee,
  Volume2,
  Upload,
  Link as LinkIcon,
  Star,
  Sliders,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Users,
  Percent,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Navigation State
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'orders' | 'reports' | 'settings'>('orders');
  const [settingsTab, setSettingsTab] = useState<'pricing' | 'bundling' | 'hours' | 'bgm' | 'reviews'>('pricing');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('Semua');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

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

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // =========================================================================
  // SETTINGS & PRICING STATE (Full implementation of _legacy_php)
  // =========================================================================
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

  // Item Override Form
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [customMenuName, setCustomMenuName] = useState('');
  const [itemOverrideFee, setItemOverrideFee] = useState<number | ''>(6000);

  // Disabled Bundling Item Form
  const [disabledBundlingOptionInput, setDisabledBundlingOptionInput] = useState('');

  // BGM Form State
  const [bgmTab, setBgmTab] = useState<'upload' | 'link'>('upload');
  const [bgmUploadFile, setBgmUploadFile] = useState<File | null>(null);
  const [bgmUploadTitle, setBgmUploadTitle] = useState('');
  const [bgmUploadArtist, setBgmUploadArtist] = useState('');
  const [bgmLinkUrl, setBgmLinkUrl] = useState('');
  const [bgmLinkTitle, setBgmLinkTitle] = useState('');
  const [bgmLinkArtist, setBgmLinkArtist] = useState('');
  const [syncingTikTok, setSyncingTikTok] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // =========================================================================
  // LIFECYCLE & DATA LOADING
  // =========================================================================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('kyuti_admin_auth');
      if (auth === '1') {
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
      setLoading(true);
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.warn('Gagal memuat pesanan:', err);
    } finally {
      setLoading(false);
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
      // Fallback list
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
  // ORDER ACTIONS & MODAL LOGIC
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

  // Render Status Badge (Matches Exact Reference Image & User Specs)
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF8E7] text-[#D97706] text-xs font-bold rounded-full border border-[#FDE68A]">
            <Clock className="w-3.5 h-3.5" />
            <span>Pesanan Diproses</span>
          </span>
        );
      case 'siap':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EDFDF2] text-[#15803D] text-xs font-bold rounded-full border border-[#BBF7D0]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Siap Diambil</span>
          </span>
        );
      case 'disiapkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF0F5] text-[#E92D79] text-xs font-bold rounded-full border border-[#FBCFE8]">
            <Sparkles className="w-3.5 h-3.5 text-[#E92D79]" />
            <span>Sedang Disiapkan</span>
          </span>
        );
      case 'diantar':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F9FF] text-[#0284C7] text-xs font-bold rounded-full border border-[#BAE6FD]">
            <Bike className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Pesanan Diantar</span>
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ECFDF5] text-[#047857] text-xs font-bold rounded-full border border-[#A7F3D0]">
            <CheckCheck className="w-3.5 h-3.5 text-[#047857]" />
            <span>Pesanan Diterima</span>
          </span>
        );
      case 'diterima':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F3FF] text-[#7C3AED] text-xs font-bold rounded-full border border-[#DDD6FE]">
            <Check className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Pesanan Diterima</span>
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

  // Dynamic status counts for filter pills (Matching exact reference image badges)
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

  // =========================================================================
  // SETTINGS HANDLERS (Save Pricing, Bundling, Hours, BGM, Reviews)
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

  // Item Override: Add
  const handleAddItemOverride = () => {
    const name = (selectedMenuItem || customMenuName).trim();
    if (!name) {
      alert('Pilih atau ketik nama menu terlebih dahulu!');
      return;
    }
    const finalName = selectedSize === 'Large' ? `${name} (Large)` : name;
    const fee = typeof itemOverrideFee === 'number' ? itemOverrideFee : 5000;

    const existingOverrides = Array.isArray(pricing.item_markup_overrides)
      ? [...pricing.item_markup_overrides]
      : [];

    const filtered = existingOverrides.filter((it: any) => it.name !== finalName);
    filtered.push({ name: finalName, fee });

    const updated = { ...pricing, item_markup_overrides: filtered };
    setPricing(updated);
    saveAllPricingSettings(updated);

    setSelectedMenuItem('');
    setCustomMenuName('');
    setSelectedSize('');
    setItemOverrideFee(6000);
  };

  // Item Override: Remove
  const handleRemoveItemOverride = (targetName: string) => {
    const existingOverrides = Array.isArray(pricing.item_markup_overrides)
      ? [...pricing.item_markup_overrides]
      : [];
    const filtered = existingOverrides.filter((it: any) => it.name !== targetName);
    const updated = { ...pricing, item_markup_overrides: filtered };
    setPricing(updated);
    saveAllPricingSettings(updated);
  };

  // Bundling Package Toggle
  const handleToggleBundle = (key: string) => {
    const currentStatus = { ...(pricing.bundling_status || {}) };
    currentStatus[key] = !currentStatus[key];
    const updated = { ...pricing, bundling_status: currentStatus };
    setPricing(updated);
    saveAllPricingSettings(updated);
  };

  // Bundling: Add Disabled Option
  const handleAddDisabledBundlingOption = () => {
    const val = disabledBundlingOptionInput.trim();
    if (!val) return;
    const list = Array.isArray(pricing.disabled_bundling_options)
      ? [...pricing.disabled_bundling_options]
      : [];
    if (!list.includes(val)) {
      list.push(val);
      const updated = { ...pricing, disabled_bundling_options: list };
      setPricing(updated);
      saveAllPricingSettings(updated);
    }
    setDisabledBundlingOptionInput('');
  };

  // Bundling: Remove Disabled Option
  const handleRemoveDisabledBundlingOption = (opt: string) => {
    const list = Array.isArray(pricing.disabled_bundling_options)
      ? [...pricing.disabled_bundling_options]
      : [];
    const updated = { ...pricing, disabled_bundling_options: list.filter((o: string) => o !== opt) };
    setPricing(updated);
    saveAllPricingSettings(updated);
  };

  // BGM: Sync TikTok Hits
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

  // BGM: Upload Audio File
  const handleUploadAudio = async () => {
    if (!bgmUploadFile) {
      alert('Silakan pilih file lagu .mp3 terlebih dahulu');
      return;
    }
    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('audio', bgmUploadFile);
      formData.append('title', bgmUploadTitle || bgmUploadFile.name);

      const res = await fetch('/api/upload_audio', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const newTrack = {
          title: bgmUploadTitle || bgmUploadFile.name.replace(/\.[^/.]+$/, ''),
          artist: bgmUploadArtist || 'Kedai Kyuti Café',
          src: data.url,
        };
        const currentPlaylist = pricing.bgm?.playlist || [];
        const updated = {
          ...pricing,
          bgm: { ...pricing.bgm, playlist: [newTrack, ...currentPlaylist] },
        };
        setPricing(updated);
        await saveAllPricingSettings(updated);
        setBgmUploadFile(null);
        setBgmUploadTitle('');
        setBgmUploadArtist('');
        showNotification('Lagu audio berhasil diupload! 🎶');
      } else {
        alert(data.message || 'Gagal upload audio');
      }
    } catch (e: any) {
      alert('Error upload audio: ' + e.message);
    } finally {
      setUploadingAudio(false);
    }
  };

  // BGM: Add Link URL
  const handleAddBgmLink = async () => {
    if (!bgmLinkUrl.trim()) {
      alert('Masukkan link URL lagu atau YouTube ID');
      return;
    }
    const newTrack: any = {
      title: bgmLinkTitle || 'Lagu Café',
      artist: bgmLinkArtist || 'Kedai Kyuti',
      src: bgmLinkUrl.trim(),
    };
    if (bgmLinkUrl.includes('youtube.com') || bgmLinkUrl.includes('youtu.be') || bgmLinkUrl.length === 11) {
      const ytId = bgmLinkUrl.split('v=')[1]?.split('&')[0] || bgmLinkUrl.split('/').pop() || bgmLinkUrl;
      newTrack.youtube_id = ytId;
    }
    const currentPlaylist = pricing.bgm?.playlist || [];
    const updated = {
      ...pricing,
      bgm: { ...pricing.bgm, playlist: [newTrack, ...currentPlaylist] },
    };
    setPricing(updated);
    await saveAllPricingSettings(updated);
    setBgmLinkUrl('');
    setBgmLinkTitle('');
    setBgmLinkArtist('');
    showNotification('Lagu berhasil ditambahkan ke playlist! 🎵');
  };

  // BGM: Remove Track
  const handleRemoveTrack = (index: number) => {
    const currentPlaylist = [...(pricing.bgm?.playlist || [])];
    currentPlaylist.splice(index, 1);
    const updated = {
      ...pricing,
      bgm: { ...pricing.bgm, playlist: currentPlaylist },
    };
    setPricing(updated);
    saveAllPricingSettings(updated);
  };

  // BGM: Reset Default Tracks
  const handleResetBgmDefault = async () => {
    if (!confirm('Kembalikan daftar lagu ke lagu default Kedai Kyuti?')) return;
    const defaultPlaylist = [
      { title: 'Negoro Angin (Trending TikTok ♫)', artist: 'Denny Caknan', youtube_id: '6kKuzB_YOmc' },
      { title: 'Sesi Potret', artist: 'eńau ft. Ari Lesmana', youtube_id: 'CSKr9seKdgI' },
      { title: 'Dunia Yang Nanti', artist: 'Raim Laode', youtube_id: 'awWKxGftWh4' },
    ];
    const updated = {
      ...pricing,
      bgm: { ...pricing.bgm, playlist: defaultPlaylist },
    };
    setPricing(updated);
    await saveAllPricingSettings(updated);
    showNotification('Daftar lagu berhasil di-reset ke default! ♡');
  };

  // Review: Delete
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
  // STATS & REPORT CALCULATIONS
  // =========================================================================
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const pendingCount = orders.filter((o) => ['diterima', 'diproses', 'disiapkan'].includes(o.status)).length;
  const deliveringCount = orders.filter((o) => o.status === 'diantar').length;
  const readyCount = orders.filter((o) => o.status === 'siap').length;
  const completedCount = orders.filter((o) => o.status === 'selesai').length;

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
                className="w-full px-4 py-3 bg-gray-50 border border-pink-200 rounded-2xl text-center font-bold tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white"
                autoFocus
              />
              {passcodeError && (
                <p className="text-xs text-red-500 font-bold mt-2">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#DB2777] hover:bg-pink-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-pink-200 transition"
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
    <div className="relative min-h-screen bg-[#FFF0F5] overflow-x-hidden flex flex-col md:flex-row font-kyuti text-gray-800 p-4 md:p-6 lg:p-8">
      {/* Top-Right Decorative Smooth Wave (Matches Reference Image) */}
      <svg
        className="absolute top-0 right-0 w-[550px] h-[350px] pointer-events-none select-none text-[#FFDEEB]/60 z-0"
        viewBox="0 0 550 350"
        fill="none"
      >
        <path
          d="M150 0C250 120 400 80 550 160V0H150Z"
          fill="currentColor"
        />
      </svg>

      {/* Bottom-Left Decorative Smooth Wave (Matches Reference Image) */}
      <svg
        className="absolute bottom-0 left-0 w-[500px] h-[350px] pointer-events-none select-none text-[#FFDEEB]/60 z-0"
        viewBox="0 0 500 350"
        fill="none"
      >
        <path
          d="M0 200C120 180 220 300 380 260C440 245 470 280 500 350H0V200Z"
          fill="currentColor"
        />
      </svg>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-pink-200 shadow-xl rounded-2xl px-5 py-3 text-xs font-bold text-pink-600 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-pink-500" />
          {notification}
        </div>
      )}

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 rounded-2xl mb-4 border border-pink-100 shadow-sm sticky top-0 z-40">
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
          className="px-3 py-1.5 bg-[#E92D79] hover:bg-[#D81B60] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Pesanan
        </button>
      </div>

      {/* Left Sidebar (Modern, Clean, Presisi & Aestetik) */}
      <aside
        className={`fixed md:relative top-0 left-0 h-screen md:h-auto w-64 flex flex-col justify-between py-4 px-4 md:px-5 z-50 transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0 bg-[#FFF0F5] shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between pb-8 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FFE5EE] flex items-center justify-center text-xl shadow-xs">
                ☕
              </div>
              <div>
                <h1 className="font-black text-gray-900 text-lg tracking-tight flex items-center gap-1.5">
                  Kedai Kyuti <span className="text-[#E92D79] text-base">♡</span>
                </h1>
              </div>
            </div>
            {mobileSidebarOpen && (
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {/* 1. Dashboard */}
            <button
              onClick={() => {
                setActiveMenu('dashboard');
                setMobileSidebarOpen(false);
              }}
              className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                activeMenu === 'dashboard'
                  ? 'bg-[#FFE8F0] text-[#E92D79]'
                  : 'text-gray-700 hover:text-[#E92D79] hover:bg-white/50'
              }`}
            >
              {activeMenu === 'dashboard' && (
                <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#E92D79] rounded-r-full" />
              )}
              <LayoutDashboard className={`w-4 h-4 ${activeMenu === 'dashboard' ? 'text-[#E92D79]' : 'text-gray-600'}`} />
              <span>Dashboard</span>
            </button>

            {/* 2. Pesanan (Daftar Pesanan - Active in Ref Image) */}
            <button
              onClick={() => {
                setActiveMenu('orders');
                setMobileSidebarOpen(false);
              }}
              className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                activeMenu === 'orders'
                  ? 'bg-[#FFE8F0] text-[#E92D79]'
                  : 'text-gray-700 hover:text-[#E92D79] hover:bg-white/50'
              }`}
            >
              {activeMenu === 'orders' && (
                <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#E92D79] rounded-r-full" />
              )}
              <Package className={`w-4 h-4 ${activeMenu === 'orders' ? 'text-[#E92D79]' : 'text-gray-600'}`} />
              <span>Pesanan</span>
            </button>

            {/* 3. Tambah Pesanan (Quick Action) */}
            <button
              onClick={() => {
                openCreateModal();
                setMobileSidebarOpen(false);
              }}
              className="relative w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-gray-700 hover:text-[#E92D79] hover:bg-white/50 transition text-left"
            >
              <PlusCircle className="w-4 h-4 text-gray-600" />
              <span>Tambah Pesanan</span>
            </button>

            {/* 4. Laporan */}
            <button
              onClick={() => {
                setActiveMenu('reports');
                setMobileSidebarOpen(false);
              }}
              className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                activeMenu === 'reports'
                  ? 'bg-[#FFE8F0] text-[#E92D79]'
                  : 'text-gray-700 hover:text-[#E92D79] hover:bg-white/50'
              }`}
            >
              {activeMenu === 'reports' && (
                <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#E92D79] rounded-r-full" />
              )}
              <FileBarChart className={`w-4 h-4 ${activeMenu === 'reports' ? 'text-[#E92D79]' : 'text-gray-600'}`} />
              <span>Laporan</span>
            </button>

            {/* 5. Pengaturan (Semua isi _legacy_php) */}
            <button
              onClick={() => {
                setActiveMenu('settings');
                setMobileSidebarOpen(false);
              }}
              className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                activeMenu === 'settings'
                  ? 'bg-[#FFE8F0] text-[#E92D79]'
                  : 'text-gray-700 hover:text-[#E92D79] hover:bg-white/50'
              }`}
            >
              {activeMenu === 'settings' && (
                <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#E92D79] rounded-r-full" />
              )}
              <Settings className={`w-4 h-4 ${activeMenu === 'settings' ? 'text-[#E92D79]' : 'text-gray-600'}`} />
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section with Floating Heart and Logout */}
        <div className="pt-6 relative pb-2">
          {/* Subtle floating heart decoration */}
          <div className="absolute right-3 bottom-8 pointer-events-none opacity-40">
            <Heart className="w-5 h-5 text-[#E92D79] stroke-[1.5]" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-gray-700 hover:text-red-600 hover:bg-white/50 transition text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full z-10 md:pl-2">
        {/* Top Header Bar outside Card (Bell Badge + Admin Avatar Dropdown) */}
        <div className="flex items-center justify-end gap-5 mb-5 pr-2">
          {/* Notification Bell with Badge */}
          <div className="relative p-2 rounded-full hover:bg-white/60 transition cursor-pointer text-gray-700">
            <Bell className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#E92D79] text-white text-[10px] font-black rounded-full flex items-center justify-center">
              3
            </span>
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-2.5 cursor-pointer pl-1.5 pr-3 py-1 bg-white/70 hover:bg-white rounded-full transition shadow-xs border border-pink-100/60">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
              alt="Admin"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-200"
            />
            <span className="text-xs font-bold text-gray-800">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 stroke-[2]" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: DAFTAR PESANAN (Matches Reference Image UI/UX)                   */}
        {/* ========================================================================= */}
        {activeMenu === 'orders' && (
          <div className="bg-white rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_12px_45px_rgba(233,45,121,0.06)] border border-white/80 min-h-[calc(100vh-9rem)]">
            {/* Header Row: Bag Icon + Title & "+ Tambah Pesanan" Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E92D79] shadow-md shadow-pink-300/40 flex items-center justify-center text-white flex-shrink-0">
                  <ShoppingBag className="w-7 h-7 stroke-[1.8]" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-[26px] font-black text-gray-900 tracking-tight">Daftar Pesanan</h2>
                  <p className="text-xs text-gray-400 font-medium mt-1">Kelola semua data pesanan pelanggan dengan mudah</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <button
                  onClick={fetchOrders}
                  title="Refresh Data"
                  className="p-2.5 bg-gray-50 hover:bg-pink-50 text-gray-600 hover:text-[#E92D79] rounded-2xl border border-gray-200/80 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E92D79]' : ''}`} />
                </button>
                <div className="relative">
                  <button
                    onClick={openCreateModal}
                    className="px-6 py-2.5 bg-[#E92D79] hover:bg-[#D81B60] text-white font-bold text-xs rounded-full shadow-[0_6px_20px_rgba(233,45,121,0.35)] transition flex items-center gap-1.5 active:scale-95"
                  >
                    <span className="text-base font-bold leading-none">+</span> Tambah Pesanan
                  </button>
                  {/* 3 radiant sparkle lines (Matches Reference Image) */}
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

            {/* Status Filter Pills with Live Counter Badges (Matching Reference Style) */}
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
                    onClick={() => {
                      setActiveFilter(tab.label);
                      setCurrentPage(1);
                    }}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center ${
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
                    <th className="py-4 px-5">No.</th>
                    <th className="py-4 px-5">Nomor Order Kopi Kenangan</th>
                    <th className="py-4 px-5">Nama Customer</th>
                    <th className="py-4 px-5">Status Pesanan</th>
                    <th className="py-4 px-5">Foto Bukti</th>
                    <th className="py-4 px-5">Waktu Update</th>
                    <th className="py-4 px-5 text-center">Aksi</th>
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
                          <td className="py-4 px-5 font-bold text-gray-700">{startIndex + idx + 1}</td>
                          <td className="py-4 px-5 font-black text-gray-900 tracking-wide text-xs">{displayNo}</td>
                          <td className="py-4 px-5 font-bold text-gray-800 text-xs">{order.customerName}</td>
                          <td className="py-4 px-5">{renderStatusBadge(order.status)}</td>
                          <td className="py-4 px-5">
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
                          <td className="py-4 px-5 text-gray-700 font-medium">
                            {formatUpdatedAt(order.updatedAt || order.createdAt)}
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center justify-center gap-3.5">
                              {/* View Tracking Link */}
                              <a
                                href={`/track/${order.kopkenOrderNo || order.orderCode}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka Link Tracking Customer"
                                className="text-gray-700 hover:text-black transition"
                              >
                                <Eye className="w-4 h-4 stroke-[1.8]" />
                              </a>
                              {/* Edit Modal Button */}
                              <button
                                onClick={() => openEditModal(order)}
                                title="Edit Status & Foto Bukti"
                                className="text-gray-700 hover:text-blue-600 transition"
                              >
                                <Pencil className="w-4 h-4 stroke-[1.8]" />
                              </button>
                              {/* Delete Order Button */}
                              <button
                                onClick={() => handleDeleteOrder(order.orderCode)}
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
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-gray-100 transition text-xs font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition ${
                      pNum === safeCurrentPage
                        ? 'bg-[#E92D79] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-gray-100 transition text-xs font-bold"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DASHBOARD (Overview, Key Metrics & Quick Actions)                 */}
        {/* ========================================================================= */}
        {activeMenu === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Penjualan</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-gray-900">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Akumulasi seluruh pesanan</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pesanan</span>
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-gray-900">{totalOrders} Pesanan</h3>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">{completedCount} pesanan selesai diterima</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
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

              <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Siap &amp; Diantar</span>
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Bike className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-gray-900">{readyCount + deliveringCount} Pesanan</h3>
                  <p className="text-[11px] text-sky-600 font-semibold mt-1">{deliveringCount} sedang diantar kurir</p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Live Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Actions Card */}
              <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm md:col-span-2 space-y-4">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" /> Aksi Cepat Admin
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    onClick={openCreateModal}
                    className="p-4 rounded-2xl bg-pink-50/70 hover:bg-pink-100 text-pink-700 font-bold text-xs flex flex-col items-center justify-center text-center gap-2 transition"
                  >
                    <PlusCircle className="w-5 h-5 text-pink-600" />
                    <span>+ Tambah Pesanan</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu('settings');
                      setSettingsTab('pricing');
                    }}
                    className="p-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100 text-amber-800 font-bold text-xs flex flex-col items-center justify-center text-center gap-2 transition"
                  >
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    <span>Atur Fee &amp; Harga</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu('settings');
                      setSettingsTab('hours');
                    }}
                    className="p-4 rounded-2xl bg-purple-50/70 hover:bg-purple-100 text-purple-800 font-bold text-xs flex flex-col items-center justify-center text-center gap-2 transition"
                  >
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span>Jam Operasional</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu('settings');
                      setSettingsTab('bgm');
                    }}
                    className="p-4 rounded-2xl bg-pink-50/70 hover:bg-pink-100 text-pink-700 font-bold text-xs flex flex-col items-center justify-center text-center gap-2 transition"
                  >
                    <Music className="w-5 h-5 text-pink-600" />
                    <span>Musik Café</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu('settings');
                      setSettingsTab('bundling');
                    }}
                    className="p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex flex-col items-center justify-center text-center gap-2 transition"
                  >
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    <span>Paket Bundling</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu('settings');
                      setSettingsTab('reviews');
                    }}
                    className="p-4 rounded-2xl bg-rose-50/70 hover:bg-rose-100 text-rose-800 font-bold text-xs flex flex-col items-center justify-center text-center gap-2 transition"
                  >
                    <Star className="w-5 h-5 text-rose-600" />
                    <span>Kelola Ulasan</span>
                  </button>
                </div>
              </div>

              {/* Status Info Card */}
              <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-gray-900">Status Operasional Web</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-pink-50/50 rounded-2xl flex items-center justify-between border border-pink-100">
                    <span className="font-semibold text-gray-600">Jam Layanan:</span>
                    <span className="font-extrabold text-pink-700">
                      {pricing.web_hours?.open || '09:00'} - {pricing.web_hours?.close || '12:00'} WIB
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-2xl flex items-center justify-between border border-emerald-100">
                    <span className="font-semibold text-gray-600">Fee Standar:</span>
                    <span className="font-extrabold text-emerald-700">
                      Rp {Number(pricing.default_markup || 5000).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-3 bg-purple-50/50 rounded-2xl flex items-center justify-between border border-purple-100">
                    <span className="font-semibold text-gray-600">Playlist Musik:</span>
                    <span className="font-extrabold text-purple-700">
                      {pricing.bgm?.playlist?.length || 3} Lagu Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900">5 Pesanan Terkini</h3>
                <button
                  onClick={() => setActiveMenu('orders')}
                  className="text-xs font-bold text-pink-600 hover:text-pink-700"
                >
                  Lihat Semua Pesanan →
                </button>
              </div>
              <div className="divide-y divide-pink-50 text-xs">
                {orders.slice(0, 5).map((ord) => (
                  <div key={ord.orderCode} className="py-3 flex items-center justify-between">
                    <div>
                      <b className="text-gray-900 text-sm">#{ord.kopkenOrderNo || ord.orderCode.replace('KYUTI-', '')}</b>
                      <p className="text-gray-400 text-[11px]">{ord.customerName} • {ord.outletName || 'Kopi Kenangan'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderStatusBadge(ord.status)}
                      <span className="font-bold text-gray-700">Rp {(ord.total || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: LAPORAN (Financial Reports & Order Statistics)                    */}
        {/* ========================================================================= */}
        {activeMenu === 'reports' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-pink-100 space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Laporan &amp; Analisis Penjualan</h2>
              <p className="text-xs text-gray-400 mt-1">Ringkasan performa pemesanan dan distribusi status pesanan</p>
            </div>

            {/* Stat Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#FFF5F7] border border-pink-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Omzet Keseluruhan</span>
                <h4 className="text-2xl font-black text-pink-600 mt-1">Rp {totalRevenue.toLocaleString('id-ID')}</h4>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Rata-Rata Order (AOV)</span>
                <h4 className="text-2xl font-black text-emerald-700 mt-1">Rp {avgOrderValue.toLocaleString('id-ID')}</h4>
              </div>
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Pesanan Selesai</span>
                <h4 className="text-2xl font-black text-purple-700 mt-1">{completedCount} / {totalOrders} Selesai</h4>
              </div>
            </div>

            {/* Status Breakdown Bar */}
            <div className="space-y-3 pt-4 border-t border-pink-50">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Distribusi Status Pesanan</h4>
              <div className="space-y-2">
                {[
                  { label: 'Pesanan Diterima & Diproses', count: pendingCount, color: 'bg-amber-400' },
                  { label: 'Siap Diambil di Outlet', count: readyCount, color: 'bg-emerald-400' },
                  { label: 'Sedang Diantar Kurir', count: deliveringCount, color: 'bg-sky-400' },
                  { label: 'Pesanan Diterima Customer', count: completedCount, color: 'bg-emerald-600' },
                ].map((item, i) => {
                  const pct = totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-600">
                        <span>{item.label} ({item.count})</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: PENGATURAN (Full implementation of _legacy_php admin features)    */}
        {/* ========================================================================= */}
        {activeMenu === 'settings' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-pink-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pink-50">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <Settings className="w-6 h-6 text-pink-600" />
                  Pengaturan &amp; Kelola Fee (Admin)
                </h2>
                <p className="text-xs text-gray-400 mt-1">Ubah fee menu, jam operasional, bundling, musik, dan ulasan langsung di website</p>
              </div>
              <button
                onClick={() => saveAllPricingSettings()}
                disabled={savingSettings}
                className="px-5 py-2.5 bg-[#DB2777] hover:bg-pink-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-pink-200 transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>💾</span>}
                Simpan Perubahan
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-pink-50 scrollbar-none">
              {[
                { id: 'pricing', label: '💰 Fee & Harga Menu' },
                { id: 'bundling', label: '🎁 Paket Bundling' },
                { id: 'hours', label: '⏰ Jam Operasional' },
                { id: 'bgm', label: '🎵 Musik Café (BGM)' },
                { id: 'reviews', label: `⭐ Kelola Ulasan (${reviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSettingsTab(tab.id as any)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                    settingsTab === tab.id
                      ? 'bg-[#FCE7F3] text-[#DB2777] shadow-xs font-black'
                      : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: FEE & HARGA MENU */}
            {settingsTab === 'pricing' && (
              <div className="space-y-6 pt-2">
                {/* Info Card */}
                <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 text-xs text-gray-700 space-y-1">
                  <p className="font-bold text-pink-800">💡 Formula Penentuan Harga:</p>
                  <code className="text-pink-600 font-bold bg-white px-2 py-0.5 rounded-lg border border-pink-100 inline-block">
                    (Harga Asli Kopi Kenangan - 50%) + Fee
                  </code>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Atur fee default, fee per kategori makanan/minuman, serta fee khusus menu atau ukuran Large!
                  </p>
                </div>

                {/* 1. Fee Default */}
                <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-2">
                  <label className="block text-xs font-extrabold text-gray-900">1. Fee Default Per Menu (Standar)</label>
                  <div className="relative max-w-sm">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">Rp +</span>
                    <input
                      type="number"
                      value={pricing.default_markup}
                      onChange={(e) => setPricing({ ...pricing, default_markup: Number(e.target.value) })}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">Fee dasar jika menu tidak memiliki fee khusus kategori atau menu.</p>
                </div>

                {/* 2. Fee Kategori */}
                <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-3">
                  <label className="block text-xs font-extrabold text-gray-900">2. Fee Berdasarkan Kategori</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 block mb-1">☕ Minuman (Coffee, etc)</span>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">Rp +</span>
                        <input
                          type="number"
                          value={pricing.category_markups?.Minuman ?? pricing.category_markups?.Coffee ?? 5000}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPricing({
                              ...pricing,
                              category_markups: {
                                ...pricing.category_markups,
                                Minuman: val,
                                Coffee: val,
                                'Non Coffee': val,
                                Frappe: val,
                              },
                            });
                          }}
                          className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 block mb-1">🥪 Makanan &amp; Toast</span>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">Rp +</span>
                        <input
                          type="number"
                          value={pricing.category_markups?.Makanan ?? pricing.category_markups?.Food ?? 4500}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPricing({
                              ...pricing,
                              category_markups: {
                                ...pricing.category_markups,
                                Makanan: val,
                                Food: val,
                              },
                            });
                          }}
                          className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Fee Khusus Menu & Large */}
                <div className="p-5 rounded-2xl border border-pink-100 bg-pink-50/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-extrabold text-gray-900 block">3. Fee Khusus Menu Tertentu &amp; Ukuran Large</label>
                      <p className="text-[11px] text-gray-400">Prioritas utama: Menggantikan fee kategori untuk menu yang dipilih</p>
                    </div>
                    <span className="text-[10px] bg-pink-100 text-pink-700 px-2.5 py-1 rounded-full font-bold">Prioritas Utama</span>
                  </div>

                  {/* Active Overrides List */}
                  <div className="space-y-2">
                    {Array.isArray(pricing.item_markup_overrides) && pricing.item_markup_overrides.length > 0 ? (
                      pricing.item_markup_overrides.map((ov: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 text-xs">
                          <span className="font-bold text-gray-800">{ov.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">
                              + Rp {Number(ov.fee).toLocaleString('id-ID')}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItemOverride(ov.name)}
                              className="text-gray-400 hover:text-red-500 p-1"
                              title="Hapus fee khusus"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">Belum ada fee khusus menu. Tambahkan di bawah ini:</p>
                    )}
                  </div>

                  {/* Add New Override Box */}
                  <div className="p-4 bg-white rounded-2xl border border-dashed border-pink-300 space-y-3">
                    <b className="text-xs text-gray-900 block">+ Pasang Fee Khusus Menu &amp; Ukuran:</b>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">Pilih Menu dari API:</span>
                        <select
                          value={selectedMenuItem}
                          onChange={(e) => setSelectedMenuItem(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                          <option value="">-- Pilih Menu --</option>
                          {menuList.map((m, i) => (
                            <option key={i} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">Pilih Ukuran:</span>
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                          <option value="">Regular / Default</option>
                          <option value="Large">Khusus Ukuran Large ⭐</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">Nominal Fee (Rp):</span>
                        <input
                          type="number"
                          value={itemOverrideFee}
                          onChange={(e) => setItemOverrideFee(Number(e.target.value))}
                          placeholder="6000"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </div>
                    </div>

                    {!selectedMenuItem && (
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">Atau Ketik Nama Menu Manual:</span>
                        <input
                          type="text"
                          value={customMenuName}
                          onChange={(e) => setCustomMenuName(e.target.value)}
                          placeholder="Misal: Kopi Kenangan Mantan"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddItemOverride}
                      className="w-full py-2.5 bg-[#DB2777] hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      + Pasang Fee Khusus Menu
                    </button>
                  </div>
                </div>

                {/* 4. Single Item Fee & Kantong Belanja */}
                <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-3">
                  <label className="block text-xs font-extrabold text-gray-900">4. Biaya Tambahan Lainnya (Addon)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 block mb-1">Fee Order 1 Pcs (0 = Bebas Fee)</span>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">Rp +</span>
                        <input
                          type="number"
                          value={pricing.single_item_fee}
                          onChange={(e) => setPricing({ ...pricing, single_item_fee: Number(e.target.value) })}
                          className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 block mb-1">Kantong Plastik</span>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">Rp +</span>
                        <input
                          type="number"
                          value={pricing.plastic_bag_fee}
                          onChange={(e) => setPricing({ ...pricing, plastic_bag_fee: Number(e.target.value) })}
                          className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PAKET BUNDLING */}
            {settingsTab === 'bundling' && (
              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Kontrol Menu Bundling (ON / OFF)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Aktifkan atau matikan paket bundling langsung dari website</p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'bundle_2_cup_large', name: 'PAKET BUNDLING 2 CUP LARGE', desc: 'Diskon hemat 2 cup ukuran besar' },
                    { key: 'bundle_2_frappe', name: 'PAKET BUNDLING 2 FRAPPE', desc: '2 Frappe pilihan manis segar' },
                    { key: 'promo_minuman_special', name: 'PROMO MINUMAN SPECIAL', desc: 'Minuman spesial pilihan barista' },
                    { key: 'bundle_hemat_3_item', name: 'PAKET HEMAT 3 ITEM', desc: 'Bundling komplit 3 item kopi & makanan' },
                  ].map((b) => {
                    const isEnabled = pricing.bundling_status?.[b.key] !== false;
                    return (
                      <div
                        key={b.key}
                        className="flex items-center justify-between p-4 bg-gray-50/70 rounded-2xl border border-gray-200"
                      >
                        <div>
                          <b className="text-xs text-gray-900 block">{b.name}</b>
                          <span className="text-[11px] text-gray-400">{b.desc}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleBundle(b.key)}
                          className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                            isEnabled ? 'bg-[#DB2777]' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                              isEnabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Nonaktifkan Menu Tertentu di Dalam Bundling */}
                <div className="p-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50/30 space-y-3">
                  <b className="text-xs text-gray-900 block">Matikan Menu Tertentu di Dalam Bundling:</b>
                  <p className="text-[11px] text-gray-400">Jika salah satu varian menu di bundling sedang habis stoknya di outlet:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={disabledBundlingOptionInput}
                      onChange={(e) => setDisabledBundlingOptionInput(e.target.value)}
                      placeholder="Contoh: Kopi Kenangan Mantan atau Dutch Choco"
                      className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddDisabledBundlingOption}
                      className="px-4 py-2.5 bg-gray-800 text-white font-bold text-xs rounded-xl hover:bg-black transition"
                    >
                      + Matikan
                    </button>
                  </div>

                  {/* List Disabled Options */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {Array.isArray(pricing.disabled_bundling_options) &&
                      pricing.disabled_bundling_options.map((opt: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200"
                        >
                          <span>{opt} (Nonaktif)</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDisabledBundlingOption(opt)}
                            className="hover:text-red-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: JAM OPERASIONAL WEB */}
            {settingsTab === 'hours' && (
              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" /> Jam Operasional Pemesanan Web
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Atur jam operasional layanan (misal <b>09.00 - 12.00 WIB</b>). Di luar jam ini checkout otomatis dibatasi.
                  </p>
                </div>

                {/* Toggle Enable */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div>
                    <b className="text-xs text-gray-900 block">Batasi Sesuai Jam Operasional</b>
                    <span className="text-[11px] text-gray-400">Nonaktifkan jika ingin web buka 24 jam nonstop</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPricing({
                        ...pricing,
                        web_hours: { ...pricing.web_hours, enabled: !pricing.web_hours?.enabled },
                      })
                    }
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                      pricing.web_hours?.enabled ? 'bg-[#DB2777]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                        pricing.web_hours?.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Jam Buka & Tutup */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 block mb-1">Jam Buka (WIB)</span>
                    <input
                      type="time"
                      value={pricing.web_hours?.open || '09:00'}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          web_hours: { ...pricing.web_hours, open: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-center focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 block mb-1">Jam Tutup (WIB)</span>
                    <input
                      type="time"
                      value={pricing.web_hours?.close || '12:00'}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          web_hours: { ...pricing.web_hours, close: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-center focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                {/* Mode Override */}
                <div className="max-w-md space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block">Status Khusus / Override Manual</span>
                  <select
                    value={pricing.web_hours?.force_status || 'auto'}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        web_hours: { ...pricing.web_hours, force_status: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="auto">⚡ Otomatis (Sesuai Jam Buka &amp; Tutup)</option>
                    <option value="open">🟢 Paksa Selalu Buka (Abaikan Jam)</option>
                    <option value="closed">🔴 Paksa Tutup Sementara Sekarang</option>
                  </select>
                </div>

                {/* Pesan Saat Tutup */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block">Pesan Ramah Saat Web Tutup</span>
                  <textarea
                    rows={3}
                    value={pricing.web_hours?.closed_message || ''}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        web_hours: { ...pricing.web_hours, closed_message: e.target.value },
                      })
                    }
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="Pesan ramah untuk pelanggan saat jam layanan tutup..."
                  />
                </div>
              </div>
            )}

            {/* TAB 4: MUSIK CAFÉ (BGM) */}
            {settingsTab === 'bgm' && (
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                      <Music className="w-4 h-4 text-pink-600" /> Pengaturan Pemutar Musik Café (BGM)
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Kelola lagu background café dan tarik otomatis lagu viral TikTok</p>
                  </div>
                  <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                    {pricing.bgm?.playlist?.length || 0} Lagu Aktif
                  </span>
                </div>

                {/* Toggle Enable & Volume */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <div>
                      <b className="text-xs text-gray-900 block">Tampilkan Pemutar Musik</b>
                      <span className="text-[11px] text-gray-400">Audio café otomatis di website</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPricing({
                          ...pricing,
                          bgm: { ...pricing.bgm, enabled: !pricing.bgm?.enabled },
                        })
                      }
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                        pricing.bgm?.enabled ? 'bg-[#DB2777]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                          pricing.bgm?.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Volume Default:</span>
                      <span className="text-pink-600 font-black">{Math.round((pricing.bgm?.default_volume ?? 0.4) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={Math.round((pricing.bgm?.default_volume ?? 0.4) * 100)}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          bgm: { ...pricing.bgm, default_volume: Number(e.target.value) / 100 },
                        })
                      }
                      className="w-full accent-pink-600"
                    />
                  </div>
                </div>

                {/* Auto-Sync TikTok Viral Songs Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <b className="text-xs text-gray-900">Auto-Sync Lagu Viral TikTok (Versi Lirik Full)</b>
                    </div>
                    <span className="text-[10px] bg-pink-600 text-white font-bold px-2.5 py-0.5 rounded-full">Full Song</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Tarik otomatis 10–20 daftar lagu trending TikTok (Denny Caknan, Tulus, Raim Laode, Nadhif Basalamah) versi lirik audio jernih.
                  </p>
                  <button
                    type="button"
                    onClick={handleSyncTikTokHits}
                    disabled={syncingTikTok}
                    className="w-full py-2.5 bg-[#DB2777] hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    {syncingTikTok ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>🔄</span>}
                    Tarik Lagu Viral TikTok Sekarang
                  </button>
                </div>

                {/* Playlist Active */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <b className="text-xs text-gray-900">Daftar Lagu Aktif:</b>
                    <button
                      type="button"
                      onClick={handleResetBgmDefault}
                      className="text-[11px] font-bold text-pink-600 hover:underline"
                    >
                      ↺ Reset Lagu Default
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {pricing.bgm?.playlist?.map((track: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-200 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <b className="text-gray-900 block">{track.title}</b>
                            <span className="text-[10px] text-gray-400">{track.artist}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTrack(idx)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Hapus Lagu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Song (Upload MP3 or Link) */}
                <div className="p-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50/30 space-y-3">
                  <b className="text-xs text-gray-900 block">+ Tambah Lagu Baru ke Playlist:</b>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBgmTab('upload')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        bgmTab === 'upload' ? 'bg-[#DB2777] text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      📤 Upload File MP3
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgmTab('link')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        bgmTab === 'link' ? 'bg-[#DB2777] text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      🔗 Input Link URL / YouTube
                    </button>
                  </div>

                  {bgmTab === 'upload' ? (
                    <div className="space-y-3 pt-2">
                      <input
                        type="file"
                        accept="audio/*,.mp3"
                        onChange={(e) => setBgmUploadFile(e.target.files?.[0] || null)}
                        className="text-xs"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={bgmUploadTitle}
                          onChange={(e) => setBgmUploadTitle(e.target.value)}
                          placeholder="Judul Lagu (misal: Lofi Kopi Sore)"
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                        />
                        <input
                          type="text"
                          value={bgmUploadArtist}
                          onChange={(e) => setBgmUploadArtist(e.target.value)}
                          placeholder="Artis / Keterangan"
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleUploadAudio}
                        disabled={uploadingAudio}
                        className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                      >
                        {uploadingAudio ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload &amp; Simpan Lagu
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <input
                        type="text"
                        value={bgmLinkUrl}
                        onChange={(e) => setBgmLinkUrl(e.target.value)}
                        placeholder="Link URL MP3 atau ID YouTube (misal: 6kKuzB_YOmc)"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={bgmLinkTitle}
                          onChange={(e) => setBgmLinkTitle(e.target.value)}
                          placeholder="Judul Lagu"
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                        />
                        <input
                          type="text"
                          value={bgmLinkArtist}
                          onChange={(e) => setBgmLinkArtist(e.target.value)}
                          placeholder="Artis / Penyanyi"
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddBgmLink}
                        className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <LinkIcon className="w-4 h-4" /> Tambahkan Link Lagu
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: KELOLA ULASAN CUSTOMER */}
            {settingsTab === 'reviews' && (
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" /> Kelola &amp; Hapus Ulasan Customer
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Hapus ulasan spam atau kelola testimoni yang tampil di beranda website</p>
                  </div>
                  <button
                    onClick={fetchReviews}
                    className="p-2 bg-gray-50 hover:bg-pink-50 rounded-xl text-gray-500 hover:text-pink-600 transition"
                    title="Refresh Ulasan"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingReviews ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="space-y-3">
                  {loadingReviews ? (
                    <p className="text-center py-8 text-xs text-gray-400">Memuat data ulasan...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-center py-8 text-xs text-gray-400">Belum ada ulasan customer.</p>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <b className="text-xs text-gray-900">{rev.name}</b>
                            <span className="text-[10px] text-amber-500 font-black">
                              {'★'.repeat(rev.rating || 5)}
                            </span>
                            <span className="text-[10px] text-gray-400">• {rev.date}</span>
                          </div>
                          {rev.menu && <span className="text-[11px] text-pink-600 font-semibold block">{rev.menu}</span>}
                          <p className="text-xs text-gray-600 italic leading-relaxed">"{rev.comment}"</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Hapus Ulasan Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT PESANAN (Presisi Gambar 1 & 2 + Photo Upload)         */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-pink-100 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-pink-50">
              <h3 className="text-lg font-black text-gray-900">
                {modalMode === 'create' ? 'Tambah Pesanan' : 'Edit Pesanan'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nomor Order Kopi Kenangan */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Nomor Order Kopi Kenangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formKopkenNo}
                    onChange={(e) => setFormKopkenNo(e.target.value)}
                    placeholder="80537"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E92D79]/20 focus:border-[#E92D79] transition text-xs"
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
                    placeholder="Alya"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E92D79]/20 focus:border-[#E92D79] transition text-xs font-medium"
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
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E92D79]/20 focus:border-[#E92D79] font-semibold transition text-xs"
                >
                  <option value="diterima">Pesanan Diterima</option>
                  <option value="diproses">Pesanan Diproses</option>
                  <option value="disiapkan">Sedang Disiapkan</option>
                  <option value="siap">Siap Diambil</option>
                  <option value="diantar">Pesanan Diantar 🛵</option>
                  <option value="selesai">Pesanan Diterima / Selesai 🎉</option>
                </select>
              </div>

              {/* Foto Bukti Pesanan */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Foto Bukti Pesanan <span className="text-red-500">*</span>
                </label>

                <div className="flex items-center gap-3">
                  {/* Photo Preview if uploaded */}
                  {formPhotoUrl ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-pink-200 shadow-xs flex-shrink-0 group">
                      <img src={formPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormPhotoUrl('')}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black transition"
                        title="Hapus Foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}

                  {/* Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-pink-200 hover:border-[#E92D79] bg-[#FFF0F5]/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center min-h-[96px]"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    {uploadingPhoto ? (
                      <div className="flex items-center gap-2 text-[#E92D79] text-xs font-semibold">
                        <div className="w-4 h-4 border-2 border-[#E92D79] border-t-transparent rounded-full animate-spin"></div>
                        Mengupload ke Vercel Blob...
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5 text-[#E92D79] mb-1" />
                        <span className="text-xs font-bold text-[#E92D79]">
                          {formPhotoUrl ? 'Ganti Foto' : 'Pilih Foto'}
                        </span>
                        <span className="text-[10px] text-gray-400">JPG, PNG atau WebP</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-pink-50">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingOrder || uploadingPhoto}
                  className="px-8 py-2.5 bg-[#E92D79] hover:bg-[#D81B60] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-200 transition"
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
