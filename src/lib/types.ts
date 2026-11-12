export type OrderStatus = 'diterima' | 'diproses' | 'disiapkan' | 'siap' | 'selesai';

export interface StatusHistoryItem {
  status: OrderStatus;
  title: string;
  desc: string;
  time: string; // e.g. "14.20" or "23 Okt 14.20"
  timestamp: number;
  proofPhotoUrl?: string;
}

export interface OrderItem {
  id?: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
  size?: string;
  temp?: string;
  ice?: string;
  sugar?: string;
  bundleChoices?: string;
  addons?: Array<{ name: string; price: number }>;
  note?: string;
}

export interface Order {
  orderCode: string; // Internal unique tracking code e.g. "KYUTI-80537" or "80537"
  kopkenOrderNo: string; // Nomor Order Kopi Kenangan from cashier/app e.g. "80537"
  customerName: string;
  customerPhone?: string;
  outletCode?: string;
  outletName?: string;
  pickupTime?: string;
  notes?: string;
  status: OrderStatus;
  statusText?: string;
  statusDesc?: string;
  proofPhotoUrl?: string; // Latest proof photo URL (Vercel Blob)
  statusHistory: StatusHistoryItem[];
  items: OrderItem[];
  subtotal: number;
  plasticBagQty?: number;
  plasticBagFee?: number;
  singleItemFee?: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Outlet {
  code: string;
  id?: number | string;
  name: string;
  address?: string;
  city?: string;
  lat?: number;
  lng?: number;
  distanceKm?: number | null;
  isOpen?: boolean;
  canOrder?: boolean;
  statusText?: string;
  hours?: string;
  img?: string;
  category?: string;
  phone?: string;
  isClosed?: boolean;
  isPremium?: boolean;
  premium?: boolean;
}

export interface MenuItem {
  key: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  img?: string;
  desc?: string;
  isSoldOut?: boolean;
  isBundling?: boolean;
  tag?: string;
  size?: string;
  sizes?: Array<{ name: string; price: number; normalPrice?: number }>;
  slots?: Array<{
    label: string;
    type?: string;
    options: Array<string | { name: string; price: number }>;
  }>;
  options?: {
    temps?: string[];
    sizes?: string[];
    ices?: string[];
    sugars?: string[];
    addons?: Array<{ name: string; price: number }>;
  };
}

