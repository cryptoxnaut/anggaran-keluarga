[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/cryptoxnaut/anggaran-keluarga/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/cryptoxnaut/anggaran-keluarga/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

# DompetKeluarga — Anggaran Rumah Tangga

Situs anggaran rumah tangga statis untuk keluarga Indonesia: dasbor ringkasan
keuangan, pemasukan & pengeluaran, anggaran per kategori, tujuan tabungan,
tagihan rutin, dan laporan bulanan dengan grafik. Semua data contoh nyata satu
keluarga (Keluarga Pratama, November 2026), semua kontrol berfungsi, dan semua
perubahan tersimpan di peramban — tanpa jaringan, tanpa server.

Dibuat untuk [make.fun bounty: best household budget site](https://make.fun/bounty/best-household-budget-site-20261126-1457).

## Menjalankan

```sh
# layani app/ dari root-nya, lalu buka http://localhost:8080
python3 -m http.server 8080 --directory app
```

atau `node serve.ts` bila tersedia. Tidak ada langkah build.

## Halaman

- **Dasbor** — pemasukan, pengeluaran, sisa & tingkat tabungan; donat pengeluaran
  per kategori; tren 6 bulan; tagihan berikutnya; progres tabungan.
- **Pemasukan & Pengeluaran** — cari, saring, tambah, dan hapus transaksi;
  total ikut berubah.
- **Anggaran** — batas tiap kategori dengan progres, status aman/hampir
  habis/melewati batas, dan ubah anggaran.
- **Tabungan** — tujuan dengan progres, tambah dana, dan buat tujuan baru.
- **Tagihan** — daftar tagihan bulanan, tandai lunas, tambah tagihan.
- **Laporan** — pilih bulan; grafik pemasukan vs pengeluaran 6 bulan,
  rincian per kategori, dan catatan yang bisa dipetik.

Grafik digambar dengan kode canvas sendiri (`app/charts.js`), tanpa pustaka
dan tanpa permintaan jaringan.

## Lisensi

MIT — lihat [LICENSE](LICENSE).
