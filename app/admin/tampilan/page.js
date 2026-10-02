// Lokasi file: app/admin/tampilan/page.js

import SegeraHadir from "../SegeraHadir";

export default function Page() {
  return (
    <SegeraHadir
      judul="Tampilan Website"
      deskripsi="Atur banner, pengumuman, dan menu di halaman depan website."
      rencana={[
        "Mengganti banner utama di halaman depan",
        "Mengatur banner promosi",
        "Menulis pengumuman untuk pengunjung",
        "Mengatur menu di halaman beranda",
      ]}
    />
  );
}
