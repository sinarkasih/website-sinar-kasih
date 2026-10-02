"use client";

// Lokasi file: app/admin/Urut.js
// Tombol urutkan (▲▼) untuk judul kolom tabel di panel admin.
// Klik sekali: A→Z / kecil→besar. Klik lagi: Z→A / besar→kecil.
// Klik ketiga: kembali ke urutan awal.

import { useState } from "react";

function bandingkan(a, b) {
  const kosongA = a === null || a === undefined || a === "";
  const kosongB = b === null || b === undefined || b === "";
  if (kosongA && kosongB) return 0;
  if (kosongA) return 1;
  if (kosongB) return -1;

  if (typeof a === "boolean" || typeof b === "boolean") {
    return Number(b) - Number(a);
  }

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b), "id", {
    numeric: true,
    sensitivity: "base",
  });
}

// kolom: { kunci: (baris) => nilai yang dipakai untuk mengurutkan }
export function useUrut(data, kolom, awal = null) {
  const [status, setStatus] = useState(awal || { kunci: null, arah: "asc" });

  function ganti(kunci) {
    setStatus((s) => {
      if (s.kunci !== kunci) return { kunci, arah: "asc" };
      if (s.arah === "asc") return { kunci, arah: "desc" };
      return { kunci: null, arah: "asc" };
    });
  }

  let hasil = data || [];
  if (status.kunci && kolom[status.kunci]) {
    const ambil = kolom[status.kunci];
    const kali = status.arah === "asc" ? 1 : -1;
    hasil = [...hasil]
      .map((baris, i) => ({ baris, i }))
      .sort((x, y) => {
        const c = bandingkan(ambil(x.baris), ambil(y.baris));
        return c !== 0 ? c * kali : x.i - y.i;
      })
      .map((x) => x.baris);
  }

  return { data: hasil, kunci: status.kunci, arah: status.arah, ganti };
}

// Judul kolom yang bisa diklik untuk mengurutkan
export function KolomUrut({ urut, kunci, children, className, style }) {
  const aktif = urut.kunci === kunci;
  const arah = aktif ? urut.arah : null;

  return (
    <th
      className={className}
      style={style}
      aria-sort={
        arah === "asc" ? "ascending" : arah === "desc" ? "descending" : "none"
      }
    >
      <button
        type="button"
        className={`urut-btn ${aktif ? "aktif" : ""}`}
        onClick={() => urut.ganti(kunci)}
        title="Klik untuk mengurutkan"
      >
        <span>{children}</span>
        <svg
          className="urut-ikon"
          width="10"
          height="14"
          viewBox="0 0 10 14"
          aria-hidden="true"
        >
          <path
            d="M5 1 9 6H1Z"
            className={arah === "asc" ? "nyala" : ""}
          />
          <path
            d="M5 13 1 8h8Z"
            className={arah === "desc" ? "nyala" : ""}
          />
        </svg>
      </button>
    </th>
  );
}
