# Changelog

## 0.2.0 — 2026-08-28

### Perbaikan kritis

- Potongan keterlambatan tetap dihitung ketika finger pulang tidak ada.
- Potongan pulang cepat tetap dihitung ketika finger masuk tidak ada.
- Kolom Tidak Masuk hanya terisi 3% ketika finger masuk dan pulang sama-sama
  tidak ada.
- Menghapus status review lama yang menyatakan kombinasi potongan belum disahkan.

### Ekspor dan UI

- Menambahkan sheet `Rekap Per Pegawai` sesuai format 11 kolom pada lampiran.
- Setiap pegawai dipisahkan dengan page break dan disiapkan untuk A4 landscape.
- Menambahkan formula jumlah harian dan jumlah periode.
- Menambahkan sheet `Master Pegawai` dan tombol `Isi Jabatan`.
- Menambahkan tombol `Atur Hari Libur`; akhir pekan dan hari libur tidak muncul
  pada rekap cetak.
- Menyesuaikan periode cetak bagian dalam dokumen sumber (26–25 menjadi 27–24).
- `setup_windows.bat` memilih Python 3.11 atau lebih baru, termasuk Python 3.14.

### Pengujian

- Menambahkan regression test kasus 08.31 masuk dan finger pulang kosong.
- Menambahkan pengujian kombinasi finger masuk kosong dan pulang cepat.
- Menambahkan pengujian bahwa Tidak Masuk hanya berlaku untuk dua finger kosong.
- Menambahkan pengujian struktur dan formula rekap per pegawai.
