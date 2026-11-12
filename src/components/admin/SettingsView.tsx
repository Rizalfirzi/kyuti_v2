'use client';

import React, { useState } from 'react';
import {
  Settings,
  DollarSign,
  Gift,
  Clock,
  Music,
  Star,
  RefreshCw,
  PlusCircle,
  Trash2,
  Volume2,
} from 'lucide-react';

interface SettingsViewProps {
  pricing: any;
  setPricing: (p: any) => void;
  saveAllPricingSettings: (custom?: any) => Promise<void>;
  savingSettings: boolean;
  reviews: any[];
  loadingReviews: boolean;
  fetchReviews: () => void;
  handleDeleteReview: (id: string) => void;
  syncingTikTok: boolean;
  handleSyncTikTokHits: () => void;
  menuItemsList: string[];
}

export function SettingsView({
  pricing,
  setPricing,
  saveAllPricingSettings,
  savingSettings,
  reviews,
  loadingReviews,
  fetchReviews,
  handleDeleteReview,
  syncingTikTok,
  handleSyncTikTokHits,
  menuItemsList,
}: SettingsViewProps) {
  const [settingsTab, setSettingsTab] = useState<'pricing' | 'bundling' | 'hours' | 'bgm' | 'reviews'>('pricing');

  // Local inputs for adding overrides
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [customMenuName, setCustomMenuName] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [itemOverrideFee, setItemOverrideFee] = useState<number>(6000);

  // Bundling input
  const [disabledBundlingOptionInput, setDisabledBundlingOptionInput] = useState('');

  // BGM Inputs
  const [bgmLinkUrl, setBgmLinkUrl] = useState('');
  const [bgmLinkTitle, setBgmLinkTitle] = useState('');
  const [bgmLinkArtist, setBgmLinkArtist] = useState('');

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

  const handleRemoveItemOverride = (targetName: string) => {
    const existingOverrides = Array.isArray(pricing.item_markup_overrides)
      ? [...pricing.item_markup_overrides]
      : [];
    const filtered = existingOverrides.filter((it: any) => it.name !== targetName);
    const updated = { ...pricing, item_markup_overrides: filtered };
    setPricing(updated);
    saveAllPricingSettings(updated);
  };

  const handleToggleBundle = (key: string) => {
    const currentStatus = { ...(pricing.bundling_status || {}) };
    currentStatus[key] = !currentStatus[key];
    const updated = { ...pricing, bundling_status: currentStatus };
    setPricing(updated);
    saveAllPricingSettings(updated);
  };

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

  const handleRemoveDisabledBundlingOption = (opt: string) => {
    const list = Array.isArray(pricing.disabled_bundling_options)
      ? [...pricing.disabled_bundling_options]
      : [];
    const updated = { ...pricing, disabled_bundling_options: list.filter((o: string) => o !== opt) };
    setPricing(updated);
    saveAllPricingSettings(updated);
  };

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = bgmLinkUrl.trim();
    if (!url) return;

    let youtubeId = '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      youtubeId = match[1];
    } else if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
      youtubeId = url;
    }

    const currentPlaylist = Array.isArray(pricing.bgm?.playlist) ? [...pricing.bgm.playlist] : [];
    const newTrack = {
      title: bgmLinkTitle.trim() || 'Lagu Pilihan Kyuti',
      artist: bgmLinkArtist.trim() || 'Kedai Kyuti Playlist',
      ...(youtubeId ? { youtube_id: youtubeId } : { file: url }),
    };

    const updated = {
      ...pricing,
      bgm: { ...pricing.bgm, playlist: [newTrack, ...currentPlaylist] },
    };
    setPricing(updated);
    await saveAllPricingSettings(updated);
    setBgmLinkUrl('');
    setBgmLinkTitle('');
    setBgmLinkArtist('');
  };

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

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-pink-100/80 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pink-50">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#E92D79]" />
            Pengaturan &amp; Kelola Fee (Admin)
          </h2>
          <p className="text-xs text-gray-400 mt-1">Ubah fee menu, jam operasional, bundling, musik, dan ulasan langsung di website</p>
        </div>
        <button
          type="button"
          onClick={() => saveAllPricingSettings()}
          disabled={savingSettings}
          className="px-5 py-2.5 bg-[#E92D79] hover:bg-[#D81B60] text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto border-0"
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
            type="button"
            onClick={() => setSettingsTab(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap border-0 ${
              settingsTab === tab.id
                ? 'bg-[#FFE8F0] text-[#E92D79] shadow-xs'
                : 'text-gray-500 hover:text-[#E92D79] hover:bg-pink-50/50'
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
            <p className="font-bold text-[#E92D79]">💡 Formula Penentuan Harga:</p>
            <code className="text-[#E92D79] font-bold bg-white px-2 py-0.5 rounded-lg border border-pink-100 inline-block">
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
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
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
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
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
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
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
              <span className="text-[10px] bg-pink-100 text-[#E92D79] px-2.5 py-1 rounded-full font-bold">Prioritas Utama</span>
            </div>

            {/* Active Overrides List */}
            <div className="space-y-2">
              {Array.isArray(pricing.item_markup_overrides) && pricing.item_markup_overrides.length > 0 ? (
                pricing.item_markup_overrides.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-pink-100 shadow-2xs"
                  >
                    <div>
                      <b className="text-xs text-gray-900">{item.name}</b>
                      <span className="text-[11px] text-[#E92D79] font-black block">
                        Fee: +Rp {Number(item.fee).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItemOverride(item.name)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="Hapus Fee Khusus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">Belum ada fee khusus.</p>
              )}
            </div>

            {/* Form Add Fee Khusus */}
            <div className="pt-3 border-t border-pink-100 flex flex-wrap gap-2.5 items-end">
              <div className="flex-1 min-w-[160px]">
                <span className="text-[10px] font-bold text-gray-400 block mb-1">Pilih Menu</span>
                <select
                  value={selectedMenuItem}
                  onChange={(e) => setSelectedMenuItem(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
                >
                  <option value="">-- Pilih dari Menu Kopi Kenangan --</option>
                  {menuItemsList.map((m, i) => (
                    <option key={i} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <span className="text-[10px] font-bold text-gray-400 block mb-1">Ukuran</span>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
                >
                  <option value="">Reguler / Semua</option>
                  <option value="Large">Large</option>
                </select>
              </div>
              <div className="w-32">
                <span className="text-[10px] font-bold text-gray-400 block mb-1">Nominal Fee (+Rp)</span>
                <input
                  type="number"
                  value={itemOverrideFee}
                  onChange={(e) => setItemOverrideFee(Number(e.target.value))}
                  placeholder="6000"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItemOverride}
                className="px-4 py-2 bg-[#E92D79] hover:bg-[#D81B60] text-white font-bold text-xs rounded-xl shadow-sm transition border-0"
              >
                + Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAKET BUNDLING */}
      {settingsTab === 'bundling' && (
        <div className="space-y-6 pt-2">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#E92D79]" /> Kelola Status Paket Bundling
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Aktifkan atau nonaktifkan paket bundling hemat yang tampil di beranda website</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'large', name: 'Paket Bundling 2 Cup Large', desc: 'Diskon hemat untuk 2 cup large' },
              { key: 'frappe', name: 'Paket Bundling 2 Frappe / Ice Blended', desc: 'Bundling khusus minuman ice blended' },
              { key: 'toast', name: 'Paket Bundling Toast + Minuman', desc: 'Kombinasi makanan & minuman' },
              { key: 'botol', name: 'Paket Bundling Kenangan Literan / Botol', desc: 'Kemasan 1 Liter untuk stok' },
            ].map((b) => {
              const isEnabled = pricing.bundling_status ? pricing.bundling_status[b.key] !== false : true;
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
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 border-0 ${
                      isEnabled ? 'bg-[#E92D79]' : 'bg-gray-300'
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

          {/* Matikan Varian Bundling Tertentu */}
          <div className="p-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50/30 space-y-3">
            <b className="text-xs text-gray-900 block">Matikan Menu Tertentu di Dalam Bundling:</b>
            <p className="text-[11px] text-gray-400">Jika salah satu varian menu di bundling sedang habis stoknya:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={disabledBundlingOptionInput}
                onChange={(e) => setDisabledBundlingOptionInput(e.target.value)}
                placeholder="Contoh: Kopi Kenangan Mantan atau Dutch Choco"
                className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
              />
              <button
                type="button"
                onClick={handleAddDisabledBundlingOption}
                className="px-4 py-2.5 bg-gray-800 text-white font-bold text-xs rounded-xl hover:bg-black transition border-0"
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
                      className="hover:text-red-900 border-0 bg-transparent"
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
              Atur jam operasional layanan (misal <b>09.00 - 12.00 WIB</b>). Di luar jam ini checkout dibatasi.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 max-w-lg">
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
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 border-0 ${
                pricing.web_hours?.enabled ? 'bg-[#E92D79]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                  pricing.web_hours?.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-center focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-center focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BGM CAFE MUSIK */}
      {settingsTab === 'bgm' && (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Music className="w-4 h-4 text-[#E92D79]" /> Kelola Playlist Musik Café (BGM)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Musik yang diputar otomatis saat customer berselancar di website</p>
            </div>
            <button
              type="button"
              onClick={handleSyncTikTokHits}
              disabled={syncingTikTok}
              className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#E92D79] font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-pink-200 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingTikTok ? 'animate-spin' : ''}`} />
              {syncingTikTok ? 'Syncing...' : 'Sync Trending TikTok'}
            </button>
          </div>

          {/* Add Track Form */}
          <form onSubmit={handleAddTrack} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <span className="text-xs font-bold text-gray-800 block">+ Tambah Lagu dari YouTube URL</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={bgmLinkUrl}
                onChange={(e) => setBgmLinkUrl(e.target.value)}
                placeholder="https://youtu.be/... atau Video ID"
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
              />
              <input
                type="text"
                value={bgmLinkTitle}
                onChange={(e) => setBgmLinkTitle(e.target.value)}
                placeholder="Judul Lagu"
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
              />
              <input
                type="text"
                value={bgmLinkArtist}
                onChange={(e) => setBgmLinkArtist(e.target.value)}
                placeholder="Penyanyi / Artis"
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E92D79]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E92D79] hover:bg-[#D81B60] text-white font-bold text-xs rounded-xl shadow-xs transition border-0"
            >
              + Tambah ke Playlist
            </button>
          </form>

          {/* Playlist List */}
          <div className="space-y-2">
            {Array.isArray(pricing.bgm?.playlist) &&
              pricing.bgm.playlist.map((track: any, i: number) => (
                <div
                  key={i}
                  className="p-3 bg-white rounded-xl border border-pink-100 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-pink-50 text-[#E92D79] flex items-center justify-center text-xs font-black">
                      {i + 1}
                    </span>
                    <div>
                      <b className="text-xs text-gray-900 block">{track.title}</b>
                      <span className="text-[11px] text-gray-400">{track.artist}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTrack(i)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition border-0 bg-transparent"
                    title="Hapus Lagu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
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
              type="button"
              onClick={fetchReviews}
              className="p-2 bg-gray-50 hover:bg-pink-50 rounded-xl text-gray-500 hover:text-[#E92D79] transition border-0"
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
                    {rev.menu && <span className="text-[11px] text-[#E92D79] font-semibold block">{rev.menu}</span>}
                    <p className="text-xs text-gray-600 italic leading-relaxed">"{rev.comment}"</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border-0 bg-transparent"
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
  );
}

