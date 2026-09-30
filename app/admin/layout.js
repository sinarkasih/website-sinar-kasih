import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div className="admin">
      <div className="adminhead">
        <div className="adminheadInner">
          SINAR KASIH — ADMIN PANEL
        </div>
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

        <main className="dash">
          {children}
        </main>
      </div>

      <style>{`
        /* =========================================================
           ADMIN LAYOUT UTAMA
        ========================================================= */

        .admin {
          min-height: 100vh;
          box-sizing: border-box;
          background: #f5f0e8;
          color: #3f2f24;
        }

        /* =========================================================
           HEADER ADMIN
        ========================================================= */

        .adminhead {
          position: relative;
          z-index: 100;

          width: 100%;
          height: 56px;
          min-height: 56px;

          box-sizing: border-box;

          display: flex;
          align-items: center;

          background: #6f4c36;
          color: #ffffff;

          border-bottom: 1px solid
            rgba(0, 0, 0, 0.08);
        }

        .adminheadInner {
          display: flex;
          align-items: center;

          width: 100%;
          height: 56px;

          box-sizing: border-box;

          padding: 0 28px;

          font-size: 18px;
          font-weight: 700;
          line-height: 1;

          letter-spacing: 0.1px;
        }

        /* =========================================================
           AREA UTAMA
        ========================================================= */

        .adminlayout {
          display: grid;

          grid-template-columns:
            240px minmax(0, 1fr);

          width: 100%;

          min-height:
            calc(100vh - 56px);

          box-sizing: border-box;
        }

        /* =========================================================
           SIDEBAR
        ========================================================= */

        .side {
          position: sticky;
          top: 0;

          align-self: start;

          width: 240px;

          min-height:
            calc(100vh - 56px);

          box-sizing: border-box;

          background: #fffaf3;

          border-right:
            1px solid #dfd2c3;

          padding: 18px 14px;

          overflow-y: auto;
        }

        .side a {
          display: block;

          width: 100%;

          box-sizing: border-box;

          padding: 10px 14px;
          margin-bottom: 4px;

          border-radius: 8px;

          color: #4b3326;

          text-decoration: none;

          font-size: 15px;
          line-height: 1.35;
          font-weight: 500;

          transition:
            background 0.15s ease,
            color 0.15s ease,
            transform 0.15s ease;
        }

        .side a:hover {
          background: #f1e7dc;
          color: #3d291f;
        }

        /* =========================================================
           KONTEN UTAMA
        ========================================================= */

        .dash {
          min-width: 0;
          width: 100%;

          box-sizing: border-box;

          padding: 28px;
        }

        .dash > * {
          min-width: 0;
          box-sizing: border-box;
        }

        /* =========================================================
           TABLET
        ========================================================= */

        @media (max-width: 900px) {
          .adminhead {
            height: 54px;
            min-height: 54px;
          }

          .adminheadInner {
            height: 54px;
            padding: 0 22px;
            font-size: 17px;
          }

          .adminlayout {
            grid-template-columns:
              210px minmax(0, 1fr);

            min-height:
              calc(100vh - 54px);
          }

          .side {
            width: 210px;

            min-height:
              calc(100vh - 54px);
          }

          .dash {
            padding: 22px;
          }
        }

        /* =========================================================
           MOBILE
        ========================================================= */

        @media (max-width: 700px) {
          .adminhead {
            height: 54px;
            min-height: 54px;
          }

          .adminheadInner {
            height: 54px;

            padding: 0 16px;

            font-size: 16px;
          }

          .adminlayout {
            display: block;
            min-height: auto;
          }

          .side {
            position: static;

            width: 100%;
            min-height: auto;

            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 6px;

            padding: 12px;

            border-right: none;

            border-bottom:
              1px solid #dfd2c3;
          }

          .side a {
            margin-bottom: 0;

            padding: 10px 12px;

            font-size: 14px;
          }

          .dash {
            width: 100%;

            padding:
              18px 14px 30px;
          }
        }

        /* =========================================================
           MOBILE KECIL
        ========================================================= */

        @media (max-width: 460px) {
          .side {
            grid-template-columns: 1fr;
          }

          .adminheadInner {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}
