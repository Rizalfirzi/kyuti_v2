'use client';

import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { OrderStatus } from '@/lib/types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: 'create' | 'edit';
  formKopkenNo: string;
  setFormKopkenNo: (val: string) => void;
  formCustomerName: string;
  setFormCustomerName: (val: string) => void;
  formStatus: OrderStatus;
  setFormStatus: (val: OrderStatus) => void;
  formPhotoUrl: string;
  setFormPhotoUrl: (val: string) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingPhoto: boolean;
  onSubmit: (e: React.FormEvent) => void;
  savingOrder: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function OrderModal({
  isOpen,
  onClose,
  modalMode,
  formKopkenNo,
  setFormKopkenNo,
  formCustomerName,
  setFormCustomerName,
  formStatus,
  setFormStatus,
  formPhotoUrl,
  setFormPhotoUrl,
  onPhotoUpload,
  uploadingPhoto,
  onSubmit,
  savingOrder,
  fileInputRef,
}: OrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-pink-100 animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-50">
          <h3 className="text-lg font-black text-gray-900">
            {modalMode === 'create' ? 'Tambah Pesanan' : 'Edit Pesanan'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition border-0 bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
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
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-pink-200 shadow-xs shrink-0 group">
                  <img src={formPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormPhotoUrl('')}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black transition border-0"
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
                  onChange={onPhotoUpload}
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
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition border-0 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingOrder || uploadingPhoto}
              className="px-8 py-2.5 bg-[#E92D79] hover:bg-[#D81B60] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-200 transition border-0 cursor-pointer"
            >
              {savingOrder ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

