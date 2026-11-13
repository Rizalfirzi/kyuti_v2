import { put, list, del, head } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Order, OrderStatus, StatusHistoryItem } from './types';

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_ORDERS_FILE = path.join(LOCAL_DATA_DIR, 'orders.json');
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const TMP_ORDERS_FILE = path.join(os.tmpdir(), 'kyuti_orders.json');
const BLOB_INDEX_PATH = 'orders/index.json';

// In-memory cache for serverless warm container instances
let memoryOrders: Order[] | null = null;

// Helpers for Upstash Redis / Vercel KV REST API zero-dependency persistence
function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url, token };
  }
  return null;
}

async function fetchFromKv(): Promise<Order[] | null> {
  const config = getKvConfig();
  if (!config) return null;
  try {
    const res = await fetch(`${config.url}/get/kyuti_orders`, {
      headers: { Authorization: `Bearer ${config.token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('KV read error:', e);
  }
  return null;
}

async function saveToKv(orders: Order[]): Promise<boolean> {
  const config = getKvConfig();
  if (!config) return false;
  try {
    const res = await fetch(`${config.url}/set/kyuti_orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orders),
    });
    return res.ok;
  } catch (e) {
    console.warn('KV write error:', e);
    return false;
  }
}

// Helper to automatically support both Public and Private Vercel Blob stores
async function smartBlobPut(pathname: string, body: any, options: any = {}) {
  try {
    return await put(pathname, body, { ...options, access: 'public' });
  } catch (err: any) {
    const msg = (err?.message || '').toLowerCase();
    if (
      msg.includes('private') ||
      msg.includes('access') ||
      err?.name === 'BlobAccessError' ||
      err?.name === 'BlobError'
    ) {
      return await put(pathname, body, { ...options, access: 'private' });
    }
    throw err;
  }
}

// Ensure local directories exist
function ensureLocalDirs() {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
      fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
    }
  } catch (err) {
    // Read-only filesystem in serverless environments (Vercel)
  }
}

// Initial sample orders for previewing if database is fresh
const SAMPLE_ORDERS: Order[] = [
  {
    orderCode: 'KYUTI-80537',
    kopkenOrderNo: '80537',
    customerName: 'Alya',
    customerPhone: '08123456789',
    outletCode: 'LA.CODEFIN',
    outletName: 'Kopi Kenangan Codefin Kemang',
    pickupTime: '14.30 WIB',
    status: 'diproses',
    statusText: 'Pesanan Diproses',
    statusDesc: 'Pesanan kamu sedang diproses oleh outlet.',
    proofPhotoUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
    statusHistory: [
      {
        status: 'diterima',
        title: 'Pesanan Diterima',
        desc: 'Pesanan kamu sudah kami terima.',
        time: '14.20',
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        status: 'diproses',
        title: 'Pesanan Diproses',
        desc: 'Pesanan kamu sedang diproses oleh outlet.',
        time: '14.23',
        timestamp: Date.now() - 3600000,
        proofPhotoUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
      },
    ],
    items: [
      {
        name: 'Kenangan Milk Tea (L)',
        qty: 1,
        price: 18000,
        subtotal: 18000,
        size: 'Large',
        sugar: 'Less Sugar',
        ice: 'Normal Ice',
      },
    ],
    subtotal: 18000,
    total: 18000,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    orderCode: 'KYUTI-80512',
    kopkenOrderNo: '80512',
    customerName: 'Bima',
    customerPhone: '08198765432',
    outletCode: 'LA.CODEFIN',
    outletName: 'Kopi Kenangan Codefin Kemang',
    pickupTime: '15.30 WIB',
    status: 'siap',
    statusText: 'Siap Diambil',
    statusDesc: 'Pesanan kamu sudah selesai dan siap untuk diambil.',
    proofPhotoUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=600&auto=format&fit=crop',
    statusHistory: [
      {
        status: 'diterima',
        title: 'Pesanan Diterima',
        desc: 'Pesanan kamu sudah kami terima.',
        time: '14.20',
        timestamp: Date.now() - 3600000 * 3,
      },
      {
        status: 'diproses',
        title: 'Pesanan Diproses',
        desc: 'Pesanan kamu sedang diproses oleh outlet.',
        time: '14.23',
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        status: 'disiapkan',
        title: 'Sedang Disiapkan',
        desc: 'Barista sedang menyiapkan pesanan kamu.',
        time: '14.28',
        timestamp: Date.now() - 3600000,
      },
      {
        status: 'siap',
        title: 'Siap Diambil',
        desc: 'Pesanan kamu sudah selesai dan siap untuk diambil.',
        time: '14.35',
        timestamp: Date.now() - 1800000,
        proofPhotoUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=600&auto=format&fit=crop',
      },
    ],
    items: [
      {
        name: 'Kopi Kenangan Mantan (R)',
        qty: 2,
        price: 15500,
        subtotal: 31000,
        size: 'Regular',
        sugar: 'Normal Sugar',
        ice: 'Normal Ice',
      },
    ],
    subtotal: 31000,
    total: 31000,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    orderCode: 'KYUTI-80498',
    kopkenOrderNo: '80498',
    customerName: 'Dita',
    customerPhone: '085711223344',
    outletCode: 'LA.CODEFIN',
    outletName: 'Kopi Kenangan Codefin Kemang',
    pickupTime: '15.00 WIB',
    status: 'disiapkan',
    statusText: 'Sedang Disiapkan',
    statusDesc: 'Barista sedang menyiapkan pesanan kamu.',
    proofPhotoUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop',
    statusHistory: [
      {
        status: 'diterima',
        title: 'Pesanan Diterima',
        desc: 'Pesanan kamu sudah kami terima.',
        time: '14.10',
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        status: 'disiapkan',
        title: 'Sedang Disiapkan',
        desc: 'Barista sedang menyiapkan pesanan kamu.',
        time: '14.55',
        timestamp: Date.now() - 1200000,
      },
    ],
    items: [
      {
        name: 'Dutch Choco Frappe',
        qty: 1,
        price: 26000,
        subtotal: 26000,
      },
    ],
    subtotal: 26000,
    total: 26000,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    orderCode: 'KYUTI-80476',
    kopkenOrderNo: '80476',
    customerName: 'Rafi',
    customerPhone: '081399887766',
    outletCode: 'LA.CODEFIN',
    outletName: 'Kopi Kenangan Codefin Kemang',
    pickupTime: '14.45 WIB',
    status: 'diterima',
    statusText: 'Pesanan Diterima',
    statusDesc: 'Pesanan kamu sudah kami terima.',
    proofPhotoUrl: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?q=80&w=600&auto=format&fit=crop',
    statusHistory: [
      {
        status: 'diterima',
        title: 'Pesanan Diterima',
        desc: 'Pesanan kamu sudah kami terima.',
        time: '14.30',
        timestamp: Date.now() - 1500000,
      },
    ],
    items: [
      {
        name: 'Americano (L)',
        qty: 1,
        price: 15000,
        subtotal: 15000,
      },
    ],
    subtotal: 15000,
    total: 15000,
    createdAt: new Date(Date.now() - 1500000).toISOString(),
    updatedAt: new Date(Date.now() - 1500000).toISOString(),
  },
  {
    orderCode: 'KYUTI-80461',
    kopkenOrderNo: '80461',
    customerName: 'Citra',
    customerPhone: '087788990011',
    outletCode: 'LA.CODEFIN',
    outletName: 'Kopi Kenangan Codefin Kemang',
    pickupTime: '14.00 WIB',
    status: 'siap',
    statusText: 'Siap Diambil',
    statusDesc: 'Pesanan kamu sudah selesai dan siap untuk diambil.',
    proofPhotoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    statusHistory: [
      {
        status: 'diterima',
        title: 'Pesanan Diterima',
        desc: 'Pesanan kamu sudah kami terima.',
        time: '13.15',
        timestamp: Date.now() - 3600000 * 4,
      },
      {
        status: 'siap',
        title: 'Siap Diambil',
        desc: 'Pesanan kamu sudah selesai dan siap untuk diambil.',
        time: '13.45',
        timestamp: Date.now() - 3600000 * 3,
        proofPhotoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
      },
    ],
    items: [
      {
        name: 'Avocado Coffee',
        qty: 2,
        price: 24000,
        subtotal: 48000,
      },
    ],
    subtotal: 48000,
    total: 48000,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

export class OrderStore {
  private static hasBlobToken(): boolean {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  }

  /**
   * Get all orders
   */
  static async getAllOrders(): Promise<Order[]> {
    // 1. Hot memory cache (fastest, keeps state alive during warm lambda instances)
    if (memoryOrders && Array.isArray(memoryOrders) && memoryOrders.length > 0) {
      return memoryOrders;
    }

    // 2. Upstash Redis / Vercel KV REST API if configured
    const kvOrders = await fetchFromKv();
    if (kvOrders && kvOrders.length > 0) {
      memoryOrders = kvOrders;
      return kvOrders;
    }

    // 3. Vercel Blob if token exists
    if (this.hasBlobToken()) {
      try {
        const { blobs } = await list({ prefix: 'orders/' });
        const indexBlob = blobs.find((b) => b.pathname === BLOB_INDEX_PATH);
        if (indexBlob) {
          let res = await fetch(indexBlob.url, { cache: 'no-store' });
          // If 403 or 401 (Private Blob Store), retry with Authorization header
          if (!res.ok && (res.status === 403 || res.status === 401) && process.env.BLOB_READ_WRITE_TOKEN) {
            res = await fetch(indexBlob.url, {
              headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
              cache: 'no-store',
            });
          }
          if (res.ok) {
            const data: Order[] = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              memoryOrders = data;
              return data;
            }
          }
        }
      } catch (err) {
        console.warn('Vercel Blob read error, falling back to tmp/local:', err);
      }
    }

    // 4. Writable /tmp directory on Vercel Serverless
    try {
      if (fs.existsSync(TMP_ORDERS_FILE)) {
        const tmpRaw = fs.readFileSync(TMP_ORDERS_FILE, 'utf-8');
        const parsed = JSON.parse(tmpRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryOrders = parsed;
          return parsed;
        }
      }
    } catch (tmpErr) {
      // ignore
    }

    // 5. Local file fallback from project repository (data/orders.json)
    try {
      if (fs.existsSync(LOCAL_ORDERS_FILE)) {
        const content = fs.readFileSync(LOCAL_ORDERS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryOrders = parsed;
          return parsed;
        }
      }
    } catch {
      // read-only or not found
    }

    memoryOrders = SAMPLE_ORDERS;
    return SAMPLE_ORDERS;
  }

  /**
   * Save all orders (used internally to sync index)
   */
  static async saveAllOrders(orders: Order[]): Promise<void> {
    // 1. Always update in-memory hot cache
    memoryOrders = [...orders];

    // 2. Save to writable /tmp on serverless environments
    try {
      fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.warn('Could not write /tmp orders file:', tmpErr);
    }

    // 3. Try to save to local data/orders.json (works in dev / localhost)
    try {
      ensureLocalDirs();
      fs.writeFileSync(LOCAL_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (e) {
      // Expected on Vercel read-only filesystem
    }

    // 4. Save to Upstash Redis / Vercel KV REST API if configured
    await saveToKv(orders);

    // 5. Save to Vercel Blob if token exists
    if (this.hasBlobToken()) {
      try {
        await smartBlobPut(BLOB_INDEX_PATH, JSON.stringify(orders, null, 2), {
          contentType: 'application/json',
          addRandomSuffix: false,
        });
      } catch (err) {
        console.error('Failed to save orders to Vercel Blob:', err);
      }
    }
  }

  /**
   * Find order by tracking code or kopkenOrderNo
   */
  static async findOrderByCode(code: string): Promise<Order | null> {
    const clean = code.trim().toUpperCase().replace('#', '');
    const orders = await this.getAllOrders();

    const found = orders.find((o) => {
      const codeUpper = (o.orderCode || '').toUpperCase().replace('#', '');
      const kopkenUpper = (o.kopkenOrderNo || '').toUpperCase().replace('#', '');
      return (
        codeUpper === clean ||
        kopkenUpper === clean ||
        codeUpper.includes(clean) ||
        clean.includes(codeUpper)
      );
    });

    return found || null;
  }

  /**
   * Create or update an order
   */
  static async upsertOrder(order: Order): Promise<Order> {
    const orders = await this.getAllOrders();
    const index = orders.findIndex(
      (o) =>
        o.orderCode.toLowerCase() === order.orderCode.toLowerCase() ||
        (order.kopkenOrderNo && o.kopkenOrderNo === order.kopkenOrderNo)
    );

    if (index >= 0) {
      orders[index] = { ...orders[index], ...order, updatedAt: new Date().toISOString() };
    } else {
      orders.unshift(order);
    }

    await this.saveAllOrders(orders);

    // Also save individual order to Vercel Blob if available
    if (this.hasBlobToken()) {
      try {
        const orderPath = `orders/${order.orderCode}.json`;
        await smartBlobPut(orderPath, JSON.stringify(order, null, 2), {
          contentType: 'application/json',
          addRandomSuffix: false,
        });
      } catch (err) {
        console.warn('Error saving individual order blob:', err);
      }
    }

    return order;
  }

  /**
   * Delete an order
   */
  static async deleteOrder(orderCode: string): Promise<boolean> {
    const orders = await this.getAllOrders();
    const filtered = orders.filter((o) => o.orderCode !== orderCode && o.kopkenOrderNo !== orderCode);
    if (filtered.length !== orders.length) {
      await this.saveAllOrders(filtered);
      return true;
    }
    return false;
  }

  /**
   * Upload image file to Vercel Blob (or fallback to local disk or Base64 Data URL)
   */
  static async uploadProofPhoto(
    fileBuffer: Buffer,
    filename: string,
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    const cleanFilename = `proof-${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // 1. Save to Vercel Blob if token exists
    if (this.hasBlobToken()) {
      try {
        const blob = await smartBlobPut(`proofs/${cleanFilename}`, fileBuffer, {
          contentType,
        });
        // If the store is private, wrap with local proxy endpoint so browsers can render without 403 Forbidden!
        if (blob.url.includes('.private.blob.vercel-storage.com')) {
          return `/api/blob?url=${encodeURIComponent(blob.url)}`;
        }
        return blob.url;
      } catch (err) {
        console.error('Vercel Blob put error, falling back to local/base64:', err);
      }
    }

    // 2. Try writing to local disk (development / standalone environment)
    try {
      ensureLocalDirs();
      const filePath = path.join(LOCAL_UPLOADS_DIR, cleanFilename);
      fs.writeFileSync(filePath, fileBuffer);
      return `/uploads/${cleanFilename}`;
    } catch (fsErr: any) {
      console.warn('Local filesystem is read-only (Vercel serverless). Using Base64 Data URL fallback:', fsErr.message);
      // 3. Fallback to Base64 Data URL so upload never fails even without Vercel Blob configured
      const base64 = fileBuffer.toString('base64');
      return `data:${contentType};base64,${base64}`;
    }
  }
}

