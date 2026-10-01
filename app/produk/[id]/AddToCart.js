"use client";

export default function AddToCart({ product }) {
  function addToCart() {
    const current = JSON.parse(
      localStorage.getItem("sinar_kasih_cart") || "[]"
    );

    const existing = current.find(
      (item) => item.id === product.id
    );

    if (existing) {
      existing.qty += 1;
    } else {
      current.push({
        id: product.id,
        nama: product.nama,
        harga: product.harga || 0,
        mode_harga: product.mode_harga || "pasti",
        harga_min: product.harga_min || 0,
        harga_max: product.harga_max || 0,
        gambar: product.gambar || "",
        qty: 1,
      });
    }

    localStorage.setItem(
      "sinar_kasih_cart",
      JSON.stringify(current)
    );

    window.dispatchEvent(
      new Event("sinar-kasih-cart-updated")
    );

    window.location.href = "/troli";
  }

  return (
    <button
      className="btn"
      onClick={addToCart}
    >
      Tambah ke Troli
    </button>
  );
}
