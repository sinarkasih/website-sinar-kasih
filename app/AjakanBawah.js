// Lokasi file: app/AjakanBawah.js
// Kotak ajakan di bagian bawah halaman publik (judul, teks, dua tombol).
// Dipakai bersama supaya tampilannya seragam.

import Link from "next/link";

export default function AjakanBawah({ judul, teks, tombolUtama, tombolKedua }) {
  return (
    <section className="ajakan">
      <div>
        <h2>{judul}</h2>
        {teks && <p>{teks}</p>}
      </div>
      <div className="ajakan-tombol">
        {tombolUtama && (
          <Link href={tombolUtama.href} className="btn">{tombolUtama.label}</Link>
        )}
        {tombolKedua && (
          <Link href={tombolKedua.href} className="btn btn-garis">{tombolKedua.label}</Link>
        )}
      </div>
      <style>{`
        .ajakan { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-top: 36px; padding: 26px 28px; border-radius: 18px; background: #fcf6ee; border: 1px solid #f0e2cf; }
        .ajakan h2 { margin: 0 0 6px; font-size: 21px; color: #3f2f24; }
        .ajakan p { margin: 0; max-width: 560px; font-size: 15px; line-height: 1.6; color: #7a6555; }
        .ajakan-tombol { display: flex; gap: 10px; flex-wrap: wrap; }
        @media (max-width: 640px) {
          .ajakan { padding: 20px; }
          .ajakan-tombol, .ajakan-tombol .btn { width: 100%; }
        }
      `}</style>
    </section>
  );
}
