

## Perbaikan 2 Masalah

### Masalah 1: Menu Kupon di Sidebar User Dashboard

Menu "Kupon" sudah ada di kode tetapi mengarah ke halaman Wallet yang sama. Akan dibuat halaman kupon terpisah (`/dashboard/coupons`) agar lebih jelas dan mudah ditemukan.

**Langkah:**
- Buat halaman baru `src/pages/dashboard/DashboardCoupons.tsx` yang berisi form redeem kupon (dipindahkan dari DashboardWallet)
- Update sidebar: ubah URL "Kupon" dari `/dashboard/wallet` ke `/dashboard/coupons`
- Tambahkan route `/dashboard/coupons` di `App.tsx`

### Masalah 2: Gagal Review Produk dari Admin

Saat admin klik tombol lihat listing di halaman Admin Listings, akan diarahkan ke `/listing/{id}`. Tapi halaman `ListingDetail.tsx` hanya menampilkan listing berstatus `active`. Listing yang masih `pending_review` tidak bisa dilihat, sehingga muncul error "Iklan tidak ditemukan".

**Langkah:**
- Update query di `ListingDetail.tsx`: hapus filter `.eq('status', 'active')` agar semua status listing bisa dilihat
- Tambahkan badge status di halaman detail agar admin tahu status listing tersebut (misalnya "Menunggu Review", "Ditolak", dll.)
- Listing yang tidak berstatus `active` akan menampilkan banner info bahwa listing belum aktif

### Detail Teknis

**File yang diubah:**
1. `src/pages/ListingDetail.tsx` - Hapus filter status `active` pada query, tambahkan indikator status
2. `src/components/dashboard/DashboardSidebar.tsx` - Update URL kupon ke `/dashboard/coupons`
3. `src/App.tsx` - Tambahkan route `/dashboard/coupons`
4. `src/pages/dashboard/DashboardCoupons.tsx` (baru) - Halaman redeem kupon khusus

