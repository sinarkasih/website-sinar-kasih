"use client";

// Lokasi file: app/DaftarLipat.js
// Daftar buka-tutup bernomor yang dipakai bersama oleh halaman publik
// (Tentang Kami, Cara Pesan) supaya tampilannya seragam.
// items: [{ id, judul, ringkas, isi }]

import { useState } from "react";

export default function DaftarLipat({ items, awalTerbuka = null }) {
  const [terbuka, setTerbuka] = useState(awalTerbuka);

  return (
    <div className="dl-daftar">
      {items.map((item, i) => {
        const buka = terbuka === item.id;
        return (
          <div key={item.id} className={`dl-item ${buka ? "buka" : ""}`}>
            <button
              type="button"
              className="dl-tombol"
              onClick={() => setTerbuka(buka ? null : item.id)}
              aria-expanded={buka}
              aria-controls={`dl-isi-${item.id}`}
            >
              <span className="dl-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="dl-teks">
                <span className="dl-judul">{item.judul}</span>
                {!buka && item.ringkas && <span className="dl-ringkas">{item.ringkas}</span>}
              </span>
              <svg className="dl-panah" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {buka && (
              <div id={`dl-isi-${item.id}`} className="dl-isi">
                {item.isi}
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        .dl-daftar { display: grid; gap: 12px; }
        .dl-item { background: #fff; border: 1px solid #eadfce; border-radius: 16px; overflow: hidden; transition: border-color .15s ease, box-shadow .15s ease; }
        .dl-item:hover { border-color: #d6c1a8; }
        .dl-item.buka { border-color: #d6c1a8; box-shadow: 0 6px 20px rgba(59, 42, 32, .06); }
        .dl-tombol { width: 100%; display: flex; align-items: center; gap: 16px; padding: 18px 20px; border: none; background: transparent; text-align: left; cursor: pointer; font: inherit; color: #3f2f24; }
        .dl-tombol:focus-visible { outline: 3px solid #c58a2b; outline-offset: -3px; border-radius: 16px; }
        .dl-no { width: 40px; height: 40px; flex-shrink: 0; display: grid; place-items: center; border-radius: 12px; background: #f3e8da; color: #6f4c36; font-size: 14px; font-weight: 800; }
        .dl-item.buka .dl-no { background: #6f4c36; color: #fff; }
        .dl-teks { display: grid; gap: 3px; flex: 1; min-width: 0; }
        .dl-judul { font-size: 16.5px; font-weight: 700; line-height: 1.35; }
        .dl-ringkas { font-size: 14px; line-height: 1.5; color: #7a6555; }
        .dl-panah { flex-shrink: 0; color: #9a8571; transition: transform .2s ease; }
        .dl-item.buka .dl-panah { transform: rotate(180deg); color: #6f4c36; }
        .dl-isi { padding: 0 20px 22px 76px; color: #554840; font-size: 15.5px; line-height: 1.75; }
        .dl-isi > p, .dl-isi > div > p { margin: 0 0 12px; }
        .dl-isi strong { color: #3f2f24; }

        /* Isi bersama di dalam daftar */
        .dl-kotak { display: grid; gap: 4px; margin-top: 14px; padding: 12px 14px; border-radius: 12px; background: #fcf6ee; border: 1px solid #f0e2cf; font-size: 14.5px; line-height: 1.6; }
        .dl-kotak strong { color: #6f4c36; }
        .dl-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
        .dl-grid.tiga { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .dl-kartu { display: flex; gap: 12px; align-items: flex-start; padding: 14px; border: 1px solid #f0e7db; border-radius: 12px; background: #fcfaf7; }
        .dl-kartu strong { display: block; font-size: 15px; line-height: 1.35; }
        .dl-kartu p { margin: 4px 0 0; font-size: 14px; line-height: 1.55; color: #7a6555; }
        .dl-ikon { width: 38px; height: 38px; flex-shrink: 0; display: grid; place-items: center; border-radius: 10px; background: #f3e8da; color: #6f4c36; }
        .dl-cek { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 8px; }
        .dl-cek li { display: flex; gap: 10px; align-items: flex-start; }
        .dl-cek li::before { content: ""; width: 20px; height: 20px; flex-shrink: 0; margin-top: 3px; border-radius: 50%; background: #eaf7ed url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232f7a46' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 12 4 4 8-8'/%3E%3C/svg%3E") center / 13px no-repeat; }
        .dl-langkah { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 10px; counter-reset: dl; }
        .dl-langkah li { position: relative; padding: 12px 14px 12px 52px; border: 1px solid #f0e7db; border-radius: 12px; background: #fcfaf7; counter-increment: dl; }
        .dl-langkah li::before { content: counter(dl); position: absolute; left: 14px; top: 12px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; background: #6f4c36; color: #fff; font-size: 13px; font-weight: 800; }
        .dl-langkah strong { display: block; }
        .dl-langkah p { margin: 2px 0 0; font-size: 14px; color: #7a6555; line-height: 1.55; }

        @media (max-width: 640px) {
          .dl-tombol { padding: 16px; gap: 12px; }
          .dl-no { width: 34px; height: 34px; font-size: 13px; }
          .dl-isi { padding: 0 16px 18px; font-size: 15px; }
          .dl-grid, .dl-grid.tiga { grid-template-columns: minmax(0, 1fr); }
        }
      `}</style>
    </div>
  );
}
