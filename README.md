# Kedai Kyuti ୨୧ Jasdor Kopi Kenangan (Next.js 14 & Vercel Blob) 🌸

Aplikasi Web Modern **Next.js 14 (React, TypeScript, Tailwind CSS)** dengan penyimpanan database dan foto berbasis **Vercel Blob (`@vercel/blob`)** yang siap di-deploy langsung ke **Vercel** (`kopken-blob`).

Dilengkapi fitur **Alur Tracking Otomatis** dengan tautan langsung pada format WhatsApp, halaman pelacakan live timeline untuk customer, serta Dashboard Admin dengan upload foto bukti pesanan dan update status manual sesuai referensi desain.

---

## 🌟 Alur Kerja Sistem (Workflow)

```
CUSTOMER
   │
   ▼
Memesan melalui Website Kedai Kyuti (/)
   │
   ▼
Website Membuat Kode & Link Tracking Otomatis (/track/[kode])
   │
   ▼
Format Order + Link Tracking Otomatis dikirim ke WhatsApp Bisnis
   │
   ▼
Admin Memproses Pesanan ke Outlet Kopi Kenangan
   │
   ▼
Admin Membuka Halaman Daftar Pesanan (/admin)
   │
   ▼
Admin Memasukkan Nomor Order Kopi Kenangan, Status, & Upload Foto Bukti (Vercel Blob)
   │
   ▼
Data Pesanan Disimpan ke Vercel Blob Database
   │
   ▼
Customer Membuka Link Tracking (/track/[kode])
   │
   ▼
Melihat Status Terkini & Foto Bukti Cup Pesanan Real-Time ♡
```

---

## 🎨 Halaman & Desain Antarmuka

1. **Website Utama Pemesanan (`/`)**
   - Live sync menu & status stok per outlet Kopi Kenangan.
   - Pilihan Paket Bundling (2 Cup Large, 2 Frappe, Promo Spesial, Combo 3 Item).
   - Kustomisasi minuman (Ukuran Cup, Level Es, Level Gula, Catatan).
   - Checkout & generate otomatis format WhatsApp + link live tracking.

2. **Halaman Customer - Hasil Tracking (`/track/[kode]`)** *(Sesuai Gambar 1 & 2)*
   - Desain aesthetic soft pink card & heart badges.
   - **Nomor Order Kopi Kenangan** (e.g. `#80537`) dengan tombol salin (copy) satu kali klik.
   - **Banner Status Dinamis**:
     - *Pesanan Diproses*: Card pink dengan icon cangkir kopi.
     - *Siap Diambil*: Card hijau emerald dengan icon shopping bag.
     - *Sedang Disiapkan*: Card ungu dengan icon barista.
   - **Vertical Stepper Timeline**:
     - Pesanan Diterima (14.20)
     - Pesanan Diproses (14.23) + Foto Bukti Cup & Struk Kasir
     - Sedang Disiapkan (14.28)
     - Siap Diambil (14.35) + Foto Bukti Siap Ambil
   - Detail menu yang dipesan & tombol hubungi WhatsApp admin.
   - Auto-refresh real-time setiap 12 detik atau via tombol putar.

3. **Dashboard Admin (`/admin`)** *(Sesuai Gambar 1 & 2)*
   - Sidebar navigasi: *Kedai Kyuti ♡*, Dashboard Toko, Pesanan, Tambah Pesanan.
   - Pencarian real-time berdasarkan nomor order atau nama customer.
   - Filter status tab: *Semua*, *Pesanan Diterima*, *Pesanan Diproses*, *Sedang Disiapkan*, *Siap Diambil*.
   - Tabel Pesanan dengan badge status warna, thumbnail foto bukti, waktu update, dan tombol aksi (Lihat Tracking, Edit Status & Foto, Hapus Pesanan).
   - **Modal Tambah / Edit Pesanan**:
     - Input *Nomor Order Kopi Kenangan*
     - Input *Nama Customer*
     - Dropdown *Status Pesanan*
     - Upload *Foto Bukti Pesanan* (otomatis terunggah ke Vercel Blob via `@vercel/blob`)
     - Tombol *Batal* & *Simpan*

---

## ☁️ Integrasi Vercel Blob (`@vercel/blob`)

Sesuai permintaan gambar ke-3, aplikasi ini menggunakan penyimpanan **Vercel Blob**:
- **Foto Bukti Pesanan**: Diunggah via endpoint `/api/upload` dan disimpan langsung di store `kopken-blob`.
- **Database Pesanan**: Disimpan dan disinkronkan ke file JSON blob di Vercel Blob (`orders/index.json` & `orders/[kode].json`).
- **Smart Fallback**: Saat dijalankan di komputer lokal tanpa token, sistem otomatis menyimpan ke folder lokal `data/orders.json` dan `public/uploads/` sehingga pengembangan lokal tidak akan pernah error.

### Menghubungkan ke Vercel:
1. Hubungkan store `kopken-blob` ke project Vercel Anda di Dashboard.
2. Vercel akan otomatis menyuntikkan environment variable `BLOB_READ_WRITE_TOKEN`.
3. Untuk pengembangan lokal dengan live Vercel Blob:
   ```bash
   npx vercel env pull .env.local
   ```

---

## 💻 Menjalankan di Komputer Lokal

```bash
# 1. Jalankan development server
npm run dev

# Atau jalankan production build
npm run build
npm run start
```

Akses browser:
- Website Toko: [http://localhost:3000](http://localhost:3000)
- Dashboard Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- Tracking Pesanan: [http://localhost:3000/track](http://localhost:3000/track) atau [http://localhost:3000/track/80537](http://localhost:3000/track/80537)
