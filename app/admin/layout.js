"use client";

// Lokasi file: app/admin/layout.js
// Kerangka panel admin:
// - Penjaga login (pengecekan hanya sekali, tidak di setiap pindah menu)
// - Hak akses per role (karyawan hanya melihat menu Produk)
// - Sidebar dengan ikon, tombol Keluar, nama admin yang sedang login

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

// ===== PENGATURAN HAK AKSES =====
// "semua" = boleh membuka semua menu.
// Untuk karyawan, tambahkan alamat menu lain di dalam daftar jika perlu,
// misalnya: ["/admin/produk", "/admin/kategori", "/admin/brand"]
const AKSES_ROLE = {
  admin_utama: "semua",
  karyawan_produk: ["/admin/produk", "/admin/akun"],
};

const HALAMAN_AWAL = {
  admin_utama: "/admin",
  karyawan_produk: "/admin/produk",
};

const NAMA_ROLE = {
  admin_utama: "Admin Utama",
  karyawan_produk: "Karyawan Produk",
};

const MENU = [
  {
    judul: "Utama",
    item: [{ href: "/admin", label: "Dashboard", ikon: "dashboard" }],
  },
  {
    judul: "Katalog",
    item: [
      { href: "/admin/produk", label: "Produk", ikon: "produk" },
      { href: "/admin/kategori", label: "Kategori", ikon: "kategori" },
      { href: "/admin/brand", label: "Brand", ikon: "brand" },
    ],
  },
  {
    judul: "Penjualan",
    item: [
      { href: "/admin/pesanan", label: "Pesanan", ikon: "pesanan" },
      { href: "/admin/pesanan/trash", label: "Trash Pesanan", ikon: "trash" },
      { href: "/admin/pelanggan", label: "Pelanggan", ikon: "pelanggan" },
    ],
  },
  {
    judul: "Website",
    item: [
      { href: "/admin/tampilan", label: "Tampilan Website", ikon: "tampilan" },
      { href: "/admin/toko", label: "Toko & Kontak", ikon: "toko" },
      { href: "/admin/loker", label: "Lowongan Kerja", ikon: "loker" },
    ],
  },
  {
    judul: "Laporan & Sistem",
    item: [
      { href: "/admin/statistik", label: "Statistik", ikon: "statistik" },
      { href: "/admin/riwayat", label: "Riwayat Perubahan", ikon: "riwayat" },
      { href: "/admin/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
    ],
  },
  {
    judul: "Akun",
    item: [{ href: "/admin/akun", label: "Akun Saya", ikon: "akun" }],
  },
];

function bolehBuka(role, path) {
  const akses = AKSES_ROLE[role];
  if (!akses) return false;
  if (akses === "semua") return true;
  return akses.some((a) => path === a || path.startsWith(a + "/"));
}

function cocok(path, href) {
  if (href === "/admin") return path === "/admin";
  return path === href || path.startsWith(href + "/");
}

function inisial(teks) {
  return (teks || "A")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0].toUpperCase())
    .join("");
}

// ===== IKON =====
const IKON = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  produk: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M12 13v8" />
    </>
  ),
  kategori: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  brand: (
    <>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  pesanan: (
    <>
      <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="m6 7 1 13h10l1-13" />
      <path d="M9 7V4h6v3" />
    </>
  ),
  pelanggan: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
      <path d="M18 14a6 6 0 0 1 3.5 6" />
    </>
  ),
  tampilan: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  toko: (
    <>
      <path d="M4 10v10h16V10" />
      <path d="M3 10 5 4h14l2 6Z" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  loker: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M3 13h18" />
    </>
  ),
  statistik: <path d="M4 20V10M10 20V4M16 20v-7M2 20h20" />,
  pengaturan: (
    <>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  keluar: (
    <>
      <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="m10 17-5-5 5-5" />
      <path d="M5 12h11" />
    </>
  ),
  akun: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2" />
    </>
  ),
  riwayat: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  tutup: <path d="M6 6l12 12M18 6 6 18" />,
  situs: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
};

function Ikon({ nama, ukuran = 19 }) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {IKON[nama]}
    </svg>
  );
}

// Layar singkat saat memeriksa login (tanpa tulisan)
function LayarMuat() {
  return (
    <div className="adm-muat" aria-busy="true" aria-label="Memuat panel admin">
      <img src="/logo-sk.png" alt="" className="adm-muat-logo" />
      <style>{CSS}</style>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const halamanLogin = pathname === "/admin/login";

  const [status, setStatus] = useState("memuat"); // memuat | masuk | keluar
  const [admin, setAdmin] = useState(null);
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [sedangKeluar, setSedangKeluar] = useState(false);

  const muatAdmin = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setAdmin(null);
      setStatus("keluar");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setAdmin(null);
      setStatus("keluar");
      return;
    }

    const { data } = await supabase
      .from("admin")
      .select("nama, email, role, aktif")
      .eq("auth_user_id", session.user.id)
      .eq("aktif", true)
      .maybeSingle();

    if (!data || !AKSES_ROLE[data.role]) {
      setAdmin(null);
      setStatus("keluar");
      return;
    }

    setAdmin(data);
    setStatus("masuk");
  }, []);

  // Periksa login sekali saat panel dibuka, lalu pantau perubahan login/keluar
  useEffect(() => {
    muatAdmin();

    const supabase = getSupabase();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setTimeout(() => muatAdmin(), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [muatAdmin]);

  // Arahkan pengguna ke halaman yang sesuai
  useEffect(() => {
    if (status === "memuat") return;

    if (halamanLogin) {
      if (status === "masuk" && admin) {
        router.replace(HALAMAN_AWAL[admin.role]);
      }
      return;
    }

    if (status === "keluar") {
      router.replace("/admin/login");
      return;
    }

    if (admin && !bolehBuka(admin.role, pathname)) {
      router.replace(HALAMAN_AWAL[admin.role]);
    }
  }, [status, admin, pathname, halamanLogin, router]);

  // Tutup menu HP setiap pindah halaman
  useEffect(() => {
    setMenuTerbuka(false);
  }, [pathname]);

  async function keluar() {
    if (!window.confirm("Keluar dari panel admin?")) return;

    setSedangKeluar(true);
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setAdmin(null);
    setStatus("keluar");
    setSedangKeluar(false);
    router.replace("/admin/login");
  }

  // Halaman login tampil tanpa menu admin
  if (halamanLogin) {
    if (status === "masuk") return <LayarMuat />;
    return children;
  }

  const bolehTampil =
    status === "masuk" && admin && bolehBuka(admin.role, pathname);

  if (!bolehTampil) return <LayarMuat />;

  const menuTampil = MENU.map((grup) => ({
    ...grup,
    item: grup.item.filter((i) => bolehBuka(admin.role, i.href)),
  })).filter((grup) => grup.item.length > 0);

  let aktif = null;
  menuTampil.forEach((grup) =>
    grup.item.forEach((i) => {
      if (cocok(pathname, i.href)) {
        if (!aktif || i.href.length > aktif.href.length) {
          aktif = { ...i, grup: grup.judul };
        }
      }
    })
  );

  const namaTampil = admin.nama || admin.email;

  return (
    <div className="adm-root">
      <div
        className={`adm-overlay ${menuTerbuka ? "buka" : ""}`}
        onClick={() => setMenuTerbuka(false)}
      />

      <aside className={`adm-side ${menuTerbuka ? "buka" : ""}`}>
        <div className="adm-brand">
          <span className="adm-logo">
            <img src="/logo-sk.png" alt="Logo Sinar Kasih" />
          </span>
          <span className="adm-brand-teks">
            <strong>Sinar Kasih</strong>
            <small>Panel Admin</small>
          </span>
          <button
            type="button"
            className="adm-tutup"
            onClick={() => setMenuTerbuka(false)}
            aria-label="Tutup menu"
          >
            <Ikon nama="tutup" />
          </button>
        </div>

        <nav className="adm-nav" aria-label="Menu admin">
          {menuTampil.map((grup) => (
            <div key={grup.judul} className="adm-grup">
              <p className="adm-grup-judul">{grup.judul}</p>
              {grup.item.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className={`adm-link ${
                    aktif && aktif.href === i.href ? "aktif" : ""
                  }`}
                >
                  <Ikon nama={i.ikon} />
                  <span>{i.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-side-bawah">
          <a href="/" target="_blank" rel="noreferrer" className="adm-link">
            <Ikon nama="situs" />
            <span>Lihat Website</span>
          </a>
        </div>
      </aside>

      <div className="adm-utama">
        <header className="adm-top">
          <button
            type="button"
            className="adm-burger"
            onClick={() => setMenuTerbuka(true)}
            aria-label="Buka menu"
          >
            <Ikon nama="menu" ukuran={22} />
          </button>

          <div className="adm-jejak">
            {aktif ? (
              <>
                <span className="adm-jejak-grup">{aktif.grup}</span>
                <span className="adm-jejak-pisah">/</span>
                <span className="adm-jejak-hal">{aktif.label}</span>
              </>
            ) : (
              <span className="adm-jejak-hal">Panel Admin</span>
            )}
          </div>

          <div className="adm-akun">
            <span className="adm-avatar">{inisial(namaTampil)}</span>
            <span className="adm-akun-info">
              <strong>{namaTampil}</strong>
              <small>{NAMA_ROLE[admin.role]}</small>
            </span>
            <button
              type="button"
              className="adm-keluar"
              onClick={keluar}
              disabled={sedangKeluar}
            >
              <Ikon nama="keluar" ukuran={18} />
              <span>{sedangKeluar ? "Keluar..." : "Keluar"}</span>
            </button>
          </div>
        </header>

        <main className="adm-konten">
          <div className="adm-isi">{children}</div>
        </main>
      </div>

      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
  .adm-root {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    background: #f7f2ea;
    color: #3f2f24;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .adm-root button,
  .adm-root input,
  .adm-root select,
  .adm-root textarea {
    font-family: inherit;
  }

  .adm-root *,
  .adm-root *::before,
  .adm-root *::after {
    box-sizing: border-box;
  }

  /* ===== SIDEBAR ===== */
  .adm-side {
    width: 252px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: #3b2a20;
    color: #eadccb;
    overflow-y: auto;
  }

  .adm-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 18px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .adm-logo {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #f4e6d8;
    padding: 2px;
  }

  .adm-logo img {
    width: 100%;
    height: 100%;
    display: block;
  }

  .adm-brand-teks {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    min-width: 0;
  }

  .adm-brand-teks strong {
    color: #ffffff;
    font-size: 16px;
  }

  .adm-brand-teks small {
    color: #bfa98f;
    font-size: 12.5px;
    margin-top: 2px;
  }

  .adm-tutup {
    display: none;
    margin-left: auto;
    background: none;
    border: none;
    color: #eadccb;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
  }

  .adm-nav {
    flex: 1;
    padding: 10px 12px;
  }

  .adm-grup {
    margin-top: 14px;
  }

  .adm-grup-judul {
    margin: 0 0 6px;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 600;
    color: #a88f74;
  }

  .adm-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    margin-bottom: 2px;
    border-radius: 10px;
    color: #eadccb;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .adm-link svg {
    flex-shrink: 0;
    opacity: 0.85;
  }

  .adm-link:hover {
    background: rgba(255, 255, 255, 0.07);
    color: #ffffff;
  }

  .adm-link.aktif {
    background: rgba(197, 138, 43, 0.18);
    color: #ffffff;
    font-weight: 600;
  }

  .adm-link.aktif::before {
    content: "";
    position: absolute;
    left: -12px;
    top: 8px;
    bottom: 8px;
    width: 4px;
    border-radius: 0 4px 4px 0;
    background: #c58a2b;
  }

  .adm-link.aktif svg {
    color: #e0a94a;
    opacity: 1;
  }

  .adm-link:focus-visible,
  .adm-keluar:focus-visible,
  .adm-burger:focus-visible,
  .adm-tutup:focus-visible {
    outline: 2px solid #e0a94a;
    outline-offset: 2px;
  }

  .adm-side-bawah {
    padding: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* ===== AREA UTAMA ===== */
  .adm-utama {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .adm-top {
    height: 64px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 28px;
    background: #fffdf9;
    border-bottom: 1px solid #e6d9c8;
  }

  .adm-burger {
    display: none;
    background: none;
    border: none;
    color: #3f2f24;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
  }

  .adm-jejak {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font-size: 15px;
  }

  .adm-jejak-grup {
    color: #9a8571;
  }

  .adm-jejak-pisah {
    color: #cdbca8;
  }

  .adm-jejak-hal {
    color: #3f2f24;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .adm-akun {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .adm-avatar {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #6f4c36;
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
  }

  .adm-akun-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    max-width: 200px;
  }

  .adm-akun-info strong {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .adm-akun-info small {
    font-size: 12.5px;
    color: #9a8571;
  }

  .adm-keluar {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-left: 6px;
    padding: 9px 14px;
    border: 1px solid #e0cfbb;
    border-radius: 10px;
    background: #ffffff;
    color: #8a3b2b;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .adm-keluar:hover {
    background: #fbefe9;
    border-color: #d9b5a6;
  }

  .adm-keluar:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .adm-konten {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 28px;
  }

  .adm-overlay {
    display: none;
  }

  /* ===== LAYAR MUAT ===== */
  .adm-muat {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
    background: #f7f2ea;
  }

  .adm-muat-logo {
    width: 64px;
    height: 64px;
    display: block;
    animation: adm-denyut 1.1s ease-in-out infinite;
  }

  @keyframes adm-denyut {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(0.92); opacity: 0.7; }
  }

  /* ===== TABLET & HP ===== */
  @media (max-width: 900px) {
    .adm-side {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 1002;
      width: 272px;
      transform: translateX(-100%);
      transition: transform 0.22s ease;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.18);
    }

    .adm-side.buka {
      transform: translateX(0);
    }

    .adm-overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 1001;
      background: rgba(30, 20, 14, 0.45);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s ease;
    }

    .adm-overlay.buka {
      opacity: 1;
      pointer-events: auto;
    }

    .adm-tutup,
    .adm-burger {
      display: inline-flex;
    }

    .adm-top {
      padding: 0 16px;
      gap: 10px;
    }

    .adm-konten {
      padding: 20px 16px 32px;
    }
  }

  @media (max-width: 600px) {
    .adm-akun-info,
    .adm-jejak-grup,
    .adm-jejak-pisah,
    .adm-keluar span {
      display: none;
    }

    .adm-keluar {
      padding: 9px 10px;
      margin-left: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .adm-muat-logo { animation: none; }
    .adm-side, .adm-overlay { transition: none; }
  }

  /* =====================================================
     PENYERAGAM TAMPILAN SEMUA HALAMAN ADMIN
     Bagian ini membuat judul, kartu, tabel, dan tombol
     di setiap halaman admin tampil seragam.
  ===================================================== */

  .adm-isi {
    width: 100%;
    max-width: 1240px;
    margin: 0 auto;
  }

  /* Bungkus halaman: hilangkan jarak & latar ganda */
  .adm-isi > .admin-content,
  .adm-isi > .dash,
  .adm-isi > .page,
  .adm-isi > .lokerAdminPage,
  .adm-isi > .lokerAdminPage > .page,
  .adm-isi > main,
  .adm-isi > [style] {
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
    min-height: 0 !important;
    max-width: none !important;
    width: 100% !important;
  }

  .adm-isi > .admin-content > .pesanan-page,
  .adm-isi > .admin-content > .trash-page,
  .adm-isi > .admin-content > .detail-page {
    padding: 0 !important;
    background: transparent !important;
  }

  /* Kepala halaman */
  .adm-isi .admin-page-header,
  .adm-isi .pesanan-header,
  .adm-isi .trash-header,
  .adm-isi .nonaktif-header,
  .adm-isi .promo-header,
  .adm-isi .page-head,
  .adm-isi .topbar {
    position: static !important;
    display: flex !important;
    flex-wrap: wrap;
    align-items: flex-start !important;
    justify-content: space-between !important;
    gap: 16px !important;
    margin: 0 0 24px !important;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    height: auto !important;
  }

  .adm-isi .eyebrow {
    display: none !important;
  }

  /* Judul */
  .adm-isi h1 {
    font-size: 28px !important;
    line-height: 1.25 !important;
    font-weight: 700 !important;
    letter-spacing: -0.01em !important;
    color: #3f2f24 !important;
    margin: 0 0 6px !important;
    max-width: none !important;
  }

  .adm-isi h1 + p {
    margin: 0 !important;
    font-size: 15px !important;
    line-height: 1.5 !important;
    color: #7d6957 !important;
  }

  .adm-isi h2 {
    font-size: 19px !important;
    line-height: 1.3 !important;
    font-weight: 700 !important;
    color: #3f2f24 !important;
    margin: 0 0 4px !important;
  }

  .adm-isi h2 + p {
    margin-top: 0 !important;
    font-size: 14.5px !important;
    color: #7d6957 !important;
  }

  .adm-isi h3 {
    font-size: 16.5px !important;
    line-height: 1.35 !important;
    color: #3f2f24 !important;
  }

  /* Kartu */
  .adm-isi .admin-card,
  .adm-isi .content-card,
  .adm-isi .form-card,
  .adm-isi .formCard,
  .adm-isi .info-card,
  .adm-isi .admin-product-table-card {
    max-width: none !important;
    background: #ffffff !important;
    border: 1px solid #eadfce !important;
    border-radius: 14px !important;
    box-shadow: 0 1px 2px rgba(59, 42, 32, 0.04) !important;
  }

  .adm-isi .admin-card,
  .adm-isi .content-card,
  .adm-isi .form-card,
  .adm-isi .formCard {
    padding: 24px !important;
  }

  /* Kartu angka ringkasan */
  .adm-isi .kpi,
  .adm-isi .pesanan-summary-card,
  .adm-isi .summary-card,
  .adm-isi .summaryCard {
    background: #ffffff !important;
    border: 1px solid #eadfce !important;
    border-radius: 14px !important;
    padding: 18px 20px !important;
    box-shadow: none !important;
  }

  .adm-isi .kpi span,
  .adm-isi .pesanan-summary-label,
  .adm-isi .summary-card span,
  .adm-isi .summaryCard span {
    font-size: 13.5px !important;
    color: #7d6957 !important;
    font-weight: 500 !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
  }

  .adm-isi .kpi b,
  .adm-isi .pesanan-summary-number,
  .adm-isi .summary-card strong,
  .adm-isi .summaryCard strong {
    font-size: 26px !important;
    line-height: 1.2 !important;
    font-weight: 700 !important;
    color: #3f2f24 !important;
    margin-top: 6px !important;
  }

  /* Tabel */
  .adm-isi table {
    width: 100%;
    border-collapse: collapse;
  }

  .adm-isi th {
    text-transform: none !important;
    letter-spacing: 0 !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    color: #7d6957 !important;
    background: #faf6f0 !important;
    text-align: left;
    white-space: nowrap;
  }

  .adm-isi td {
    font-size: 14.5px;
    color: #3f2f24;
    vertical-align: middle;
  }

  /* Kolom pencarian & isian */
  .adm-isi input[type="text"],
  .adm-isi input[type="search"],
  .adm-isi input[type="email"],
  .adm-isi input[type="number"],
  .adm-isi input[type="tel"],
  .adm-isi input[type="url"],
  .adm-isi input[type="date"],
  .adm-isi input[type="time"],
  .adm-isi input:not([type]),
  .adm-isi select,
  .adm-isi textarea {
    border: 1px solid #dccbb7 !important;
    border-radius: 10px !important;
    font-size: 15px !important;
    color: #3f2f24;
    background-color: #ffffff;
  }

  .adm-isi input:focus,
  .adm-isi select:focus,
  .adm-isi textarea:focus {
    outline: none !important;
    border-color: #6f4c36 !important;
    box-shadow: 0 0 0 3px rgba(111, 76, 54, 0.14) !important;
  }

  /* Tombol utama */
  .adm-isi .admin-primary-button,
  .adm-isi .addButton,
  .adm-isi .btn.primary {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 42px;
    padding: 0 18px !important;
    border: none !important;
    border-radius: 10px !important;
    background: #6f4c36 !important;
    color: #ffffff !important;
    font-size: 14.5px !important;
    font-weight: 700 !important;
    text-decoration: none !important;
    box-shadow: none !important;
    cursor: pointer;
    white-space: nowrap;
  }

  .adm-isi .admin-primary-button:hover,
  .adm-isi .addButton:hover,
  .adm-isi .btn.primary:hover {
    background: #5c3e2c !important;
  }

  /* Tombol kedua */
  .adm-isi .admin-secondary-button,
  .adm-isi .btn.secondary,
  .adm-isi .contactButton,
  .adm-isi .previewButton,
  .adm-isi .back-button {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 42px;
    padding: 0 16px !important;
    border: 1px solid #e0cfbb !important;
    border-radius: 10px !important;
    background: #ffffff !important;
    color: #5c3e2c !important;
    font-size: 14.5px !important;
    font-weight: 600 !important;
    text-decoration: none !important;
    box-shadow: none !important;
    cursor: pointer;
    white-space: nowrap;
  }

  .adm-isi .admin-secondary-button:hover,
  .adm-isi .btn.secondary:hover,
  .adm-isi .contactButton:hover,
  .adm-isi .previewButton:hover,
  .adm-isi .back-button:hover {
    background: #f8f1e8 !important;
  }

  /* Tombol kecil di tabel (Edit / Detail) */
  .adm-isi .editButton,
  .adm-isi .detail-link,
  .adm-isi .btn.edit {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px !important;
    border: 1px solid #e0cfbb !important;
    border-radius: 8px !important;
    background: #ffffff !important;
    color: #4b3326 !important;
    font-size: 13.5px !important;
    font-weight: 600 !important;
    text-decoration: none !important;
    white-space: nowrap;
  }

  .adm-isi .editButton:hover,
  .adm-isi .detail-link:hover,
  .adm-isi .btn.edit:hover {
    background: #f8f1e8 !important;
  }

  /* Pesan info kuning */
  .adm-isi .notice {
    margin: 0 0 20px;
    border-radius: 12px;
  }

  /* Kepala kartu bagian */
  .adm-isi .admin-section-header {
    margin-bottom: 18px !important;
  }

  @media (max-width: 600px) {
    .adm-isi h1 {
      font-size: 24px !important;
    }
  }
`;
