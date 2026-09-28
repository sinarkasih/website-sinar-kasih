"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "../../../../../../lib/supabase";

export default function EditVariasiPage() {
  const params = useParams();
  const router = useRouter();

  const variasiId = params.id;

  const [produk, setProduk] = useState([]);
  const [variasi, setVariasi] =
    useState(null);

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

  const [loading, setLoading] =
    useState(true);
  const [loadingProduk, setLoadingProduk] =
    useState(true);
  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (variasiId) {
      loadData();
    }
  }, [variasiId]);

  async function loadData() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      setLoading(false);
      return;
    }

    const {
      data: variasiData,
      error: variasiError,
    } = await supabase
      .from("variasi_produk")
      .select(`
        id,
        produk_id,
        nama,
        nilai,
        sku,
        stok,
        aktif,
        urutan
      `)
      .eq("id", variasiId)
      .maybeSingle();

    if (variasiError) {
      setError(
        "Gagal mengambil variasi: " +
          variasiError.message
      );
      setLoading(false);
      return;
    }

    if (!variasiData) {
      setError(
        "Variasi tidak ditemukan."
      );
      setLoading(false);
      return;
    }

    setVariasi(variasiData);

    setProdukId(
      String(variasiData.produk_id)
    );
    setNama(
      variasiData.nama || ""
    );
    setNilai(
      variasiData.nilai || ""
    );
    setSku(
      variasiData.sku || ""
    );
    setStok(
      String(variasiData.stok ?? 0)
    );
    setUrutan(
      String(variasiData.urutan ?? 0)
    );
    setAktif(
      Boolean(variasiData.aktif)
    );

    await loadProduk();

    setLoading(false);
  }

  async function loadProduk() {
    setLoadingProduk(true);

    const supabase = getSupabase();

    if (!supabase) {
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
      error: updateError,
    } = await supabase
      .from("variasi_produk")
      .update({
        produk_id: Number(produkId),
        nama: nama.trim(),
        nilai: nilai.trim(),
        sku: sku.trim() || null,
        stok: stokNumber,
        aktif,
        urutan: urutanNumber,
      })
      .eq("id", variasiId);

    if (updateError) {
      setError(
        "Gagal menyimpan perubahan: " +
          updateError.message
      );
      setSaving(false);
      return;
    }

    setMessage(
      "Variasi berhasil diperbarui. Mengembalikan ke daftar variasi..."
    );

    setSaving(false);

    setTimeout(() => {
      router.push(
        "/admin/produk/variasi"
      );
    }, 700);
  }

  if (loading) {
    return (
      <main className="admin-content">
        <div className="admin-card">
          Memuat data variasi...
        </div>
      </main>
    );
  }

  if (!variasi) {
    return (
      <main className="admin-content">
        <div className="admin-message admin-message-error">
          Variasi tidak ditemukan.
        </div>
      </main>
    );
  }

  return (
    <main className="admin-content">

      <div className="admin-page-header">

        <div>
          <h1>Edit Variasi Produk</h1>

          <p>
            Ubah informasi variasi produk.
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
            Harga variasi tidak diubah
            di halaman ini. Sistem harga
            menggunakan pengaturan harga
            yang sudah tersedia.
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

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <button
              type="submit"
              className="admin-primary-button"
              disabled={
                saving || loadingProduk
              }
            >
              {saving
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </button>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={() =>
                router.push(
                  "/admin/produk/variasi"
                )
              }
              disabled={saving}
            >
              Batal
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}
