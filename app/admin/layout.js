import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div className="admin">
      <div className="adminhead">
        SINAR KASIH — ADMIN PANEL
      </div>

      <div className="adminlayout">
        <aside className="side">
          <Link href="/admin">
            Dashboard
          </Link>

          <Link href="/admin/produk">
            Produk
          </Link>

          <Link href="/admin/pesanan">
            Pesanan
          </Link>

          <Link href="/admin/pesanan/trash">
            Trash Pesanan
          </Link>

          <Link href="/admin/tampilan">
            Tampilan Website
          </Link>

          <Link href="/admin/toko">
            Toko & Kontak
          </Link>

          <Link href="/admin/loker">
            Lowongan Kerja
          </Link>

          <Link href="/admin/pelanggan">
            Pelanggan
          </Link>

          <Link href="/admin/statistik">
            Statistik
          </Link>

          <Link href="/admin/pengaturan">
            Pengaturan
          </Link>
        </aside>

        <section className="dash">
          {children}
        </section>
      </div>
    </div>
  );
}
