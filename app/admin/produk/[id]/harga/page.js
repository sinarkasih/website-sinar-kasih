"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "../../../../../lib/supabase";

export default function HargaProdukPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const [produk, setProduk] = useState(null);
  const [hargaLama, setHargaLama] = useState(null);

  const [modeHarga, setModeHarga] = useState("pasti");
  const [harga, setHarga] = useState("");
  const [hargaMin, setHargaMin] = useState("");
  const [hargaMax, setHargaMax] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [productId]);

  async function loadData() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const { data: produkData, error: produkError } =
      await supabase
        .from("produk")
        .select("id, nama, sku")
        .eq("id", productId)
        .maybeSingle();

    if (produkError) {
      setError(produkError.message);
      setLoading(false);
      return;
    }

    if (!produkData) {
      setError("Produk tidak ditemukan.");
      setLoading(false);
      return;
    }

    setProduk(produkData);

    const { data: hargaData, error: hargaError } =
      await supabase
        .from("harga_produk")
        .select(
          "id, produk_id, variasi_id, mode_harga, harga, harga_min, harga_max, aktif"
        )
        .eq("produk_id", productId)
        .eq("aktif", true)
        .is("variasi_id", null)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (hargaError) {
      setError(hargaError.message);
      setLoading(false);
      return;
    }

    if (hargaData) {
      setHargaLama(hargaData);
      setModeHarga(hargaData.mode_harga || "pasti");

      setHarga(
        hargaData.harga !== null &&
          hargaData.harga !== undefined
          ? String(hargaData.harga)
          : ""
      );

      setHargaMin(
        hargaData.harga_min !== null &&
          hargaData.harga_min !== undefined
          ? String(hargaData.harga_min)
          : ""
      );

      setHargaMax(
        hargaData.harga_max !== null &&
          hargaData.harga_max !== undefined
          ? String(hargaData.harga_max)
          : ""
      );
    }

    setLoading(false);
  }

  function formatRupiah(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setSaving(false);
      return;
    }

    /*
      Ambil nilai LANGSUNG dari input form.
      Jadi tidak bergantung pada state React.
    */

    const form = e.currentTarget;

    const rawHarga =
      form.elements.harga?.value || "";

    const rawHargaMin =
      form.elements.harga_min?.value || "";

    const rawHargaMax =
      form.elements.harga_max?.value || "";

    const hargaNumber =
      rawHarga === ""
        ? null
        : Number(rawHarga);

    const hargaMinNumber =
      rawHargaMin === ""
        ? null
        : Number(rawHargaMin);

    const hargaMaxNumber =
      rawHargaMax === ""
        ? null
        : Number(rawHargaMax);

    /*
      Untuk harga pasti dan mulai dari.
    */

    if (
      modeHarga === "pasti" ||
      modeHarga === "mulai_dari"
    ) {
      if (
        hargaNumber === null ||
        Number.isNaN(hargaNumber)
      ) {
        setError(
          "Silakan masukkan angka harga."
        );
        setSaving(false);
        return;
      }
    }

    /*
      Untuk range harga.
    */

    if (modeHarga === "range") {
      if (
        hargaMinNumber === null ||
        Number.isNaN(hargaMinNumber) ||
        hargaMaxNumber === null ||
        Number.isNaN(hargaMaxNumber)
      ) {
        setError(
          "Silakan masukkan harga minimum dan maksimum."
        );
        setSaving(false);
        return;
      }

      if (hargaMinNumber > hargaMaxNumber) {
        setError(
          "Harga minimum tidak boleh lebih besar dari harga maksimum."
        );
        setSaving(false);
        return;
      }
    }

    /*
      Nonaktifkan harga aktif sebelumnya.
    */

    const { error: deactivateError } =
      await supabase
        .from("harga_produk")
        .update({
          aktif: false,
        })
        .eq("produk_id", productId)
        .is("variasi_id", null)
        .eq("aktif", true);

    if (deactivateError) {
      setError(
        "Gagal memperbarui harga lama: " +
          deactivateError.message
      );
      setSaving(false);
      return;
    }

    /*
      Data yang akan disimpan.
    */

    const payload = {
      produk_id: Number(productId),
      variasi_id: null,
      mode_harga: modeHarga,

      harga:
        modeHarga === "pasti" ||
        modeHarga === "mulai_dari"
          ? hargaNumber
          : null,

      harga_min:
        modeHarga === "range"
          ? hargaMinNumber
          : null,

      harga_max:
        modeHarga === "range"
          ? hargaMaxNumber
          : null,

      aktif: true,
    };

    /*
      Simpan langsung ke Supabase.
    */

    const {
      data,
      error: insertError,
    } = await supabase
      .from("harga_produk")
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      setError(
        "Gagal menyimpan harga: " +
          insertError.message
      );
      setSaving(false);
      return;
    }

    setHargaLama(data);

    setMessage(
      "Harga produk berhasil disimpan."
    );

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="admin-content">
        <div className="admin-card">
          Memuat data harga...
        </div>
      </main>
    );
  }

  if (!produk) {
    return (
      <main className="admin-content">
        <div className="admin-message admin-message-error">
          Produk tidak ditemukan.
        </div>
      </main>
    );
  }

  return (
    <main className="admin-content">

      <div className="admin-page-header">

        <div>
          <h1>Harga Produk</h1>

          <p>
            Atur harga untuk produk{" "}
            <strong>{produk.nama}</strong>.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() =>
            router.push("/admin/produk")
          }
        >
          ← Kembali
        </button>

      </div>

      <div className="admin-card">

        <div className="admin-price-product-info">

          <div>
            <span>Produk</span>
            <strong>{produk.nama}</strong>
          </div>

          <div>
            <span>SKU</span>
            <strong>
              {produk.sku || "-"}
            </strong>
          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="admin-form"
        >

          <div className="admin-form-group">

            <label>Mode Harga *</label>

            <div className="admin-price-options">

              <label
                className={
                  modeHarga === "pasti"
                    ? "admin-price-option selected"
                    : "admin-price-option"
                }
              >

                <input
                  type="radio"
                  name="mode_harga"
                  value="pasti"
                  checked={
                    modeHarga === "pasti"
                  }
                  onChange={() =>
                    setModeHarga("pasti")
                  }
                />

                <span>
                  <strong>
                    Harga Pasti
                  </strong>

                  <small>
                    Contoh: Rp25.000
                  </small>
                </span>

              </label>

              <label
                className={
                  modeHarga === "range"
                    ? "admin-price-option selected"
                    : "admin-price-option"
                }
              >

                <input
                  type="radio"
                  name="mode_harga"
                  value="range"
                  checked={
                    modeHarga === "range"
                  }
                  onChange={() =>
                    setModeHarga("range")
                  }
                />

                <span>
                  <strong>
                    Range Harga
                  </strong>

                  <small>
                    Contoh: Rp20.000 - Rp30.000
                  </small>
                </span>

              </label>

              <label
                className={
                  modeHarga === "mulai_dari"
                    ? "admin-price-option selected"
                    : "admin-price-option"
                }
              >

                <input
                  type="radio"
                  name="mode_harga"
                  value="mulai_dari"
                  checked={
                    modeHarga === "mulai_dari"
                  }
                  onChange={() =>
                    setModeHarga("mulai_dari")
                  }
                />

                <span>
                  <strong>
                    Mulai Dari
                  </strong>

                  <small>
                    Contoh: Mulai Rp20.000
                  </small>
                </span>

              </label>

              <label
                className={
                  modeHarga === "hubungi"
                    ? "admin-price-option selected"
                    : "admin-price-option"
                }
              >

                <input
                  type="radio"
                  name="mode_harga"
                  value="hubungi"
                  checked={
                    modeHarga === "hubungi"
                  }
                  onChange={() =>
                    setModeHarga("hubungi")
                  }
                />

                <span>
                  <strong>
                    Hubungi Kami
                  </strong>

                  <small>
                    Harga tidak ditampilkan
                  </small>
                </span>

              </label>

            </div>

          </div>

          {(modeHarga === "pasti" ||
            modeHarga === "mulai_dari") && (

            <div className="admin-form-group">

              <label>
                {modeHarga === "pasti"
                  ? "Harga"
                  : "Harga Mulai"}
              </label>

              <div className="admin-price-input">

                <span>Rp</span>

                <input
                  name="harga"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={harga}
                  placeholder="25000"
                />

              </div>

            </div>

          )}

          {modeHarga === "range" && (

            <div className="admin-form-grid">

              <div className="admin-form-group">

                <label>
                  Harga Minimum
                </label>

                <div className="admin-price-input">

                  <span>Rp</span>

                  <input
                    name="harga_min"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={hargaMin}
                    placeholder="20000"
                  />

                </div>

              </div>

              <div className="admin-form-group">

                <label>
                  Harga Maksimum
                </label>

                <div className="admin-price-input">

                  <span>Rp</span>

                  <input
                    name="harga_max"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={hargaMax}
                    placeholder="30000"
                  />

                </div>

              </div>

            </div>

          )}

          {hargaLama && (

            <div className="admin-current-price">

              <span>
                Harga aktif saat ini
              </span>

              <strong>

                {hargaLama.mode_harga ===
                  "pasti" &&
                  formatRupiah(
                    hargaLama.harga
                  )}

                {hargaLama.mode_harga ===
                  "mulai_dari" &&
                  `Mulai ${formatRupiah(
                    hargaLama.harga
                  )}`}

                {hargaLama.mode_harga ===
                  "range" &&
                  `${formatRupiah(
                    hargaLama.harga_min
                  )} - ${formatRupiah(
                    hargaLama.harga_max
                  )}`}

                {hargaLama.mode_harga ===
                  "hubungi" &&
                  "Hubungi Kami"}

              </strong>

            </div>

          )}

          {error && (

            <div className="admin-message admin-message-error">
              {error}
            </div>

          )}

          {message && (

            <div className="admin-message admin-message-success">
              {message}
            </div>

          )}

          <button
            type="submit"
            className="admin-primary-button"
            disabled={saving}
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Harga"}
          </button>

        </form>

      </div>

    </main>
  );
}
