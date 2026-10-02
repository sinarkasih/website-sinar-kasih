"use client";

// Lokasi file: app/KontrolKatalog.js
// Kotak pencarian (dengan tombol x) dan pilihan urutan untuk daftar produk.

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PILIHAN = [
  ["terbaru", "Terbaru"],
  ["nama_az", "Nama A–Z"],
  ["nama_za", "Nama Z–A"],
  ["harga_rendah", "Harga terendah"],
  ["harga_tinggi", "Harga tertinggi"],
];

export function PilihUrutan() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const nilai = params.get("urut") || "terbaru";

  function ganti(e) {
    const p = new URLSearchParams(params.toString());
    if (e.target.value === "terbaru") p.delete("urut");
    else p.set("urut", e.target.value);
    p.delete("hal");
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className="kk-urut">
      <span>Urutkan</span>
      <select value={nilai} onChange={ganti}>
        {PILIHAN.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

export function KotakCari({ awal = "", tujuan = "/cari" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [teks, setTeks] = useState(awal);

  function cari(kata) {
    const p = new URLSearchParams(params.toString());
    if (kata) p.set("q", kata);
    else p.delete("q");
    p.delete("hal");
    const qs = p.toString();
    router.push(qs ? `${tujuan}?${qs}` : tujuan);
  }

  return (
    <form
      className="kk-cari"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        cari(teks.trim());
      }}
    >
      <div className="kk-cari-kotak">
        <input
          type="text"
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          placeholder="Cari nama produk atau SKU..."
          aria-label="Cari produk"
        />
        {teks !== "" && (
          <button
            type="button"
            className="kk-x"
            onClick={() => {
              setTeks("");
              cari("");
            }}
            aria-label="Hapus pencarian"
            title="Hapus pencarian"
          >
            ×
          </button>
        )}
      </div>
      <button type="submit" className="kk-tombol">
        Cari
      </button>
    </form>
  );
}
