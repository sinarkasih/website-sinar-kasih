// Lokasi file: app/admin/pengaturan/page.js

import SegeraHadir from "../SegeraHadir";

export default function Page() {
  return (
    <SegeraHadir
      judul="Pengaturan"
      deskripsi="Pengaturan umum website dan akun admin."
      rencana={[
        "Mengelola akun admin dan karyawan",
        "Pengaturan SEO (judul dan deskripsi website di Google)",
        "Pengaturan umum website",
      ]}
    />
  );
}
