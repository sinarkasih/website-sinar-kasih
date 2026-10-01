import "./globals.css";

import Link from "next/link";
import CartNav from "./CartNav";

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

function NavItem({
  href,
  label,
  icon,
  color,
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <header className="topbar">
          <div className="wrap topbar-inner">

            <Link
              href="/"
              className="brand"
            >
              <b>SK</b>

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

              <Link href="/troli">
                <CartNav label="Troli" />
              </Link>

              <NavItem
                href="/lainnya"
                label="Informasi"
                color="#4d7185"
                icon={<InfoIcon />}
              />
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
            color="#6f4a32"
            icon={<HomeIcon />}
          />

          <NavItem
            href="/kategori"
            label="Kategori"
            color="#c58a2b"
            icon={<CategoryIcon />}
          />

          <Link href="/troli">
            <CartNav label="Troli" />
          </Link>

          <NavItem
            href="/lainnya"
            label="Informasi"
            color="#4d7185"
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
