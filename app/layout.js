import "./globals.css";

import Link from "next/link";
import CartNav from "./CartNav";
import TampilanPublik, { BungkusPublik } from "./TampilanPublik";

export const metadata = {
  title: "Sinar Kasih | Toko Listrik Ambon",
  description: "Website online Toko Listrik Sinar Kasih Ambon",
};

function HomeIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7.5h.01" />
    </svg>
  );
}

function NavItem({ href, label, icon, color }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        verticalAlign: "middle",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          lineHeight: 0,
        }}
      >
        {icon}
      </span>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </Link>
  );
}

function CartLink() {
  return (
    <Link
      href="/troli"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        verticalAlign: "middle",
        lineHeight: 1,
      }}
    >
      <CartNav label="Troli" />
    </Link>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <TampilanPublik>
          <header className="topbar">
            <div className="wrap topbar-inner">
              <Link href="/" className="brand">
                <img
                  src="/logo-sk.png"
                  alt="Logo Sinar Kasih"
                  width="42"
                  height="42"
                  style={{
                    width: "42px",
                    height: "42px",
                    display: "block",
                    flexShrink: 0,
                  }}
                />

                <span>
                  <strong>SINAR KASIH</strong>
                  <small>Toko Listrik Ambon</small>
                </span>
              </Link>

              <nav>
                <NavItem
                  href="/"
                  label="Beranda"
                  color="#6f4a32"
                  icon={<HomeIcon />}
                />

                <NavItem
                  href="/kategori"
                  label="Kategori"
                  color="#c58a2b"
                  icon={<CategoryIcon />}
                />

                <CartLink />

                <NavItem
                  href="/info"
                  label="Informasi"
                  color="#4d7185"
                  icon={<InfoIcon />}
                />
              </nav>
            </div>
          </header>
        </TampilanPublik>

        <main>
          <BungkusPublik>{children}</BungkusPublik>
        </main>

        <TampilanPublik>
          <nav className="bottom" aria-label="Navigasi utama">
            <NavItem
              href="/"
              label="Beranda"
              color="#6f4a32"
              icon={<HomeIcon />}
            />

            <NavItem
              href="/kategori"
              label="Kategori"
              color="#c58a2b"
              icon={<CategoryIcon />}
            />

            <CartLink />

            <NavItem
              href="/info"
              label="Informasi"
              color="#4d7185"
              icon={<InfoIcon />}
            />
          </nav>

          <footer className="kaki">
            <div className="wrap kaki-isi">
              <div className="kaki-merek">
                <img
                  src="/logo-sinar-kasih.png"
                  alt="Sinar Kasih"
                  width="180"
                  height="35"
                  style={{ width: "180px", height: "auto" }}
                />
                <p>
                  Toko listrik, lampu, dan perlengkapan rumah di Ambon dan
                  Maluku Tengah.
                </p>
              </div>

              <div className="kaki-kolom">
                <h4>Belanja</h4>
                <Link href="/kategori">Kategori Produk</Link>
                <Link href="/kategori?tab=brand">Brand</Link>
                <Link href="/cari">Cari Produk</Link>
                <Link href="/cara-pesan">Cara Pesan</Link>
              </div>

              <div className="kaki-kolom">
                <h4>Sinar Kasih</h4>
                <Link href="/toko">Toko Kami</Link>
                <Link href="/tentang">Tentang Kami</Link>
                <Link href="/loker">Lowongan Kerja</Link>
                <Link href="/info">Informasi &amp; Layanan</Link>
                <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
              </div>
            </div>

            <div className="wrap kaki-bawah">
              © {new Date().getFullYear()} Toko Listrik Sinar Kasih Ambon
            </div>
          </footer>
        </TampilanPublik>
      </body>
    </html>
  );
}
