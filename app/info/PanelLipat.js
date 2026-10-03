"use client";

// Lokasi file: app/info/PanelLipat.js
// Panel yang bisa dibuka-tutup di HP (seperti kotak Jam Operasional),
// dan selalu terbuka di layar komputer.

import { useState } from "react";

export default function PanelLipat({ ikon, kelasIkon, judul, keterangan, jumlah, className = "", children }) {
  const [buka, setBuka] = useState(false);

  return (
    <div className={`infoPanel panelLipat ${buka ? "buka" : ""} ${className}`}>
      <button
        type="button"
        className="infoPanelKepala panelTombol"
        onClick={() => setBuka(!buka)}
        aria-expanded={buka}
      >
        <span className={`menuIcon ${kelasIkon}`}>{ikon}</span>
        <span className="panelTeks">
          <span className="panelJudul">{judul}</span>
          <span className="panelKet">{keterangan}</span>
          {jumlah && <span className="panelJumlah">{jumlah}</span>}
        </span>
        <svg className="panelPanah" width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className="panelIsi">{children}</div>
    </div>
  );
}
