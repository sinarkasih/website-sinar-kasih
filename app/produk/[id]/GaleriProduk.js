"use client";

// Lokasi file: app/produk/[id]/GaleriProduk.js
// Galeri foto di halaman Detail Produk: foto besar, tombol geser kiri/kanan,
// dan foto kecil di bawahnya untuk memilih foto.

import { useState } from "react";

export default function GaleriProduk({ foto, nama }) {
  const [aktif, setAktif] = useState(0);
  const jumlah = foto.length;

  if (jumlah === 0) {
    return (
      <div className="pd-galeri">
        <div className="pd-utama">
          <span className="pd-utama-kosong">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <path d="m21 16-5-5-9 9" />
            </svg>
            Foto segera hadir
          </span>
        </div>
      </div>
    );
  }

  const sekarang = foto[aktif] || foto[0];

  return (
    <div className="pd-galeri">
      <div className="pd-utama">
        <img src={sekarang.url} alt={sekarang.alt_text || nama} />
        {jumlah > 1 && (
          <>
            <button
              type="button"
              className="pd-geser kiri"
              onClick={() => setAktif((aktif - 1 + jumlah) % jumlah)}
              aria-label="Foto sebelumnya"
            >
              ‹
            </button>
            <button
              type="button"
              className="pd-geser kanan"
              onClick={() => setAktif((aktif + 1) % jumlah)}
              aria-label="Foto berikutnya"
            >
              ›
            </button>
            <span className="pd-hitung">{aktif + 1} / {jumlah}</span>
          </>
        )}
      </div>

      {jumlah > 1 && (
        <div className="pd-thumb">
          {foto.map((f, i) => (
            <button
              key={f.id || i}
              type="button"
              className={i === aktif ? "aktif" : ""}
              onClick={() => setAktif(i)}
              aria-label={`Lihat foto ${i + 1}`}
              aria-current={i === aktif ? "true" : undefined}
            >
              <img src={f.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
