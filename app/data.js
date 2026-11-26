// DompetKeluarga — data rumah tangga Keluarga Pratama, November 2026.
// Semua angka dalam Rupiah. Data ini contoh nyata satu keluarga: gaji,
// usaha sampingan, belanja, tagihan, tabungan, dan riwayat enam bulan.

const HOUSEHOLD = {
  name: 'Keluarga Pratama',
  members: 4,
  month: 'November 2026',
  monthKey: '2026-11',
  currency: 'Rp',
};

const CATEGORIES = [
  { id: 'belanja', label: 'Belanja Harian', color: '#2a9d8f', icon: '🛒' },
  { id: 'tagihan', label: 'Tagihan & Utilitas', color: '#e76f51', icon: '💡' },
  { id: 'transport', label: 'Transportasi', color: '#e9c46a', icon: '🛵' },
  { id: 'pendidikan', label: 'Pendidikan Anak', color: '#4361ee', icon: '🎒' },
  { id: 'kesehatan', label: 'Kesehatan', color: '#ef476f', icon: '🩺' },
  { id: 'hiburan', label: 'Hiburan & Rekreasi', color: '#8338ec', icon: '🎬' },
  { id: 'lainnya', label: 'Lainnya', color: '#8d99ae', icon: '📦' },
];

const INCOME_SOURCES = [
  { id: 'gaji', label: 'Gaji Bulanan (Ayah)', amount: 12500000, note: 'Diterima 25 Nov 2026' },
  { id: 'usaha', label: 'Usaha Sampingan (Ibu)', amount: 2300000, note: 'Jualan kue & katering' },
  { id: 'lain', label: 'Lainnya', amount: 450000, note: 'Cashback & bunga tabungan' },
];

// Anggaran bulanan per kategori (November 2026).
const BUDGETS = [
  { category: 'belanja', budget: 3000000 },
  { category: 'tagihan', budget: 1850000 },
  { category: 'transport', budget: 1200000 },
  { category: 'pendidikan', budget: 2000000 },
  { category: 'kesehatan', budget: 750000 },
  { category: 'hiburan', budget: 600000 },
  { category: 'lainnya', budget: 400000 },
];

// Transaksi November 2026 (terbaru dulu).
const TRANSACTIONS = [
  { id: 't01', date: '2026-11-25', desc: 'Gaji bulanan — PT Nusantara Jaya', category: 'gaji', type: 'income', amount: 12500000 },
  { id: 't02', date: '2026-11-25', desc: 'Belanja mingguan — Pasar Tradisional', category: 'belanja', type: 'expense', amount: 486000 },
  { id: 't03', date: '2026-11-24', desc: 'SPP sekolah anak — November', category: 'pendidikan', type: 'expense', amount: 1250000 },
  { id: 't04', date: '2026-11-23', desc: 'Bensin motor & mobil', category: 'transport', type: 'expense', amount: 320000 },
  { id: 't05', date: '2026-11-22', desc: 'Listrik PLN — November', category: 'tagihan', type: 'expense', amount: 642000 },
  { id: 't06', date: '2026-11-21', desc: 'Usaha kue — pesanan katering', category: 'usaha', type: 'income', amount: 850000 },
  { id: 't07', date: '2026-11-20', desc: 'Belanja bulanan — Supermarket', category: 'belanja', type: 'expense', amount: 912500 },
  { id: 't08', date: '2026-11-19', desc: 'Internet rumah — November', category: 'tagihan', type: 'expense', amount: 349000 },
  { id: 't09', date: '2026-11-18', desc: 'Periksa gigi anak — Klinik Sehat', category: 'kesehatan', type: 'expense', amount: 275000 },
  { id: 't10', date: '2026-11-17', desc: 'Nonton bioskop keluarga', category: 'hiburan', type: 'expense', amount: 240000 },
  { id: 't11', date: '2026-11-15', desc: 'Air PDAM — November', category: 'tagihan', type: 'expense', amount: 186000 },
  { id: 't12', date: '2026-11-14', desc: 'Les privat matematika', category: 'pendidikan', type: 'expense', amount: 400000 },
  { id: 't13', date: '2026-11-12', desc: 'Ojek online & parkir', category: 'transport', type: 'expense', amount: 148000 },
  { id: 't14', date: '2026-11-10', desc: 'Belanja sayur & lauk harian', category: 'belanja', type: 'expense', amount: 214000 },
  { id: 't15', date: '2026-11-08', desc: 'Beli obat & vitamin', category: 'kesehatan', type: 'expense', amount: 132000 },
  { id: 't16', date: '2026-11-06', desc: 'Usaha kue — pesanan arisan', category: 'usaha', type: 'income', amount: 650000 },
  { id: 't17', date: '2026-11-04', desc: 'Cicilan motor — November', category: 'tagihan', type: 'expense', amount: 875000 },
  { id: 't18', date: '2026-11-02', desc: 'Buku & alat tulis anak', category: 'pendidikan', type: 'expense', amount: 186000 },
  { id: 't19', date: '2026-11-01', desc: 'Iuran RT & keamanan', category: 'lainnya', type: 'expense', amount: 75000 },
  { id: 't20', date: '2026-11-01', desc: 'Bunga tabungan & cashback', category: 'lain', type: 'income', amount: 450000 },
];

// Tujuan tabungan.
const GOALS = [
  { id: 'g1', name: 'Dana Darurat', target: 30000000, saved: 18500000, note: 'Target 6x pengeluaran pokok', color: '#2a9d8f' },
  { id: 'g2', name: 'Liburan Keluarga', target: 8000000, saved: 5200000, note: 'Bromo & Malang, libur sekolah', color: '#e9c46a' },
  { id: 'g3', name: 'DP Motor Baru', target: 12000000, saved: 7800000, note: 'Ganti motor lama tahun depan', color: '#4361ee' },
  { id: 'g4', name: 'Pendidikan Anak', target: 20000000, saved: 9400000, note: 'Biaya masuk SMP tahun ajaran baru', color: '#ef476f' },
];

// Tagihan & pembayaran rutin bulanan.
const BILLS = [
  { id: 'b1', name: 'Listrik PLN', amount: 642000, due: '2026-11-20', paid: true, note: 'Token 900 VA' },
  { id: 'b2', name: 'Air PDAM', amount: 186000, due: '2026-11-15', paid: true, note: 'Meteran rumah' },
  { id: 'b3', name: 'Internet Rumah', amount: 349000, due: '2026-11-18', paid: true, note: 'Paket 50 Mbps' },
  { id: 'b4', name: 'Cicilan Motor', amount: 875000, due: '2026-11-04', paid: true, note: 'Angsuran ke-14 dari 35' },
  { id: 'b5', name: 'BPJS Kesehatan', amount: 350000, due: '2026-11-27', paid: false, note: 'Kelas 2, 4 anggota' },
  { id: 'b6', name: 'SPP Sekolah Anak', amount: 1250000, due: '2026-11-10', paid: true, note: 'SD kelas 4 & 6' },
  { id: 'b7', name: 'Iuran RT & Keamanan', amount: 75000, due: '2026-11-05', paid: true, note: 'Bulanan' },
  { id: 'b8', name: 'Langganan Streaming', amount: 54000, due: '2026-11-28', paid: false, note: 'Paket keluarga' },
];

// Riwayat bulanan Juni–November 2026 (untuk laporan & tren).
const MONTHLY = [
  { key: '2026-06', label: 'Jun 2026', income: 13950000, expense: 11820000 },
  { key: '2026-07', label: 'Jul 2026', income: 14200000, expense: 12650000 },
  { key: '2026-08', label: 'Agu 2026', income: 14850000, expense: 12100000 },
  { key: '2026-09', label: 'Sep 2026', income: 14100000, expense: 11980000 },
  { key: '2026-10', label: 'Okt 2026', income: 15250000, expense: 12940000 },
  { key: '2026-11', label: 'Nov 2026', income: 14450000, expense: 6690500 },
];

// Pengeluaran per kategori Juni–Oktober (untuk perbandingan laporan).
const MONTHLY_BY_CATEGORY = {
  '2026-06': { belanja: 2450000, tagihan: 1820000, transport: 1050000, pendidikan: 1950000, kesehatan: 420000, hiburan: 380000, lainnya: 250000 },
  '2026-07': { belanja: 2680000, tagihan: 1850000, transport: 1180000, pendidikan: 2100000, kesehatan: 610000, hiburan: 520000, lainnya: 310000 },
  '2026-08': { belanja: 2520000, tagihan: 1800000, transport: 1100000, pendidikan: 1980000, kesehatan: 390000, hiburan: 410000, lainnya: 280000 },
  '2026-09': { belanja: 2480000, tagihan: 1830000, transport: 1070000, pendidikan: 2000000, kesehatan: 450000, hiburan: 360000, lainnya: 290000 },
  '2026-10': { belanja: 2710000, tagihan: 1880000, transport: 1210000, pendidikan: 2050000, kesehatan: 580000, hiburan: 640000, lainnya: 330000 },
};

// Pengeluaran November dihitung dari TRANSACTIONS agar konsisten.
function novemberSpentByCategory() {
  const out = {};
  for (const c of CATEGORIES) out[c.id] = 0;
  for (const t of TRANSACTIONS) {
    if (t.type === 'expense' && CATEGORIES.some((c) => c.id === t.category)) {
      out[t.category] += t.amount;
    }
  }
  return out;
}
