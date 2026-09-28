"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../../../lib/supabase";

export default function TambahVariasiPage() {
  const router = useRouter();

  const [produk, setProduk] = useState([]);
  const [produkId, setProdukId] =
    useState("");

  const [nama, setNama] = useState("");
  const [nilai, setNilai] = useState("");
  const [sku, setSku] = useState("");
  const [stok, setStok] = useState("0");
  const [urutan, setUrutan] =
    useState("0");
  const [aktif, setAktif] =
    useState(true);

  const [loadingProduk, setLoadingProduk] =
    useState(true);
  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadProduk();
  }, []);

  async function loadProduk() {
    setLoadingProduk(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      setLoadingProduk(false);
      return;
    }

    const {
      data,
      error: produkError,
    } = await supabase
      .from("produk")
      .select(
        "id, nama, sku, aktif"
      )
      .eq("aktif", true)
      .order("nama", {
        ascending: true,
      });

    if (produkError) {
      setError(
        "Gagal mengambil produk: " +
          produkError.message
      );
      setLoadingProduk(false);
      return;
    }

    setProduk(data || []);
    setLoadingProduk(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      setSaving(false);
      return;
    }

    if (!produkId) {
      setError(
        "Produk wajib dipilih."
      );
      setSaving(false);
      return;
    }

    if (!nama.trim()) {
      setError(
        "Nama variasi wajib diisi."
      );
      setSaving(false);
      return;
    }

    if (!nilai.trim()) {
      setError(
        "Nilai variasi wajib diisi."
      );
      setSaving(false);
      return;
    }

    const stokNumber =
      Number(stok) || 0;

    const urutanNumber =
      Number(urutan) || 0;

    if (stokNumber < 0) {
      setError(
        "Stok tidak boleh kurang dari 0."
      );
      setSaving(false);
      return;
    }

    if (urutanNumber < 0) {
      setError(
        "Urutan tidak boleh kurang dari 0."
      );
      setSaving(false);
      return;
    }

    const {
      error: insertError,
    } = await supabase
      .from("variasi_produk")
      .insert({
        produk_id: Number(produkId),
        nama: nama.trim(),
        nilai: nilai.trim(),
        sku: sku.trim() || null,
        stok: stokNumber,
        aktif,
        urutan: urutanNumber,
      });

    if (insertError) {
      setError(
        "Gagal menambahkan variasi: " +
          insertError.message
      );
      setSaving(false);
      return;
    }

    setMessage(
      "Variasi berhasil ditambahkan. Mengembalikan ke daftar variasi..."
    );

    setSaving(false);

    setTimeout(() => {
      router.push(
        "/admin/produk/variasi"
      );
    }, 700);
  }

  return (
    <main className="admin-content">

      <div className="admin-page-header">

        <div>
          <h1>Tambah Variasi Produk</h1>

          <p>
            Tambahkan variasi baru ke
            produk.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() =>
            router.push(
              "/admin/produk/variasi"
            )
          }
        >
          ← Kembali
        </button>

      </div>

      <div className="admin-card">

        <form
          onSubmit={handleSubmit}
          className="admin-form"
        >

          <div className="admin-form-group">

            <label>
              Produk *
            </label>

            <select
              value={produkId}
              onChange={(e) =>
                setProdukId(
                  e.target.value
                )
              }
              disabled={loadingProduk}
              required
            >
              <option value="">
                {loadingProduk
                  ? "Memuat produk..."
                  : "Pilih produk"}
              </option>

              {produk.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.nama}
                  {item.sku
                    ? ` — ${item.sku}`
                    : ""}
                </option>
              ))}
            </select>

          </div>

          <div className="admin-form-grid">

            <div className="admin-form-group">

              <label>
                Nama Variasi *
              </label>

              <input
                type="text"
                value={nama}
                onChange={(e) =>
                  setNama(e.target.value)
                }
                placeholder="Contoh: Watt"
                required
              />

              <small>
                Contoh: Watt, Warna,
                Ukuran, Model.
              </small>

            </div>

            <div className="admin-form-group">

              <label>
                Nilai Variasi *
              </label>

              <input
                type="text"
                value={nilai}
                onChange={(e) =>
                  setNilai(e.target.value)
                }
                placeholder="Contoh: 9W"
                required
              />

              <small>
                Contoh: 5W, 9W, Putih,
                Warm White.
              </small>

            </div>

          </div>

          <div className="admin-form-grid">

            <div className="admin-form-group">

              <label>
                SKU
              </label>

              <input
                type="text"
                value={sku}
                onChange={(e) =>
                  setSku(e.target.value)
                }
                placeholder="Contoh: PHL-9W"
              />

            </div>

            <div className="admin-form-group">

              <label>
                Stok
              </label>

              <input
                type="number"
                min="0"
                value={stok}
                onChange={(e) =>
                  setStok(e.target.value)
                }
              />

            </div>

          </div>

          <div className="admin-form-grid">

            <div className="admin-form-group">

              <label>
                Urutan
              </label>

              <input
                type="number"
                min="0"
                value={urutan}
                onChange={(e) =>
                  setUrutan(e.target.value)
                }
              />

              <small>
                Semakin kecil angka,
                semakin awal ditampilkan.
              </small>

            </div>

            <div className="admin-form-group">

              <label>
                Status
              </label>

              <label className="admin-form-checkbox">

                <input
                  type="checkbox"
                  checked={aktif}
                  onChange={(e) =>
                    setAktif(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Variasi Aktif
                </span>

              </label>

            </div>

          </div>

          <div className="admin-message">
            Harga variasi tidak diatur
            di halaman ini. Harga dapat
            menggunakan sistem harga produk
            yang sudah kita buat.
          </div>

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
            disabled={
              saving || loadingProduk
            }
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Variasi"}
          </button>

        </form>

      </div>

    </main>
  );
}
