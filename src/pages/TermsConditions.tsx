import { MainLayout } from '@/components/layout/MainLayout';
import { Footer } from '@/components/landing/Footer';

export default function TermsConditions() {
  return (
    <MainLayout>
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Syarat & Ketentuan</h1>
        <p className="text-sm text-muted-foreground mb-8">Terakhir diperbarui: 1 Maret 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Pendahuluan</h2>
            <p className="text-muted-foreground">Selamat datang di Marketplace UMKM ID. Dengan mengakses atau menggunakan platform kami, Anda setuju untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak menyetujui syarat ini, harap jangan gunakan layanan kami.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Definisi</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>"Platform"</strong> berarti situs web dan aplikasi Marketplace UMKM ID.</li>
              <li><strong>"Pengguna"</strong> berarti setiap orang yang mengakses atau menggunakan Platform.</li>
              <li><strong>"Penjual"</strong> berarti Pengguna yang menjual produk melalui Platform.</li>
              <li><strong>"Pembeli"</strong> berarti Pengguna yang membeli produk melalui Platform.</li>
              <li><strong>"Kredit"</strong> berarti mata uang virtual yang digunakan di Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Akun Pengguna</h2>
            <p className="text-muted-foreground">Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda. Anda harus memberikan informasi yang akurat dan lengkap saat mendaftar. Satu orang hanya boleh memiliki satu akun.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Jual Beli</h2>
            <p className="text-muted-foreground">Platform bertindak sebagai perantara antara Penjual dan Pembeli. Kami tidak bertanggung jawab atas kualitas, keamanan, atau legalitas barang yang dijual. Penjual wajib memberikan deskripsi produk yang akurat dan jujur.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Lelang</h2>
            <p className="text-muted-foreground">Fitur lelang memungkinkan pengguna menawar produk. Bid yang telah diajukan tidak dapat dibatalkan. Pemenang lelang wajib menyelesaikan pembayaran dalam waktu yang ditentukan.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Kredit dan Pembayaran</h2>
            <p className="text-muted-foreground">Kredit yang telah dibeli tidak dapat dikembalikan kecuali terjadi kesalahan sistem. Semua transaksi diproses melalui gateway pembayaran resmi yang terintegrasi dengan platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Konten Terlarang</h2>
            <p className="text-muted-foreground">Pengguna dilarang menjual barang ilegal, berbahaya, palsu, atau melanggar hak cipta. Platform berhak menghapus konten yang melanggar ketentuan ini tanpa pemberitahuan.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Verifikasi KYC</h2>
            <p className="text-muted-foreground">Untuk keamanan transaksi, Penjual mungkin diwajibkan menjalani proses verifikasi identitas (KYC). Data yang dikumpulkan akan diproses sesuai Kebijakan Privasi kami.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Pembatasan Tanggung Jawab</h2>
            <p className="text-muted-foreground">Platform tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan layanan kami, termasuk tetapi tidak terbatas pada kerugian akibat transaksi antar pengguna.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Perubahan Ketentuan</h2>
            <p className="text-muted-foreground">Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan berlaku efektif setelah dipublikasikan di Platform. Penggunaan berkelanjutan dianggap sebagai persetujuan terhadap perubahan tersebut.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">11. Kontak</h2>
            <p className="text-muted-foreground">Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi kami melalui email di <a href="mailto:support@umkmid.com" className="text-primary hover:underline">support@umkmid.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </MainLayout>
  );
}
