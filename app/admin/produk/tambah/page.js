"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../../lib/supabase";

export default function TambahProdukPage() {
  const router = useRouter();

  const [kategori, setKategori] = useState([]);
  const [brand, setBrand] = useState([]);

  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    sku: "",
    slug: "",
    kategori_id: "",
    brand_id: "",
    satuan: "pcs",
    stok: 0,
    aktif: true,
  });

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoadingData(false);
      return;
    }

    const [kategoriResult, brandResult] = await Promise.all([
      supabase
        .from("kategori")
        .select("id, nama")
        .eq("aktif", true)
        .order("nama"),

      supabase
        .from("brand")
        .select("id, nama")
        .eq("aktif", true)
        .order("nama"),
    ]);

    if (kategoriResult.error) {
      setError("Kategori gagal dimuat.");
      setLoadingData(false);
      return;
    }

    if (brandResult.error) {
      setError("Brand gagal dimuat.");
      setLoadingData(false);
      return;
    }

    setKategori(kategoriResult.data || []);
    setBrand(brandResult.data || []);
    setLoadingData(false);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function buatSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNamaChange(e) {
    const value = e.target.value;

    setForm((current) => ({
      ...current,
      nama: value,
      slug: buatSlug(value),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setSaving(false);
      return;
    }

    const nama = form.nama.trim();
    const sku = form.sku.trim();
    const slug = form.slug.trim() || buatSlug(nama);
    const satuan = form.satuan.trim() || "pcs";
    const stok = Number(form.stok);

    if (!nama) {
      setError("Nama produk wajib diisi.");
      setSaving(false);
      return;
    }

    if (!slug) {
      setError("Slug produk wajib diisi.");
      setSaving(false);
      return;
    }

    if (Number.isNaN(stok) || stok < 0) {
      setError("Stok tidak boleh kurang dari 0.");
      setSaving(false);
      return;
    }

    // Cek SKU hanya jika SKU diisi.
    if (sku) {
      const { data: existingSku, error: skuCheckError } = await supabase
        .from("produk")
        .select("id")
        .eq("sku", sku)
        .limit(1);

      if (skuCheckError) {
        setError("Gagal memeriksa SKU produk.");
        setSaving(false);
        return;
      }

      if (existingSku && existingSku.length > 0) {
        setError(
          'SKU "' + sku + '" sudah digunakan oleh produk lain.'
        );
        setSaving(false);
        return;
      }
    }

    // Cek slug agar tidak ada slug yang sama.
    const { data: existingSlug, error: slugCheckError } = await supabase
      .from("produk")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (slugCheckError) {
      setError("Gagal memeriksa slug produk.");
      setSaving(false);
      return;
    }

    if (existingSlug && existingSlug.length > 0) {
      setError(
        'Slug "' + slug + '" sudah digunakan. Silakan ubah slug produk.'
      );
      setSaving(false);
      return;
    }

    const payload = {
      nama,
      deskripsi: form.deskripsi.trim() || null,
      sku: sku || null,
      slug,
      kategori_id: form.kategori_id
        ? Number(form.kategori_id)
        : null,
      brand_id: form.brand_id
        ? Number(form.brand_id)
        : null,
      satuan,
      stok,
      aktif: form.aktif,
    };

    const { data, error: insertError } = await supabase
      .from("produk")
      .insert(payload)
      .select("id, nama")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setMessage(
      'Produk "' + data.nama + '" berhasil ditambahkan.'
    );

    setTimeout(() => {
      router.push("/admin/produk");
    }, 1200);
  }

  if (loadingData) {
    return (
      <main className="admin-content">
        <div className="admin-card">
          Memuat data kategori dan brand...
        </div>
      </main>
    );
  }

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Tambah Produk</h1>
          <p>
            Tambahkan produk baru ke katalog Sinar Kasih.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() => router.push("/admin/produk")}
        >
          ← Kembali
        </button>
      </div>

      <div>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="pf-tata">
            <div className="pf-kiri admin-card">
              <h2 className="pf-judul">Informasi Produk</h2>
          <div className="admin-form-group">
            <label>Nama Produk *</label>

            <input
              name="nama"
              value={form.nama}
              onChange={handleNamaChange}
              placeholder="Contoh: Philips LED Essential 9W"
              required
            />
          </div>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Kategori</label>

              <select
                name="kategori_id"
                value={form.kategori_id}
                onChange={handleChange}
              >
                <option value="">Pilih kategori</option>

                {kategori.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Brand</label>

              <select
                name="brand_id"
                value={form.brand_id}
                onChange={handleChange}
              >
                <option value="">Pilih brand</option>

                {brand.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="admin-form-group">
            <label>Deskripsi</label>

            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              rows="6"
              placeholder="Deskripsi produk..."
            />
          </div>
            </div>

            <div className="pf-kanan">
              <div className="admin-card">
                <h2 className="pf-judul">Status Produk</h2>
          <div className="admin-form-checkbox">
            <input
              type="checkbox"
              id="aktif"
              name="aktif"
              checked={form.aktif}
              onChange={handleChange}
            />

            <label htmlFor="aktif">
              Produk aktif dan dapat ditampilkan di website
            </label>
          </div>
              </div>

              <div className="admin-card">
                <h2 className="pf-judul">Stok &amp; Satuan</h2>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Satuan</label>

              <input
                name="satuan"
                value={form.satuan}
                onChange={handleChange}
                placeholder="pcs"
              />
            </div>

            <div className="admin-form-group">
              <label>Stok</label>

              <input
                type="number"
                name="stok"
                min="0"
                value={form.stok}
                onChange={handleChange}
              />
            </div>
          </div>
              </div>

              <div className="admin-card">
                <h2 className="pf-judul">Kode &amp; Alamat Produk</h2>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>SKU</label>

              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="Contoh: PH-LED-9W"
              />
            </div>

            <div className="admin-form-group">
              <label>Slug</label>

              <input
                name="slug"
                value={form.slug}
                readOnly
                placeholder="otomatis dari nama produk"
                style={{ background: "#f6f1ea", color: "#7d6957" }}
              />
              <small style={{ display: "block", marginTop: "6px", color: "#9a8571", fontSize: "12.5px" }}>
                Dibuat otomatis dari nama produk.
              </small>
            </div>
          </div>
              </div>
            </div>
          </div>

          <div className="pf-bawah">

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
            {saving ? "Menyimpan..." : "Simpan Produk"}
          </button>
          </div>
        </form>
      </div>
    </main>
  );
}
