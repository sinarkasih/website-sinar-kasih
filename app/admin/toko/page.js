"use client";

import Link from "next/link";

export default function TokoPage() {
  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Pengaturan Toko</h1>
          <p>
            Kelola informasi toko dan cabang Toko Listrik Sinar Kasih.
          </p>
        </div>
      </div>

      <div className="admin-card">
        <div className="topActions">
          <Link
            href="/admin/toko/kontak"
            className="contactButton"
          >
            Informasi Toko & Kontak
          </Link>

          <Link
            href="/admin/toko/cabang/tambah"
            className="addButton"
          >
            + Tambah Cabang
          </Link>
        </div>

        <div className="notice">
          <strong>Pengaturan Toko</strong>
          <p>
            Gunakan menu di atas untuk mengatur informasi toko,
            kontak, dan menambahkan cabang toko.
          </p>
        </div>
      </div>
    </main>
  );
}
