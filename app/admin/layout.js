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

          <Link
            href="/admin/kategori"
            style={{
              paddingLeft: "28px",
              fontSize: "15px",
            }}
          >
            Kategori
          </Link>

          <Link
            href="/admin/brand"
            style={{
              paddingLeft: "28px",
              fontSize: "15px",
            }}
          >
            Brand
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
        .admin {
          min-height: 100vh;
          box-sizing: border-box;
          background: #f5f0e8;
          color: #3f2f24;

          /*
           * Jangan diubah.
           * Ini menjaga posisi Admin agar tidak bertabrakan
           * dengan header/logo website.
           */
          padding-top: 76px;
        }

        .adminhead {
          position: sticky;
          top: 0;
          z-index: 100;

          width: 100%;
          min-height: 48px;

          box-sizing: border-box;

          background: #6f4c36;
          color: #ffffff;

          border-bottom: 1px solid
            rgba(0, 0, 0, 0.08);
        }

        .adminheadInner {
          display: flex;
          align-items: center;

          width: 100%;
          min-height: 48px;

          box-sizing: border-box;

          padding: 0 24px;

          font-size: 16px;
          font-weight: 700;
          line-height: 1.2;
        }

        .adminlayout {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);

          width: 100%;
          min-height: calc(100vh - 124px);

          box-sizing: border-box;
        }

        .side {
          position: sticky;
          top: 48px;

          align-self: start;

          width: 240px;
          min-height: calc(100vh - 124px);

          box-sizing: border-box;

          background: #fffaf3;

          border-right: 1px solid #dfd2c3;

          padding: 20px 14px;

          overflow-y: auto;
        }

        .side a {
          display: block;

          width: 100%;
          box-sizing: border-box;

          padding: 11px 14px;
          margin-bottom: 5px;

          border-radius: 8px;

          color: #4b3326;
          text-decoration: none;

          font-size: 16px;
          line-height: 1.35;
          font-weight: 500;

          transition:
            background 0.15s ease,
            color 0.15s ease;
        }

        .side a:hover {
          background: #f1e7dc;
          color: #3d291f;
        }

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

        @media (max-width: 900px) {
          .admin {
            padding-top: 70px;
          }

          .adminlayout {
            grid-template-columns: 210px minmax(0, 1fr);
            min-height: calc(100vh - 136px);
          }

          .side {
            width: 210px;
            min-height: calc(100vh - 136px);
          }

          .dash {
            padding: 22px;
          }
        }

        @media (max-width: 700px) {
          .admin {
            padding-top: 64px;
          }

          .adminhead {
            min-height: 58px;
          }

          .adminheadInner {
            min-height: 58px;
            padding: 0 16px;
            font-size: 15px;
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
            border-bottom: 1px solid #dfd2c3;
          }

          .side a {
            margin-bottom: 0;
            font-size: 14px;
          }

          .dash {
            width: 100%;
            padding: 18px 14px 30px;
          }
        }

        @media (max-width: 460px) {
          .side {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
