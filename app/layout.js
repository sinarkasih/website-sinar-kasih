import "./globals.css";

import Link from "next/link";

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

function CartIcon() {
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
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
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

function NavItem({ href, label, icon }) {
  return (
    <Link href={href}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </Link>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <header className="topbar">
          <div className="wrap topbar-inner">

            <Link href="/" className="brand">
              <b>SK</b>

              <span>
                <strong>SINAR KASIH</strong>
                <small>Toko Listrik Ambon</small>
              </span>
            </Link>

            <nav>
              <Link href="/">
                <span className="nav-icon">
                  <HomeIcon />
                </span>
                <span className="nav-label">
                  Beranda
                </span>
              </Link>

              <Link href="/kategori">
                <span className="nav-icon">
                  <CategoryIcon />
                </span>
                <span className="nav-label">
                  Kategori
                </span>
              </Link>

              <Link href="/troli">
                <span className="nav-icon">
                  <CartIcon />
                </span>
                <span className="nav-label">
                  Troli
                </span>
              </Link>

              <Link href="/lainnya">
                <span className="nav-icon">
                  <InfoIcon />
                </span>
                <span className="nav-label">
                  Informasi
                </span>
              </Link>
            </nav>

          </div>
        </header>

        <main>{children}</main>

        <nav
          className="bottom"
          aria-label="Navigasi utama"
        >
          <NavItem
            href="/"
            label="Beranda"
            icon={<HomeIcon />}
          />

          <NavItem
            href="/kategori"
            label="Kategori"
            icon={<CategoryIcon />}
          />

          <NavItem
            href="/troli"
            label="Troli"
            icon={<CartIcon />}
          />

          <NavItem
            href="/lainnya"
            label="Informasi"
            icon={<InfoIcon />}
          />
        </nav>

        <footer>
          © 2026 Toko Listrik Sinar Kasih Ambon
        </footer>
      </body>
    </html>
  );
}
