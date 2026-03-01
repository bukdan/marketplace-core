import { MainLayout } from '@/components/layout/MainLayout';
import { Footer } from '@/components/landing/Footer';

export default function PrivacyPolicy() {
  return (
    <MainLayout>
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Kebijakan Privasi</h1>
        <p className="text-sm text-muted-foreground mb-8">Terakhir diperbarui: 1 Maret 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Informasi yang Kami Kumpulkan</h2>
            <p className="text-muted-foreground">Kami mengumpulkan informasi yang Anda berikan secara langsung, termasuk:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Nama lengkap, alamat email, dan nomor telepon saat mendaftar</li>
              <li>Data KTP dan foto selfie untuk verifikasi KYC</li>
              <li>Informasi transaksi dan riwayat pesanan</li>
              <li>Konten pesan yang dikirim melalui fitur chat</li>
              <li>Data lokasi untuk pencocokan pembeli dan penjual</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Penggunaan Informasi</h2>
            <p className="text-muted-foreground">Informasi yang kami kumpulkan digunakan untuk:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Menyediakan, memelihara, dan meningkatkan layanan Platform</li>
              <li>Memproses transaksi dan mengirimkan notifikasi terkait</li>
              <li>Memverifikasi identitas pengguna untuk keamanan</li>
              <li>Mengirimkan informasi terkait produk, layanan, dan promosi</li>
              <li>Mendeteksi dan mencegah aktivitas penipuan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Penyimpanan Data</h2>
            <p className="text-muted-foreground">Data Anda disimpan di server yang aman dengan enkripsi. Kami menyimpan data selama akun Anda aktif atau selama diperlukan untuk menyediakan layanan. Data KYC disimpan sesuai peraturan yang berlaku.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Berbagi Informasi</h2>
            <p className="text-muted-foreground">Kami tidak menjual data pribadi Anda. Kami dapat membagikan informasi dengan:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Penyedia layanan pembayaran untuk memproses transaksi</li>
              <li>Pihak berwenang jika diwajibkan oleh hukum</li>
              <li>Penjual/pembeli sebatas informasi yang diperlukan untuk transaksi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Cookie</h2>
            <p className="text-muted-foreground">Kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman pengguna, menganalisis penggunaan platform, dan menampilkan konten yang relevan. Anda dapat mengatur pengaturan cookie melalui browser Anda.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Hak Pengguna</h2>
            <p className="text-muted-foreground">Anda memiliki hak untuk:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Mengakses dan memperbarui data pribadi Anda</li>
              <li>Meminta penghapusan data pribadi Anda</li>
              <li>Menolak pemrosesan data untuk tujuan pemasaran</li>
              <li>Mengajukan keluhan terkait pemrosesan data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Keamanan</h2>
            <p className="text-muted-foreground">Kami menerapkan langkah-langkah keamanan teknis dan organisasi untuk melindungi data Anda, termasuk enkripsi, kontrol akses, dan pemantauan sistem secara berkala.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Perubahan Kebijakan</h2>
            <p className="text-muted-foreground">Kebijakan ini dapat diperbarui sewaktu-waktu. Kami akan memberi tahu Anda tentang perubahan signifikan melalui email atau notifikasi di Platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Kontak</h2>
            <p className="text-muted-foreground">Untuk pertanyaan terkait privasi, hubungi kami di <a href="mailto:support@umkmid.com" className="text-primary hover:underline">support@umkmid.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </MainLayout>
  );
}
