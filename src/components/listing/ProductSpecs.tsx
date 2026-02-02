import { 
  Shield, Package, MapPin, Clock, Eye, 
  Star, CheckCircle, Tag, Sparkles, AlertCircle
} from 'lucide-react';
import { InfoSection } from './InfoSection';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface ProductSpecsProps {
  condition: 'new' | 'like_new' | 'good' | 'fair';
  priceType: 'fixed' | 'negotiable' | 'auction';
  location: string;
  viewCount: number;
  createdAt: string;
  isFeatured: boolean;
  category: string;
}

const conditionData: Record<string, { label: string; description: string }> = {
  new: { 
    label: 'Barang Baru', 
    description: 'Produk ini dalam kondisi baru, belum pernah dipakai, lengkap dengan segel dan garansi resmi dari pabrik.' 
  },
  like_new: { 
    label: 'Seperti Baru', 
    description: 'Kondisi sangat bagus seperti baru, sudah pernah digunakan dengan sangat hati-hati. Tidak ada cacat atau kerusakan sama sekali.' 
  },
  good: { 
    label: 'Kondisi Bagus', 
    description: 'Barang masih dalam kondisi baik dengan tanda pemakaian normal yang wajar. Fungsi 100% normal tanpa masalah.' 
  },
  fair: { 
    label: 'Kondisi Cukup', 
    description: 'Barang masih berfungsi dengan baik meskipun ada beberapa tanda pemakaian. Cocok untuk pemakaian harian.' 
  },
};

const priceTypeData: Record<string, { label: string; description: string }> = {
  fixed: { 
    label: 'Harga Tetap', 
    description: 'Harga yang ditampilkan adalah harga final dan tidak bisa dinegosiasikan. Pembeli bisa langsung membeli dengan harga tersebut.' 
  },
  negotiable: { 
    label: 'Harga Nego', 
    description: 'Harga masih bisa dinegosiasikan dengan penjual. Silakan hubungi penjual melalui chat untuk mendiskusikan penawaran terbaik.' 
  },
  auction: { 
    label: 'Sistem Lelang', 
    description: 'Barang dijual dengan sistem lelang. Anda bisa mengajukan bid dan penawar tertinggi saat lelang berakhir akan memenangkan barang.' 
  },
};

export const ProductSpecs = ({
  condition,
  priceType,
  location,
  viewCount,
  createdAt,
  isFeatured,
  category,
}: ProductSpecsProps) => {
  const condInfo = conditionData[condition] || conditionData.good;
  const priceInfo = priceTypeData[priceType] || priceTypeData.fixed;
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: localeId });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        Informasi Produk
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Condition */}
        <InfoSection
          title={condInfo.label}
          description={condInfo.description}
          icon={<CheckCircle className="h-7 w-7" />}
          variant="success"
        />

        {/* Price Type */}
        <InfoSection
          title={priceInfo.label}
          description={priceInfo.description}
          icon={<Tag className="h-7 w-7" />}
          variant="primary"
        />

        {/* Category */}
        <InfoSection
          title={`Kategori: ${category}`}
          description="Produk ini termasuk dalam kategori yang sesuai dengan jenis dan fungsinya. Temukan produk serupa di marketplace kami."
          icon={<Package className="h-7 w-7" />}
          variant="secondary"
        />

        {/* Location */}
        <InfoSection
          title={`Lokasi: ${location}`}
          description="Lokasi penjual yang tertera. Pembeli dapat mengatur pengiriman atau COD sesuai kesepakatan bersama dengan penjual."
          icon={<MapPin className="h-7 w-7" />}
          variant="accent"
        />

        {/* Stats */}
        <InfoSection
          title={`${viewCount} Kali Dilihat`}
          description={`Iklan ini telah dilihat oleh ${viewCount} orang sejak ${timeAgo}. Semakin banyak dilihat, semakin populer produknya!`}
          icon={<Eye className="h-7 w-7" />}
          variant="warning"
        />

        {/* Premium Badge */}
        {isFeatured && (
          <InfoSection
            title="Iklan Premium"
            description="Iklan ini adalah iklan premium yang mendapat prioritas tampil di halaman utama dan pencarian. Penjual terpercaya!"
            icon={<Sparkles className="h-7 w-7" />}
            variant="primary"
          />
        )}
      </div>

      {/* Trust & Safety Notice */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Keamanan Transaksi
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Untuk keamanan transaksi, kami sarankan menggunakan fitur pembayaran dalam aplikasi. 
              Hindari transfer langsung ke rekening pribadi sebelum barang diterima.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
