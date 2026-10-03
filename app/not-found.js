// Lokasi file: app/not-found.js
// Halaman "tidak ditemukan" (404) bergaya Sinar Kasih, menggantikan halaman
// bawaan berbahasa Inggris. Muncul jika alamat salah atau produk sudah dihapus.

import { Suspense } from "react";
import Link from "next/link";
import { KotakCari } from "./KontrolKatalog";

export const metadata = {
  title: "Halaman tidak ditemukan | Sinar Kasih",
};

export default function TidakDitemukan() {
  return (
    <section className="section halaman-atas">
      <div className="wrap">
        <div className="nf-kotak">
          <span className="nf-kode" aria-hidden="true">404</span>
          <h1>Halaman tidak ditemukan</h1>
          <p>
            Maaf, halaman yang Anda cari tidak ada atau produknya sudah tidak tersedia.
            Coba cari produk yang Anda butuhkan di bawah ini.
          </p>

          <Suspense fallback={null}>
            <div className="nf-cari">
              <KotakCari bawaParam={false} />
            </div>
          </Suspense>

          <div className="nf-tombol">
            <Link href="/" className="btn">Ke Beranda</Link>
            <Link href="/kategori" className="btn btn-garis">Lihat Kategori</Link>
          </div>
        </div>
      </div>

      <style>{`
        .nf-kotak { max-width: 620px; margin: 0 auto; padding: 44px 28px; text-align: center; background: #fff; border: 1px solid #eadfce; border-radius: 20px; }
        .nf-kode { display: block; margin-bottom: 6px; font-size: 64px; font-weight: 800; line-height: 1; color: #e2cdb2; letter-spacing: .04em; }
        .nf-kotak p { margin: 0 auto 22px !important; max-width: 480px; }
        .nf-cari { max-width: 460px; margin: 0 auto 18px; text-align: left; }
        .nf-tombol { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        @media (max-width: 520px) { .nf-kotak { padding: 32px 18px; } .nf-tombol .btn { width: 100%; } }
      `}</style>
    </section>
  );
}
