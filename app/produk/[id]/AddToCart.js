"use client";

// Lokasi file: app/produk/[id]/AddToCart.js
// Pilih jumlah lalu tambah ke troli. Pembeli tetap di halaman produk
// dan mendapat pesan "sudah masuk troli" beserta tombol ke Troli.

import { useState } from "react";
import Link from "next/link";

const KUNCI_TROLI = "sinar_kasih_cart";
const MAKS = 999;

export default function AddToCart({ product }) {
  const [qty, setQty] = useState(1);
  const [berhasil, setBerhasil] = useState(null);

  function ubah(n) {
    setQty((q) => Math.min(MAKS, Math.max(1, (Number(q) || 1) + n)));
  }

  function ketik(nilai) {
    const angka = nilai.replace(/\D/g, "");
    if (angka === "") {
      setQty("");
      return;
    }
    setQty(Math.min(MAKS, Math.max(1, Number(angka))));
  }

  function tambah() {
    const jumlah = Math.max(1, Number(qty) || 1);
    let troli = [];
    try {
      troli = JSON.parse(localStorage.getItem(KUNCI_TROLI) || "[]");
      if (!Array.isArray(troli)) troli = [];
    } catch {
      troli = [];
    }

    const ada = troli.find((item) => item.id === product.id);
    if (ada) {
      ada.qty = Math.min(MAKS, (Number(ada.qty) || 0) + jumlah);
    } else {
      troli.push({
        id: product.id,
        nama: product.nama,
        harga: product.harga || 0,
        mode_harga: product.mode_harga || "hubungi",
        harga_min: product.harga_min || 0,
        harga_max: product.harga_max || 0,
        gambar: product.gambar || "",
        qty: jumlah,
      });
    }

    try {
      localStorage.setItem(KUNCI_TROLI, JSON.stringify(troli));
    } catch {
      window.alert("Troli tidak dapat disimpan di browser ini.");
      return;
    }
    window.dispatchEvent(new Event("sinar-kasih-cart-updated"));

    const total = troli.find((item) => item.id === product.id)?.qty || jumlah;
    setBerhasil(total);
    setQty(1);
  }

  return (
    <div className="pd-beli">
      <div className="pd-beli-baris">
        <div className="pd-qty">
          <button type="button" onClick={() => ubah(-1)} disabled={Number(qty) <= 1} aria-label="Kurangi jumlah">
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max={MAKS}
            value={qty}
            onChange={(e) => ketik(e.target.value)}
            onBlur={() => { if (!qty) setQty(1); }}
            aria-label="Jumlah"
          />
          <button type="button" onClick={() => ubah(1)} disabled={Number(qty) >= MAKS} aria-label="Tambah jumlah">
            +
          </button>
        </div>
        <button type="button" className="btn pd-tambah" onClick={tambah}>
          Tambah ke Troli
        </button>
      </div>

      {berhasil !== null && (
        <div className="pd-berhasil" role="status">
          <span>Sudah masuk troli ({berhasil} di troli).</span>
          <Link href="/troli">Lihat Troli →</Link>
        </div>
      )}
    </div>
  );
}
