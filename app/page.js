"use client";

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
  }

  function changeQty(id, amount) {
    const nextCart = cart
      .map((item) =>
        item.id === id
          ? { ...item, qty: item.qty + amount }
          : item
      )
      .filter((item) => item.qty > 0);

    saveCart(nextCart);
  }

  function removeItem(id) {
    saveCart(
      cart.filter((item) => item.id !== id)
    );
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

    return "Hubungi kami";
  }

  return (
    <section className="section">
      <div className="wrap">
        <h1>Troli</h1>

        {cart.length === 0 ? (
          <div className="notice">
            Troli masih kosong.
            <br />
            <br />
            <Link href="/kategori">
              ← Belanja Produk
            </Link>
          </div>
        ) : (
          <>
            <div className="cards">
              {cart.map((item) => (
                <div
                  className="card"
                  key={item.id}
                >
                  <div className="img">
                    {item.gambar ? (
                      <img
                        src={item.gambar}
                        alt={item.nama}
                      />
                    ) : (
                      "Foto Produk"
                    )}
                  </div>

                  <h3>{item.nama}</h3>

                  <div className="price">
                    {getDisplayPrice(item)}
                  </div>

                  <p>
                    Jumlah: {item.qty}
                  </p>

                  <div>
                    <button
                      className="btn"
                      type="button"
                      onClick={() =>
                        changeQty(item.id, -1)
                      }
                    >
                      −
                    </button>

                    <button
                      className="btn"
                      type="button"
                      onClick={() =>
                        changeQty(item.id, 1)
                      }
                    >
                      +
                    </button>

                    <button
                      className="btn"
                      type="button"
                      onClick={() =>
                        removeItem(item.id)
                      }
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="notice">
              <b>Jumlah produk:</b>{" "}
              {cart.reduce(
                (total, item) =>
                  total + item.qty,
                0
              )}

              <br />
              <br />

              <Link
                href="/checkout"
                className="btn"
              >
                Lanjut Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
