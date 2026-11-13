'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  Copy,
  Check,
  Coffee,
  ShoppingBag,
  Clock,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  X,
  Maximize2,
  Bike,
  CheckCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

function formatWibTime(dateInput?: Date | string | number): string {
  if (!dateInput) return '';
  try {
    const date = typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date).replace(':', '.');
  } catch {
    return '';
  }
}

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const rawCode = params?.code as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const fetchOrder = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${rawCode}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setError(null);
      } else {
        setError(data.message || 'Pesanan tidak ditemukan');
      }
    } catch (err: any) {
      setError('Gagal memuat status pesanan');
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    if (rawCode) {
      fetchOrder();
      // Auto-refresh every 12 seconds
      const interval = setInterval(() => {
        fetchOrder();
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [rawCode]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-pink-600 font-medium">Memuat status pesanan kamu... ♡</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-pink-100">
          <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Pesanan Belum Ditemukan</h2>
          <p className="text-gray-500 text-sm mb-6">
            Nomor order <span className="font-semibold text-pink-600">#{rawCode}</span> belum tercatat di sistem atau belum diproses admin.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => fetchOrder(true)}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-2xl transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Coba Muat Ulang
            </button>
            <Link
              href="/"
              className="block w-full py-3 bg-pink-50 hover:bg-pink-100 text-pink-600 font-medium rounded-2xl transition"
            >
              Kembali ke Menu Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine active status rank
  const statusRanks: Record<OrderStatus, number> = {
    diterima: 1,
    diproses: 2,
    disiapkan: 3,
    siap: 4,
    diantar: 5,
    selesai: 6,
  };

  const currentRank = statusRanks[order.status] || 1;

  // Pre-defined timeline step definition (Matches Image 2 + Diantar & Diterima)
  const timelineSteps = [
    {
      key: 'diterima',
      rank: 1,
      title: 'Pesanan Diterima',
      desc: 'Pesanan kamu sudah kami terima.',
      icon: Check,
    },
    {
      key: 'diproses',
      rank: 2,
      title: 'Pesanan Diproses',
      desc: 'Pesanan sedang diproses oleh outlet.',
      icon: Coffee,
    },
    {
      key: 'disiapkan',
      rank: 3,
      title: 'Sedang Disiapkan',
      desc: 'Barista sedang menyiapkan pesanan kamu.',
      icon: Sparkles,
    },
    {
      key: 'siap',
      rank: 4,
      title: 'Siap Diambil',
      desc:
        currentRank >= 4
          ? 'Pesanan kamu sudah selesai dan siap untuk diambil.'
          : 'Pesanan kamu akan segera siap untuk diambil.',
      icon: ShoppingBag,
    },
    {
      key: 'diantar',
      rank: 5,
      title: 'Pesanan Diantar',
      desc:
        currentRank >= 5
          ? 'Pesanan kamu sedang dalam perjalanan diantar oleh kurir ke alamatmu.'
          : 'Pesanan kamu akan segera diantar oleh kurir.',
      icon: Bike,
    },
    {
      key: 'selesai',
      rank: 6,
      title: 'Pesanan Diterima',
      desc:
        currentRank >= 6
          ? 'Pesanan sudah sampai dan diterima. Selamat menikmati! ♡'
          : 'Pesanan telah selesai dan diterima olehmu.',
      icon: CheckCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF5F7] pb-16">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-pink-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link
          href="/"
          className="p-2 text-gray-600 hover:text-pink-600 rounded-full hover:bg-pink-50 transition"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">
            ☕
          </div>
          <span className="font-bold text-gray-800 text-base tracking-tight">Kedai Kyuti ♡</span>
        </div>
        <button
          onClick={() => fetchOrder(true)}
          className={`p-2 text-gray-600 hover:text-pink-600 rounded-full hover:bg-pink-50 transition ${
            isRefreshing ? 'animate-spin text-pink-600' : ''
          }`}
          title="Perbarui Status"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 space-y-4">
        {/* Order Number Box */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Nomor Order Kopi Kenangan</p>
              <div className="flex items-center gap-2 mt-1">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  #{order.kopkenOrderNo || order.orderCode.replace('KYUTI-', '')}
                </h1>
                <button
                  onClick={() => copyToClipboard(order.kopkenOrderNo || order.orderCode)}
                  className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                  title="Salin Nomor Order"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full">
                {order.customerName}
              </span>
              <p className="text-[11px] text-gray-400 mt-1">{order.outletName}</p>
            </div>
          </div>
        </div>

        {/* Big Status Banner (Matches Image 1 & 2 + Diantar & Diterima) */}
        {order.status === 'selesai' ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex items-center gap-4 shadow-sm animate-cute-pulse">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <CheckCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-700">Pesanan Diterima</h2>
              <p className="text-xs text-emerald-600 mt-0.5 leading-snug">
                Pesanan kamu sudah sampai dan diterima. Selamat menikmati! ♡
              </p>
            </div>
          </div>
        ) : order.status === 'diantar' ? (
          <div className="bg-sky-50 border border-sky-200 rounded-3xl p-4 flex items-center gap-4 shadow-sm animate-cute-pulse">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
              <Bike className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sky-700">Pesanan Diantar</h2>
              <p className="text-xs text-sky-600 mt-0.5 leading-snug">
                Kurir sedang mengantarkan pesanan kamu ke alamat tujuan.
              </p>
            </div>
          </div>
        ) : order.status === 'siap' ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex items-center gap-4 shadow-sm animate-cute-pulse">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-700">Siap Diambil</h2>
              <p className="text-xs text-emerald-600 mt-0.5 leading-snug">
                Pesanan kamu sudah selesai dan siap untuk diambil.
              </p>
            </div>
          </div>
        ) : order.status === 'disiapkan' ? (
          <div className="bg-purple-50 border border-purple-200 rounded-3xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-purple-700">Sedang Disiapkan</h2>
              <p className="text-xs text-purple-600 mt-0.5 leading-snug">
                Barista sedang menyiapkan pesanan kamu.
              </p>
            </div>
          </div>
        ) : order.status === 'diproses' ? (
          <div className="bg-[#FFF0F5] border border-pink-200 rounded-3xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
              <Coffee className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-pink-600">Pesanan Diproses</h2>
              <p className="text-xs text-pink-500 mt-0.5 leading-snug">
                Pesanan kamu sedang diproses oleh outlet.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-pink-50 border border-pink-200 rounded-3xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-pink-700">Pesanan Diterima</h2>
              <p className="text-xs text-pink-600 mt-0.5 leading-snug">
                Pesanan kamu sudah kami terima dan menunggu diproses.
              </p>
            </div>
          </div>
        )}

        {/* Stepper Timeline (Vertical Step list matching Image 1 & 2) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100">
          <div className="relative pl-6 space-y-6 before:absolute before:left-[15px] before:top-3 before:bottom-4 before:w-0.5 before:bg-pink-100">
            {timelineSteps.map((step) => {
              const isPassed = currentRank > step.rank;
              const isCurrent = currentRank === step.rank;
              const isPending = currentRank < step.rank;

              // Find matching history item for timestamp & proof photo
              const hist = order.statusHistory?.find((h) => h.status === step.key);
              
              // Calculate precise sequential step time (in WIB) based on actual create & edit history
              let stepTime = '';
              if (!isPending) {
                if (hist?.timestamp) {
                  stepTime = formatWibTime(hist.timestamp);
                } else if (hist?.time) {
                  stepTime = hist.time;
                } else {
                  // Fallback: interpolate logically between order creation and last update
                  const startMs = order.createdAt ? new Date(order.createdAt).getTime() : Date.now() - 3600000;
                  const endMs = order.updatedAt ? new Date(order.updatedAt).getTime() : Date.now();
                  const fraction = Math.max(0, step.rank - 1) / Math.max(1, currentRank - 1);
                  const interpolatedMs = startMs + (endMs - startMs) * fraction;
                  stepTime = formatWibTime(interpolatedMs);
                }
              }

              const stepPhoto = hist?.proofPhotoUrl || (isCurrent ? order.proofPhotoUrl : null);

              const StepIcon = step.icon;

              return (
                <div key={step.key} className="relative group">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-[30px] top-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isPassed
                        ? 'bg-pink-500 text-white shadow-sm ring-4 ring-pink-50'
                        : isCurrent
                        ? order.status === 'siap'
                          ? 'bg-emerald-500 text-white shadow-md ring-4 ring-emerald-50'
                          : 'bg-pink-500 text-white shadow-md ring-4 ring-pink-100'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    <StepIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Step Content */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-sm font-bold ${
                          isCurrent
                            ? order.status === 'siap'
                              ? 'text-emerald-700'
                              : 'text-pink-600'
                            : isPassed
                            ? 'text-gray-800'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </h3>
                      {stepTime && (
                        <span className="text-xs font-medium text-gray-400">{stepTime}</span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        isCurrent || isPassed ? 'text-gray-500' : 'text-gray-300'
                      }`}
                    >
                      {step.desc}
                    </p>

                    {/* Bukti Pesanan Card (Embedded inside the timeline step as in Image 1 & 2) */}
                    {(isCurrent || hist?.proofPhotoUrl || (isPassed && step.key === 'diproses')) && stepPhoto && (
                      <div className="mt-3 bg-pink-50/50 rounded-2xl p-3 border border-pink-100/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                            📷 Bukti Pesanan
                          </span>
                          {stepTime && (
                            <span className="text-[11px] text-gray-400">{stepTime}</span>
                          )}
                        </div>
                        <div
                          onClick={() => setPreviewPhoto(stepPhoto)}
                          className="relative rounded-xl overflow-hidden cursor-pointer group/img shadow-sm border border-pink-200 aspect-video bg-gray-100"
                        >
                          <img
                            src={stepPhoto}
                            alt="Bukti Pesanan"
                            className="w-full h-full object-cover group-hover/img:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white text-xs font-medium gap-1">
                            <Maximize2 className="w-4 h-4" /> Klik untuk perbesar
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note matching Image 1 & 2 */}
          <div className="mt-6 pt-4 border-t border-pink-100 flex items-center gap-2 text-pink-500 text-xs">
            <span className="text-base">♡</span>
            <span>Foto bukti akan ditampilkan setiap kali status pesanan diperbarui ♡</span>
          </div>
        </div>

        {/* Order Item Details Accordion / Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 space-y-4">
          <div className="flex items-center justify-between border-b border-pink-50 pb-3">
            <h3 className="font-bold text-gray-800 text-sm">Detail Pesanan</h3>
            <span className="text-xs text-gray-500">Pickup: {order.pickupTime}</span>
          </div>

          <div className="divide-y divide-pink-50 text-xs space-y-2">
            {order.items &&
              order.items.map((it, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-gray-800">
                      {it.qty}x {it.name}
                    </span>
                    {(it.size || it.ice || it.sugar || it.temp) && (
                      <p className="text-[11px] text-gray-400">
                        {[it.size, it.temp, it.ice, it.sugar].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {it.bundleChoices && (
                      <p className="text-[11px] text-pink-600 italic mt-0.5">
                        Isi: {it.bundleChoices}
                      </p>
                    )}
                    {it.note && (
                      <p className="text-[11px] text-gray-500 italic mt-0.5">
                        Catatan: {it.note}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-700 ml-2">
                    Rp {it.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
          </div>

          <div className="border-t border-pink-100 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal Menu</span>
              <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
            </div>
            {order.plasticBagQty ? (
              <div className="flex justify-between text-gray-500">
                <span>Kantung Belanja ({order.plasticBagQty} pcs)</span>
                <span>Rp {(order.plasticBagFee || 1000).toLocaleString('id-ID')}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-sm font-extrabold text-pink-600 pt-1 border-t border-dashed border-pink-100">
              <span>Total Pembayaran</span>
              <span>Rp {order.total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* WhatsApp Admin Action */}
          <a
            href={`https://wa.me/628972276154?text=${encodeURIComponent(
              `Halo Admin Kedai Kyuti, aku mau menanyakan status pesanan #${order.kopkenOrderNo || order.orderCode}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-2xl transition flex items-center justify-center gap-2 text-xs border border-emerald-200"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" /> Hubungi Admin via WhatsApp
          </a>
        </div>
      </main>

      {/* Image Lightbox Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewPhoto}
              alt="Bukti Pesanan Penuh"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
            <div className="p-3 text-center">
              <p className="text-xs font-semibold text-gray-700">
                Foto Bukti Pesanan #{order.kopkenOrderNo || order.orderCode}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

