// Lokasi file: app/admin/statistik/page.js

import SegeraHadir from "../SegeraHadir";

export default function Page() {
  return (
    <SegeraHadir
      judul="Statistik"
      deskripsi="Pantau kunjungan website dan perkembangan penjualan."
      rencana={[
        "Jumlah pengunjung website per hari",
        "Jumlah klik tombol WhatsApp",
        "Produk yang paling sering dilihat",
        "Grafik pesanan per minggu dan per bulan",
      ]}
    />
  );
}
