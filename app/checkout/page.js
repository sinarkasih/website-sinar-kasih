"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "../../lib/supabase";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [branches, setBranches] = useState([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [nama, setNama] = useState("");
  const [nomorWhatsapp, setNomorWhatsapp] = useState("");
  const [cabangId, setCabangId] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCheckout() {
      const savedCart = JSON.parse(
        localStorage.getItem("sinar_kasih_cart") || "[]"
      );

      setCart(savedCart);

      const supabase = getSupabase();

      if (!supabase) {
        setErrorMessage("Koneksi Supabase belum tersedia.");
        setLoading(false);
        return;
      }

      const { data: branchData, error: branchError } = await supabase
        .from("cabang_toko")
        .select("id, nama, alamat")
        .eq("aktif", true)
        .order("urutan", { ascending: true });

      if (branchError) {
        setErrorMessage(branchError.message);
        setLoading(false);
        return;
      }

      setBranches(branchData || []);

      if (branchData?.length > 0) {
        setCabangId(String(branchData[0].id));
      }

      const { data: contactData, error: contactError } = await supabase
        .from("kontak_toko")
        .select("whatsapp")
        .eq("aktif", true)
        .limit(1)
        .maybeSingle();

      if (!contactError && contactData?.whatsapp) {
        setWhatsapp(contactData.whatsapp);
      }

      setLoading(false);
    }

    loadCheckout();
  }, []);

  function formatPrice(value) {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  }

  function displayPrice(item) {
    if (item.mode_harga === "pasti") {
      return formatPrice(item.harga);
    }

    if (item.mode_harga === "range") {
      return `${formatPrice(item.harga_min)} – ${formatPrice(
        item.harga_max
      )}`;
    }

    if (item.mode_harga === "mulai_dari") {
      return `Mulai ${formatPrice(
        item.harga_min || item.harga
      )}`;
    }

    return "Hubungi kami";
  }

  async function submitOrder(event) {
    event.preventDefault();

    setErrorMessage("");

    if (!nama.trim()) {
      setErrorMessage("Nama pelanggan wajib diisi.");
      return;
    }

    if (!nomorWhatsapp.trim()) {
      setErrorMessage("Nomor WhatsApp wajib diisi.");
      return;
    }

    if (!cabangId) {
      setErrorMessage("Silakan pilih cabang toko.");
      return;
    }

    if (cart.length === 0) {
      setErrorMessage("Troli masih kosong.");
      return;
    }

    const supabase = getSupabase();

    if (!supabase) {
      setErrorMessage("Koneksi Supabase belum tersedia.");
      return;
    }

    setProcessing(true);

    const items = cart.map((item) => ({
      produk_id: item.id,
      variasi_id: null,
      jumlah: item.qty,
    }));

    const { data, error } = await supabase.rpc(
      "buat_pesanan",
      {
        p_nama: nama.trim(),
        p_whatsapp: nomorWhatsapp.trim(),
        p_cabang_id: Number(cabangId),
        p_catatan: catatan.trim() || null,
        p_items: items,
      }
    );

    if (error) {
      console.error("CHECKOUT ERROR:", error);
      setErrorMessage(error.message);
      setProcessing(false);
      return;
    }

    /*
      Function database sudah membuat pesanan.
      Kita kemudian menyiapkan pesan WhatsApp dari isi troli.
    */

    const selectedBranch = branches.find(
      (branch) => String(branch.id) === String(cabangId)
    );

    let message = `Halo Toko Listrik Sinar Kasih,%0A%0A`;
    message += `Saya ingin memesan:%0A`;

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.nama}%0A`;
      message += `   Jumlah: ${item.qty}%0A`;
      message += `   Harga: ${displayPrice(item)}%0A`;
    });

    message += `%0ANama: ${nama.trim()}%0A`;
    message += `WhatsApp: ${nomorWhatsapp.trim()}%0A`;

    if (selectedBranch) {
      message += `Cabang: ${selectedBranch.nama}%0A`;
    }

    if (catatan.trim()) {
      message += `Catatan: ${catatan.trim()}%0A`;
    }

    message += `%0AMohon konfirmasi ketersediaan dan harga final.`;

    localStorage.removeItem("sinar_kasih_cart");

    if (whatsapp) {
      const cleanWhatsapp = whatsapp.replace(/\D/g, "");

      window.location.href =
        `https://wa.me/${cleanWhatsapp}?text=${message}`;
    } else {
      setProcessing(false);
      setErrorMessage(
        "Pesanan sudah dibuat, tetapi nomor WhatsApp toko belum tersedia."
      );
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="wrap">
          <h1>Checkout</h1>
          <div className="notice">
            Memuat data checkout...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <h1>Checkout</h1>

        {cart.length === 0 ? (
          <div className="notice">
            Troli masih kosong.
            <br />
            <br />
            <Link href="/kategori">
              ← Kembali Belanja
            </Link>
          </div>
        ) : (
          <>
            <div className="notice">
              <b>Pesanan Anda</b>

              <div style={{ marginTop: "12px" }}>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: "10px",
                    }}
                  >
                    <b>{item.nama}</b>
                    <br />
                    Jumlah: {item.qty}
                    <br />
                    Harga: {displayPrice(item)}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={submitOrder}>
              <div style={{ marginTop: "20px" }}>
                <label>
                  <b>Nama</b>
                </label>

                <input
                  className="search"
                  value={nama}
                  onChange={(event) =>
                    setNama(event.target.value)
                  }
                  placeholder="Nama Anda"
                  required
                />
              </div>

              <div style={{ marginTop: "15px" }}>
                <label>
                  <b>Nomor WhatsApp</b>
                </label>

                <input
                  className="search"
                  value={nomorWhatsapp}
                  onChange={(event) =>
                    setNomorWhatsapp(event.target.value)
                  }
                  placeholder="08xxxxxxxxxx"
                  type="tel"
                  required
                />
              </div>

              <div style={{ marginTop: "15px" }}>
                <label>
                  <b>Pilih Cabang Toko</b>
                </label>

                <select
                  className="search"
                  value={cabangId}
                  onChange={(event) =>
                    setCabangId(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Pilih cabang
                  </option>

                  {branches.map((branch) => (
                    <option
                      key={branch.id}
                      value={branch.id}
                    >
                      {branch.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: "15px" }}>
                <label>
                  <b>Catatan Pesanan</b>
                </label>

                <textarea
                  className="search"
                  value={catatan}
                  onChange={(event) =>
                    setCatatan(event.target.value)
                  }
                  placeholder="Contoh: Tolong konfirmasi stok terlebih dahulu."
                  rows={4}
                />
              </div>

              {errorMessage && (
                <div
                  className="notice"
                  style={{ marginTop: "15px" }}
                >
                  <b>Checkout:</b> {errorMessage}
                </div>
              )}

              <div style={{ marginTop: "20px" }}>
                <button
                  className="btn"
                  type="submit"
                  disabled={processing}
                >
                  {processing
                    ? "Memproses..."
                    : "Buat Pesanan & WhatsApp"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
