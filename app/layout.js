import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Sinar Kasih | Toko Listrik Ambon",
  description: "Website online Toko Listrik Sinar Kasih Ambon"
};

export default function RootLayout({ children }) {
  return <html lang="id"><body>
    <header className="topbar"><div className="wrap topbar-inner">
      <Link href="/" className="brand"><b>SK</b><span><strong>SINAR KASIH</strong><small>Toko Listrik Ambon</small></span></Link>
      <nav><Link href="/">Beranda</Link><Link href="/kategori">Kategori</Link><Link href="/cari">Cari</Link><Link href="/troli">Troli</Link><Link href="/lainnya">Lainnya</Link></nav>
    </div></header>
    <main>{children}</main>
    <nav className="bottom"><Link href="/">Beranda</Link><Link href="/kategori">Kategori</Link><Link href="/cari">Cari</Link><Link href="/troli">Troli</Link><Link href="/lainnya">Lainnya</Link></nav>
    <footer>© 2026 Toko Listrik Sinar Kasih Ambon</footer>
  </body></html>;
}