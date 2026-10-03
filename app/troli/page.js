"use client";

// Lokasi file: app/troli/page.js
// Troli: jejak Beranda › Troli, daftar produk, ubah jumlah, ringkasan & checkout.

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("sinar_kasih_cart") || "[]"
    );

    setCart(saved);
  }, []);

  function saveCart(nextCart) {
    setCart(nextCart);

    localStorage.setItem(
      "sinar_kasih_cart",
      JSON.stringify(nextCart)
    );

    window.dispatchEvent(
      new Event("sinar-kasih-cart-updated")
    );
  }

  function changeQty(id, amount) {
    const nextCart = cart
      .map((item) =>
        item.id === id
          ? {
              ...item,
              qty: item.qty + amount,
            }
          : item
      )
      .filter((item) => item.qty > 0);

    saveCart(nextCart);
  }

  function removeItem(id) {
    const nextCart = cart.filter(
      (item) => item.id !== id
    );

    saveCart(nextCart);
  }

  function getDisplayPrice(item) {
    if (item.mode_harga === "pasti") {
      return `Rp ${Number(
        item.harga || 0
      ).toLocaleString("id-ID")}`;
    }

    if (item.mode_harga === "range") {
      return `Rp ${Number(
        item.harga_min || 0
      ).toLocaleString("id-ID")} – Rp ${Number(
        item.harga_max || 0
      ).toLocaleString("id-ID")}`;
    }

    if (item.mode_harga === "mulai_dari") {
      return `Mulai Rp ${Number(
        item.harga_min || item.harga || 0
      ).toLocaleString("id-ID")}`;
    }

    if (item.mode_harga === "hubungi") {
      return "Hubungi kami";
    }

    return "Harga tersedia";
  }

  const totalItems = cart.reduce(
    (total, item) =>
      total + Math.max(0, Number(item.qty) || 0),
    0
  );

  return (
    <section className="section halaman-atas">
      <div className="wrap">
        <nav className="jejak" aria-label="Posisi halaman">
          <Link href="/">Beranda</Link>
          <span>›</span>
          <strong>Troli</strong>
        </nav>

        <div className="kepala-halaman">
          <h1>Troli</h1>
          <p>Periksa produk yang akan Anda pesan sebelum checkout.</p>
        </div>

        {cart.length === 0 ? (
          <div className="kosong-cantik">
            <h2>Troli masih kosong</h2>
            <p>Yuk, pilih produk kebutuhan listrik Anda terlebih dahulu.</p>
            <a href="/kategori" className="btn">
              Belanja Produk
            </a>
          </div>
        ) : (
          <div className="troli-tata">
            <div className="troli-daftar">
              {cart.map((item) => (
                <div className="troli-baris" key={item.id}>
                  <div className="troli-foto">
                    {item.gambar ? (
                      <img src={item.gambar} alt={item.nama} />
                    ) : (
                      <span>Foto</span>
                    )}
                  </div>

                  <div className="troli-info">
                    <h3>{item.nama}</h3>
                    <span className="troli-harga">
                      {getDisplayPrice(item)}
                    </span>
                  </div>

                  <div className="troli-jumlah">
                    <button
                      type="button"
                      onClick={() => changeQty(item.id, -1)}
                      aria-label="Kurangi"
                    >
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(item.id, 1)}
                      aria-label="Tambah"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="troli-hapus"
                    onClick={() => removeItem(item.id)}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            <aside className="troli-ringkas">
              <h2>Ringkasan</h2>
              <div className="troli-total">
                <span>Jumlah produk</span>
                <strong>{totalItems}</strong>
              </div>
              <a href="/checkout" className="btn troli-checkout">
                Lanjut Checkout
              </a>
              <a href="/kategori" className="troli-lanjut">
                ← Lanjut belanja
              </a>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
